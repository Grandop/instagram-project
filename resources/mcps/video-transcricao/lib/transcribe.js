import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import OpenAI from 'openai';

import { cleanupWorkDir, createWorkDir, prepareAudioParts } from './audio.js';
import { getOpenAiApiKey, missingApiKeyMessage } from './env.js';
import {
  collectVideos,
  pathExists,
  transcriptPathFor,
} from './files.js';

function createClient() {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    const error = new Error(missingApiKeyMessage());
    error.code = 'MISSING_API_KEY';
    throw error;
  }
  return new OpenAI({ apiKey });
}

async function transcribeFile(client, audioPath) {
  const result = await client.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: 'whisper-1',
    response_format: 'text',
  });

  // SDK may return string (text format) or object depending on version.
  if (typeof result === 'string') {
    return result.trim();
  }

  if (result?.text) {
    return String(result.text).trim();
  }

  return String(result ?? '').trim();
}

export async function transcribeVideoFile(videoPath, { force = false } = {}) {
  const outPath = transcriptPathFor(videoPath);

  if (!force && (await pathExists(outPath))) {
    return {
      videoPath,
      transcriptPath: outPath,
      status: 'skipped',
      message: 'Transcricao ja existe',
    };
  }

  const client = createClient();
  const workDir = await createWorkDir(pathBase(videoPath));

  try {
    const parts = await prepareAudioParts(videoPath, workDir);
    const chunks = [];

    for (const part of parts) {
      const text = await transcribeFile(client, part);
      if (text) {
        chunks.push(text);
      }
    }

    const transcript = chunks.join('\n').trim();
    await writeFile(outPath, transcript ? `${transcript}\n` : '', 'utf8');

    return {
      videoPath,
      transcriptPath: outPath,
      status: 'ok',
      parts: parts.length,
      chars: transcript.length,
    };
  } finally {
    await cleanupWorkDir(workDir);
  }
}

function pathBase(filePath) {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || 'video';
}

export async function transcribePath(inputPath, { force = false, onProgress } = {}) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      error: missingApiKeyMessage(),
      results: [],
    };
  }

  let videos;
  try {
    videos = await collectVideos(inputPath);
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      results: [],
    };
  }

  if (videos.length === 0) {
    return {
      ok: true,
      results: [],
      summary: {
        total: 0,
        ok: 0,
        skipped: 0,
        failed: 0,
      },
    };
  }

  const results = [];

  for (const videoPath of videos) {
    try {
      const result = await transcribeVideoFile(videoPath, { force });
      results.push(result);
      onProgress?.(result);
    } catch (error) {
      const failed = {
        videoPath,
        transcriptPath: transcriptPathFor(videoPath),
        status: 'error',
        message: error.code === 'MISSING_API_KEY' ? error.message : error.message,
      };
      results.push(failed);
      onProgress?.(failed);
    }
  }

  const summary = {
    total: results.length,
    ok: results.filter((item) => item.status === 'ok').length,
    skipped: results.filter((item) => item.status === 'skipped').length,
    failed: results.filter((item) => item.status === 'error').length,
  };

  return { ok: true, results, summary };
}
