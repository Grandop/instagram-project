#!/usr/bin/env node

import path from 'node:path';
import {
  readVideosFromCsv,
  resolveAccountFromCsvPath,
  resolveOutputDir,
} from './lib/csv.js';
import { downloadTopVideos } from './lib/download.js';

const csvPath = process.argv[2];
const quantidade = Number(process.argv[3]);

if (!csvPath || !Number.isFinite(quantidade) || quantidade <= 0) {
  console.error('Uso: node run.js <csv_path> <quantidade>');
  process.exit(1);
}

const absoluteCsv = path.resolve(csvPath);
const account = resolveAccountFromCsvPath(absoluteCsv);
const videos = await readVideosFromCsv(absoluteCsv);
const outputDir = resolveOutputDir(absoluteCsv, account);

console.error(`conta=@${account} videos=${videos.length} baixar=${Math.floor(quantidade)}`);

const result = await downloadTopVideos({
  videos,
  quantity: Math.floor(quantidade),
  outputDir,
  onProgress: (item) => {
    if (item.status === 'ok') {
      console.error(`ok ${item.order}_${item.shortcode}.mp4`);
    } else {
      console.error(`erro ${item.order}_${item.shortcode}: ${item.message}`);
    }
  },
});

console.log(
  JSON.stringify(
    {
      account,
      csvPath: absoluteCsv,
      outputDir,
      downloaded: result.downloaded.length,
      failed: result.failed.length,
      files: result.downloaded.map((item) => `${item.order}_${item.shortcode}.mp4`),
      errors: result.failed,
    },
    null,
    2,
  ),
);
