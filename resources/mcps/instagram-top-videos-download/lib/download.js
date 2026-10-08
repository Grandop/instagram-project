import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const APP_ID = '936619743392459';
const DOC_ID = '10015901848480474';
const DELAY_MS = 600;

const browserHeaders = {
  'User-Agent': USER_AGENT,
  'x-ig-app-id': APP_ID,
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function resolveVideoUrl(shortcode) {
  const variables = encodeURIComponent(JSON.stringify({ shortcode }));
  const url = `https://www.instagram.com/graphql/query?doc_id=${DOC_ID}&variables=${variables}`;

  const res = await fetch(url, { headers: browserHeaders });

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}`);
  }

  const data = await res.json();
  const videoUrl = data?.data?.xdt_shortcode_media?.video_url;

  if (!videoUrl) {
    throw new Error('video_url ausente em xdt_shortcode_media');
  }

  return videoUrl;
}

export async function downloadFile(url, destination) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Referer: 'https://www.instagram.com/',
    },
  });

  if (!res.ok) {
    throw new Error(`Download HTTP ${res.status}`);
  }

  if (!res.body) {
    throw new Error('Resposta sem corpo');
  }

  await pipeline(Readable.fromWeb(res.body), createWriteStream(destination));
}

export async function downloadTopVideos({ videos, quantity, outputDir, onProgress }) {
  await mkdir(outputDir, { recursive: true });

  const selected = videos.slice(0, quantity);
  const downloaded = [];
  const failed = [];
  let order = 0;

  for (const video of selected) {
    order += 1;
    const filename = `${order}_${video.shortcode}.mp4`;
    const destination = path.join(outputDir, filename);

    try {
      const videoUrl = await resolveVideoUrl(video.shortcode);
      await downloadFile(videoUrl, destination);

      const item = {
        order,
        shortcode: video.shortcode,
        likes: video.likes,
        file: destination,
        status: 'ok',
      };
      downloaded.push(item);
      onProgress?.(item);
    } catch (error) {
      const item = {
        order,
        shortcode: video.shortcode,
        likes: video.likes,
        status: 'error',
        message: error.message,
      };
      failed.push(item);
      onProgress?.(item);
    }

    if (order < selected.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  return { downloaded, failed, attempted: selected.length };
}
