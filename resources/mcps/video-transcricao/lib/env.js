import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MCP_ROOT = path.resolve(__dirname, '..');
export const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

let loaded = false;

export function loadEnv() {
  if (loaded) {
    return;
  }

  // Prefer project root; also accept .env beside the MCP (common local setup).
  loadDotenv({ path: path.join(PROJECT_ROOT, '.env') });
  loadDotenv({ path: path.join(MCP_ROOT, '.env'), override: false });
  loaded = true;
}

export function getOpenAiApiKey() {
  loadEnv();
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || null;
}

export function missingApiKeyMessage() {
  return [
    'OPENAI_API_KEY nao configurada.',
    'Adicione a chave em um destes arquivos:',
    `1) ${path.join(PROJECT_ROOT, '.env')}`,
    `2) ${path.join(MCP_ROOT, '.env')}`,
    '',
    'Conteudo:',
    'OPENAI_API_KEY=sk-...',
    '',
    'Depois reinicie o MCP / rode de novo.',
  ].join('\n');
}
