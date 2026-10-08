#!/usr/bin/env node

import path from 'node:path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { loadEnv, missingApiKeyMessage, getOpenAiApiKey } from './lib/env.js';
import { transcribePath } from './lib/transcribe.js';

loadEnv();

const server = new Server(
  {
    name: 'video-transcricao',
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
      name: 'transcrever_videos',
      description:
        'Transcreve um video especifico ou todos os videos de uma pasta via OpenAI Whisper. Salva um .txt limpo ao lado de cada video. Pula videos ja transcritos, salvo se force=true.',
      inputSchema: {
        type: 'object',
        properties: {
          caminho: {
            type: 'string',
            description:
              'Caminho absoluto ou relativo de um arquivo de video (.mp4, .mov, etc.) ou de uma pasta com videos.',
          },
          force: {
            type: 'boolean',
            description:
              'Se true, refaz a transcricao mesmo quando o .txt ja existe. Padrao: false.',
          },
        },
        required: ['caminho'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'transcrever_videos') {
    throw new Error(`Ferramenta desconhecida: ${request.params.name}`);
  }

  if (!getOpenAiApiKey()) {
    return {
      content: [{ type: 'text', text: missingApiKeyMessage() }],
      isError: true,
    };
  }

  const caminho = String(request.params.arguments?.caminho ?? '').trim();
  const force = Boolean(request.params.arguments?.force);

  if (!caminho) {
    return {
      content: [{ type: 'text', text: 'Informe o parametro "caminho" (arquivo ou pasta).' }],
      isError: true,
    };
  }

  const absolute = path.resolve(caminho);
  const outcome = await transcribePath(absolute, { force });

  if (!outcome.ok) {
    return {
      content: [{ type: 'text', text: outcome.error }],
      isError: true,
    };
  }

  const lines = [
    `Caminho: ${absolute}`,
    `Force: ${force}`,
    `Total: ${outcome.summary.total}`,
    `Transcritos: ${outcome.summary.ok}`,
    `Pulados: ${outcome.summary.skipped}`,
    `Falhas: ${outcome.summary.failed}`,
    '',
    'Detalhes:',
    ...outcome.results.map((item) => {
      if (item.status === 'ok') {
        return `- OK ${item.videoPath} -> ${item.transcriptPath} (${item.chars} chars, ${item.parts} parte(s))`;
      }
      if (item.status === 'skipped') {
        return `- SKIP ${item.videoPath} (${item.message})`;
      }
      return `- ERRO ${item.videoPath}: ${item.message}`;
    }),
  ];

  return {
    content: [{ type: 'text', text: lines.join('\n') }],
    isError: outcome.summary.failed > 0 && outcome.summary.ok === 0 && outcome.summary.skipped === 0,
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
