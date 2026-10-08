const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const APP_ID = '936619743392459';
const PAGE_SIZE = 12;
const PAGE_DELAY_MS = 800;

export async function createSession(username) {
  const res = await fetch(`https://www.instagram.com/${username}/`, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Falha ao abrir perfil @${username}: HTTP ${res.status}`);
  }

  const cookies = res.headers.getSetCookie?.() || [];
  const cookieHeader = cookies.map((cookie) => cookie.split(';')[0]).join('; ');
  const csrf = cookieHeader.match(/csrftoken=([^;]+)/)?.[1];

  if (!csrf) {
    throw new Error(`Nao foi possivel obter csrftoken para @${username}`);
  }

  return { cookieHeader, csrf, appId: APP_ID };
}

function apiHeaders(session, username, extra = {}) {
  return {
    'User-Agent': USER_AGENT,
    'X-IG-App-ID': session.appId,
    'X-ASBD-ID': '129477',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: `https://www.instagram.com/${username}/reels/`,
    'X-CSRFToken': session.csrf,
    Cookie: session.cookieHeader,
    ...extra,
  };
}

export async function getUserId(username, session) {
  const res = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    { headers: apiHeaders(session, username) },
  );

  if (!res.ok) {
    throw new Error(`Falha ao buscar perfil @${username}: HTTP ${res.status}`);
  }

  const data = await res.json();
  const userId = data?.data?.user?.id;

  if (!userId) {
    throw new Error(`Conta @${username} nao encontrada ou indisponivel`);
  }

  return userId;
}

function mapClipMedia(media) {
  const views = media.play_count ?? media.ig_play_count ?? media.view_count ?? 0;

  return {
    shortcode: media.code,
    permalink: `https://www.instagram.com/reel/${media.code}/`,
    caption: media.caption?.text?.replace(/\s+/g, ' ').trim() ?? '',
    published_at: media.taken_at,
    views,
    likes: media.like_count ?? 0,
    duration_seconds: media.video_duration ?? '',
    media_type: media.product_type ?? 'clips',
    video_url: media.video_versions?.[0]?.url ?? '',
  };
}

export async function fetchAllVideos(username, { onPage } = {}) {
  const session = await createSession(username);
  const userId = await getUserId(username, session);
  const videos = [];
  let maxId;
  let page = 0;

  while (true) {
    page += 1;

    try {
      const body = new URLSearchParams({
        target_user_id: userId,
        page_size: String(PAGE_SIZE),
        include_feed_video: 'true',
        ...(maxId ? { max_id: maxId } : {}),
      });

      const res = await fetch('https://www.instagram.com/api/v1/clips/user/', {
        method: 'POST',
        headers: apiHeaders(session, username, {
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body,
      });

      if (!res.ok) {
        onPage?.({ page, status: 'error', httpStatus: res.status, count: videos.length });
        break;
      }

      const data = await res.json();

      for (const item of data.items || []) {
        if (item?.media?.code) {
          videos.push(mapClipMedia(item.media));
        }
      }

      onPage?.({
        page,
        status: 'ok',
        pageItems: data.items?.length ?? 0,
        count: videos.length,
        moreAvailable: Boolean(data.paging_info?.more_available),
      });

      if (!data.paging_info?.more_available || !data.paging_info?.max_id) {
        break;
      }

      maxId = data.paging_info.max_id;
      await new Promise((resolve) => setTimeout(resolve, PAGE_DELAY_MS));
    } catch (error) {
      onPage?.({
        page,
        status: 'error',
        message: error.message,
        count: videos.length,
      });
      break;
    }
  }

  videos.sort((a, b) => b.published_at - a.published_at);
  return videos;
}
