import { access, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const VIDEO_EXTENSIONS = new Set([
  '.mp4',
  '.mov',
  '.mkv',
  '.webm',
  '.avi',
  '.m4v',
  '.mpeg',
  '.mpg',
  '.3gp',
]);

export function isVideoFile(filePath) {
  return VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function transcriptPathFor(videoPath) {
  const parsed = path.parse(videoPath);
  return path.join(parsed.dir, `${parsed.name}.txt`);
}

export async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function collectVideos(inputPath) {
  const absolute = path.resolve(inputPath);
  const info = await stat(absolute);

  if (info.isFile()) {
    if (!isVideoFile(absolute)) {
      throw new Error(`Arquivo nao e um video suportado: ${absolute}`);
    }
    return [absolute];
  }

  if (!info.isDirectory()) {
    throw new Error(`Caminho invalido: ${absolute}`);
  }

  const entries = await readdir(absolute, { withFileTypes: true });
  const videos = entries
    .filter((entry) => entry.isFile() && isVideoFile(entry.name))
    .map((entry) => path.join(absolute, entry.name))
    .sort((a, b) => a.localeCompare(b, 'en'));

  return videos;
}
