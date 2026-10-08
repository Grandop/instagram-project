#!/usr/bin/env node

import { fetchAllVideos } from './lib/instagram.js';
import { getCsvPath, mergeVideoLists, readVideoList, writeVideoList } from './lib/csv.js';

const conta = process.argv[2]?.trim().replace(/^@/, '');

if (!conta) {
  console.error('Uso: node run.js <conta>');
  process.exit(1);
}

const pages = [];
const fetched = await fetchAllVideos(conta, {
  onPage: (info) => {
    pages.push(info);
    console.error(`pagina ${info.page}: ${info.status} (${info.count ?? 0} videos)`);
  },
});

const existing = await readVideoList(conta);
const merged = mergeVideoLists(fetched, existing);
const csvPath = await writeVideoList(conta, merged);

const newCount = merged.filter(
  (video) => !existing.some((item) => item.shortcode === video.shortcode),
).length;

console.log(
  JSON.stringify(
    {
      conta,
      fetched: fetched.length,
      newVideos: newCount,
      total: merged.length,
      csvPath,
      pages,
      preview: merged.slice(0, 5).map((video) => ({
        shortcode: video.shortcode,
        views: video.views,
        likes: video.likes,
      })),
    },
    null,
    2,
  ),
);
