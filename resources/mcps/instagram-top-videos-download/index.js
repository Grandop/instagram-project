#!/usr/bin/env node

import path from 'node:path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  readVideosFromCsv,
  resolveAccountFromCsvPath,
  resolveOutputDir,
} from './lib/csv.js';
import { downloadTopVideos } from './lib/download.js';

const server = new Server(
  {
    name: 'instagram-top-videos-download',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'baixar_top_videos_instagram',
      description:
        'Le um CSV de lista de videos Instagram, ordena por likes (maior para menor) e baixa os N mais curtidos na pasta da conta.',
      inputSchema: {
        type: 'object',
        properties: {
          csv_path: {
            type: 'string',
            description: 'Caminho do arquivo CSV com a lista de videos (ex.: resources/videos/conta/lista.csv).',
          },
          quantidade: {
            type: 'number',
            description: 'Quantidade de videos mais curtidos para baixar.',
          },
        },
        required: ['csv_path', 'quantidade'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'baixar_top_videos_instagram') {
    throw new Error(`Ferramenta desconhecida: ${request.params.name}`);
  }

  const csvPath = String(request.params.arguments?.csv_path ?? '').trim();
  const quantidade = Number(request.params.arguments?.quantidade);

  if (!csvPath) {
    return {
      content: [{ type: 'text', text: 'Informe o parametro "csv_path".' }],
      isError: true,
    };
  }

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    return {
      content: [{ type: 'text', text: 'Informe "quantidade" como numero positivo.' }],
      isError: true,
    };
  }

  const absoluteCsv = path.resolve(csvPath);
  let account;
  let videos;

  try {
    account = resolveAccountFromCsvPath(absoluteCsv);
    videos = await readVideosFromCsv(absoluteCsv);
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erro ao ler CSV: ${error.message}` }],
      isError: true,
    };
  }

  if (videos.length === 0) {
    return {
      content: [{ type: 'text', text: `CSV sem videos: ${absoluteCsv}` }],
      isError: true,
    };
  }

  const outputDir = resolveOutputDir(absoluteCsv, account);
  const progress = [];

  const result = await downloadTopVideos({
    videos,
    quantity: Math.floor(quantidade),
    outputDir,
    onProgress: (item) => progress.push(item),
  });

  const summary = [
    `Conta: @${account}`,
    `CSV: ${absoluteCsv}`,
    `Pasta: ${outputDir}`,
    `Solicitados: ${Math.floor(quantidade)}`,
    `Baixados: ${result.downloaded.length}`,
    `Falhas: ${result.failed.length}`,
    '',
    'Top likes (ordem de download):',
    ...videos.slice(0, Math.floor(quantidade)).map(
      (video, index) =>
        `${index + 1}. ${video.shortcode} (${video.likes} likes)`,
    ),
    '',
    'Resultado:',
    ...progress.map((item) =>
      item.status === 'ok'
        ? `- ${item.order}_${item.shortcode}.mp4 OK`
        : `- ${item.order}_${item.shortcode}.mp4 ERRO: ${item.message}`,
    ),
  ].join('\n');

  return {
    content: [{ type: 'text', text: summary }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
