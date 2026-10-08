import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CSV_HEADERS = [
  'shortcode',
  'permalink',
  'caption',
  'published_at',
  'views',
  'likes',
  'duration_seconds',
  'media_type',
  'video_url',
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

export function getCsvPath(account) {
  return path.join(PROJECT_ROOT, 'resources', 'videos', account, 'lista.csv');
}

export async function readVideoList(account) {
  const csvPath = getCsvPath(account);

  try {
    const content = await readFile(csvPath, 'utf8');
    const lines = content.trim().split(/\r?\n/).filter(Boolean);

    if (lines.length <= 1) {
      return [];
    }

    const header = parseCsvLine(lines[0]);
    const rows = [];

    for (const line of lines.slice(1)) {
      const values = parseCsvLine(line);
      const row = {};

      for (let i = 0; i < header.length; i += 1) {
        row[header[i]] = values[i] ?? '';
      }

      if (row.shortcode) {
        rows.push({
          shortcode: row.shortcode,
          permalink: row.permalink,
          caption: row.caption,
          published_at: Number(row.published_at) || 0,
          views: Number(row.views) || 0,
          likes: Number(row.likes) || 0,
          duration_seconds: row.duration_seconds,
          media_type: row.media_type,
          video_url: row.video_url,
        });
      }
    }

    return rows;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export function mergeVideoLists(fetched, existing) {
  const fetchedMap = new Map(fetched.map((video) => [video.shortcode, video]));
  const merged = [...fetched];

  for (const video of existing) {
    if (!fetchedMap.has(video.shortcode)) {
      merged.push(video);
    }
  }

  merged.sort((a, b) => b.published_at - a.published_at);
  return merged;
}

export async function writeVideoList(account, videos) {
  const csvPath = getCsvPath(account);
  await mkdir(path.dirname(csvPath), { recursive: true });

  const lines = [
    CSV_HEADERS.join(','),
    ...videos.map((video) =>
      CSV_HEADERS.map((header) => escapeCsv(video[header])).join(','),
    ),
  ];

  await writeFile(csvPath, `${lines.join('\n')}\n`, 'utf8');
  return csvPath;
}
