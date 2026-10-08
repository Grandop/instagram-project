import { readFile } from 'node:fs/promises';
import path from 'node:path';

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

export function resolveAccountFromCsvPath(csvPath) {
  const absolute = path.resolve(csvPath);
  const parts = absolute.split(path.sep).filter(Boolean);
  const fileIndex = parts.length - 1;

  if (fileIndex > 0) {
    return parts[fileIndex - 1];
  }

  throw new Error(`Nao foi possivel identificar a conta a partir de: ${absolute}`);
}

export function resolveOutputDir(csvPath, account) {
  return path.dirname(path.resolve(csvPath));
}

export async function readVideosFromCsv(csvPath) {
  const content = await readFile(csvPath, 'utf8');
  const lines = content.trim().split(/\r?\n/).filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const header = parseCsvLine(lines[0]);
  const shortcodeIndex = header.indexOf('shortcode');
  const likesIndex = header.indexOf('likes');

  if (shortcodeIndex === -1 || likesIndex === -1) {
    throw new Error('CSV precisa das colunas shortcode e likes');
  }

  const videos = [];

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const shortcode = values[shortcodeIndex]?.trim();

    if (!shortcode) {
      continue;
    }

    videos.push({
      shortcode,
      likes: Number(values[likesIndex]) || 0,
    });
  }

  return videos.sort((a, b) => b.likes - a.likes);
}
