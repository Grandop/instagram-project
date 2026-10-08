#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { fetchAllVideos } from './lib/instagram.js';
import { getCsvPath, mergeVideoLists, readVideoList, writeVideoList } from './lib/csv.js';

const server = new Server(
  {
    name: 'instagram-lista',
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
      name: 'listar_videos_instagram',
      description:
        'Lista todos os videos/reels publicos de uma conta Instagram e salva em resources/videos/<conta>/lista.csv, ordenado do mais novo para o mais antigo.',
      inputSchema: {
        type: 'object',
        properties: {
          conta: {
            type: 'string',
            description: 'Nome de usuario da conta Instagram (sem @).',
          },
        },
        required: ['conta'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'listar_videos_instagram') {
    throw new Error(`Ferramenta desconhecida: ${request.params.name}`);
  }

  const conta = String(request.params.arguments?.conta ?? '')
    .trim()
    .replace(/^@/, '');

  if (!conta) {
    return {
      content: [{ type: 'text', text: 'Informe o parametro "conta" com o username da conta Instagram.' }],
      isError: true,
    };
  }

  const pages = [];

  let fetched = [];
  try {
    fetched = await fetchAllVideos(conta, {
      onPage: (info) => pages.push(info),
    });
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Erro ao acessar @${conta}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  const existing = await readVideoList(conta);
  const merged = mergeVideoLists(fetched, existing);
  const csvPath = await writeVideoList(conta, merged);

  const newCount = merged.filter(
    (video) => !existing.some((item) => item.shortcode === video.shortcode),
  ).length;

  const summary = [
    `Conta: @${conta}`,
    `Videos obtidos nesta execucao: ${fetched.length}`,
    `Videos novos inseridos: ${newCount}`,
    `Total na lista: ${merged.length}`,
    `Arquivo: ${csvPath}`,
    '',
    'Paginas processadas:',
    ...pages.map((page) => `- pagina ${page.page}: ${page.status}${page.count != null ? ` (${page.count} videos)` : ''}`),
    '',
    'Primeiros 5 videos:',
    ...merged.slice(0, 5).map(
      (video) =>
        `- ${video.shortcode} | views: ${video.views} | likes: ${video.likes} | ${video.permalink}`,
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
