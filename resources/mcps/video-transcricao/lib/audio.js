import { mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_ROOT = path.join(__dirname, '..', 'tmp');

// Whisper API limit is 25MB; keep margin for multipart overhead.
export const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error('ffmpeg-static nao encontrou o binario do ffmpeg'));
      return;
    }

    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`ffmpeg falhou (code ${code}): ${stderr.slice(-800)}`));
    });
  });
}

export async function createWorkDir(label) {
  const dir = path.join(
    TMP_ROOT,
    `${Date.now()}-${label.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'job'}`,
  );
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function cleanupWorkDir(dir) {
  if (!dir) {
    return;
  }
  await rm(dir, { recursive: true, force: true });
}

/**
 * Extrai audio mono 16kHz em MP3 com bitrate baixo (claro p/ fala, arquivo pequeno).
 */
export async function extractSpeechAudio(videoPath, workDir) {
  const outputPath = path.join(workDir, 'audio.mp3');

  await runFfmpeg([
    '-y',
    '-i',
    videoPath,
    '-vn',
    '-ac',
    '1',
    '-ar',
    '16000',
    '-c:a',
    'libmp3lame',
    '-b:a',
    '48k',
    outputPath,
  ]);

  const info = await stat(outputPath);
  return { audioPath: outputPath, size: info.size };
}

/**
 * Divide audio em segmentos de N segundos para ficar sob o limite da API.
 */
export async function splitAudio(audioPath, workDir, segmentSeconds = 600) {
  const pattern = path.join(workDir, 'chunk_%03d.mp3');

  await runFfmpeg([
    '-y',
    '-i',
    audioPath,
    '-f',
    'segment',
    '-segment_time',
    String(segmentSeconds),
    '-reset_timestamps',
    '1',
    '-c',
    'copy',
    pattern,
  ]);

  const { readdir } = await import('node:fs/promises');
  const files = (await readdir(workDir))
    .filter((name) => /^chunk_\d+\.mp3$/.test(name))
    .sort()
    .map((name) => path.join(workDir, name));

  if (files.length === 0) {
    throw new Error('Falha ao dividir audio: nenhum chunk gerado');
  }

  // Se algum chunk ainda passar do limite, reencode com bitrate menor e segmentos menores.
  const oversized = [];
  for (const file of files) {
    const info = await stat(file);
    if (info.size > MAX_UPLOAD_BYTES) {
      oversized.push(file);
    }
  }

  if (oversized.length === 0) {
    return files;
  }

  const saferPattern = path.join(workDir, 'safe_%03d.mp3');
  await runFfmpeg([
    '-y',
    '-i',
    audioPath,
    '-ac',
    '1',
    '-ar',
    '16000',
    '-c:a',
    'libmp3lame',
    '-b:a',
    '32k',
    '-f',
    'segment',
    '-segment_time',
    '300',
    '-reset_timestamps',
    '1',
    saferPattern,
  ]);

  const safer = (await readdir(workDir))
    .filter((name) => /^safe_\d+\.mp3$/.test(name))
    .sort()
    .map((name) => path.join(workDir, name));

  if (safer.length === 0) {
    throw new Error('Falha ao redividir audio grande demais para a API');
  }

  for (const file of safer) {
    const info = await stat(file);
    if (info.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `Chunk ainda excede o limite da OpenAI (${info.size} bytes). Reduza a duracao do video.`,
      );
    }
  }

  return safer;
}

export async function prepareAudioParts(videoPath, workDir) {
  const { audioPath, size } = await extractSpeechAudio(videoPath, workDir);

  if (size <= MAX_UPLOAD_BYTES) {
    return [audioPath];
  }

  return splitAudio(audioPath, workDir);
}
