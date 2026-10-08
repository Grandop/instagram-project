#!/usr/bin/env node

import path from 'node:path';
import { loadEnv, getOpenAiApiKey, missingApiKeyMessage } from './lib/env.js';
import { transcribePath } from './lib/transcribe.js';

loadEnv();

const input = process.argv[2];
const force = process.argv.includes('--force');

if (!input) {
  console.error('Uso: node run.js <arquivo-ou-pasta> [--force]');
  process.exit(1);
}

if (!getOpenAiApiKey()) {
  console.error(missingApiKeyMessage());
  process.exit(1);
}

const absolute = path.resolve(input);
const outcome = await transcribePath(absolute, {
  force,
  onProgress: (item) => {
    if (item.status === 'ok') {
      console.error(`ok ${item.videoPath}`);
    } else if (item.status === 'skipped') {
      console.error(`skip ${item.videoPath}`);
    } else {
      console.error(`erro ${item.videoPath}: ${item.message}`);
    }
  },
});

if (!outcome.ok) {
  console.error(outcome.error);
  process.exit(1);
}

console.log(JSON.stringify(outcome.summary, null, 2));
