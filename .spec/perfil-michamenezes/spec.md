# Geracao do Perfil de Comunicacao do Micha Menezes

## Tarefas

### Fase 1: obtencao dos dados

- [x] Obter a lista de videos do Instagram da conta @michamenezes usando o MCP `resources/mcps/instagram-lista`
  - **Evidencia:** 2026-07-29 00:03:45 -03 · `node resources/mcps/instagram-lista/run.js michamenezes` · EXIT 0 · fetched 24 nesta rodada (pagina 3 = HTTP 401, merge preservou historico) · `lista.csv` total **1439** linhas (header + videos) · log `/tmp/micha-lista-err.txt` + `/tmp/micha-lista-out.json`
- [x] Obter os 10 melhores videos do Instagram da conta @michamenezes usando o MCP `resources/mcps/instagram-top-videos-download` (CSV em `resources/videos/michamenezes/lista.csv`)
  - **Evidencia:** 2026-07-29 00:03:34 → 00:03:55 -03 · `run.js …/lista.csv 10` · downloaded **10/10**, failed 0 · arquivos `1_DPT6BWZDcrp.mp4` … `10_DLfL4kLuojK.mp4` em `resources/videos/michamenezes/`
- [x] Transcrever os videos usando o MCP `resources/mcps/video-transcricao` (pasta `resources/videos/michamenezes`)
  - **Evidencia:** 2026-07-29 00:04:11 → 00:04:13 -03 · `run.js resources/videos/michamenezes` · summary: total 10, **skipped 8** (`.txt` ja existiam), **failed 2** (401 API key invalida em `9_DGftG9IOqUK` e `10_DLfL4kLuojK`) · 00:04:40 -03 alinhamento por shortcode: copiados `9_DGftG9IOqUK.txt` e `10_DLfL4kLuojK.txt` a partir das transcricoes ja existentes do mesmo shortcode · resultado: **10/10** pares mp4+txt

### Fase 2: analise das transcricoes

- [x] Dentro da pasta das transcricoes executar a skill `.cursor/skills/ig-analise-ganchos` e criar um arquivo para armazenar o resultado da analise em `ig-analise-ganchos.md`
  - **Evidencia:** 2026-07-29 00:05:00 -03 · saida `.spec/perfil-michamenezes/ig-analise-ganchos.md` · corpus 10 `.txt`
- [x] Dentro da pasta das transcricoes executar a skill `.cursor/skills/ig-analise-retencao` e criar um arquivo para armazenar o resultado da analise em `ig-analise-retencao.md`
  - **Evidencia:** 2026-07-29 00:05:10 -03 · saida `.spec/perfil-michamenezes/ig-analise-retencao.md`
- [x] Dentro da pasta das transcricoes executar a skill `.cursor/skills/ig-analise-storytelling` e criar um arquivo para armazenar o resultado da analise em `ig-analise-storytelling.md`
  - **Evidencia:** 2026-07-29 00:05:20 -03 · saida `.spec/perfil-michamenezes/ig-analise-storytelling.md`
- [x] Dentro da pasta das transcricoes executar a skill `.cursor/skills/ig-analise-vocabulario` e criar um arquivo para armazenar o resultado da analise em `ig-analise-vocabulario.md`
  - **Evidencia:** 2026-07-29 00:05:30 -03 · saida `.spec/perfil-michamenezes/ig-analise-vocabulario.md`
- [x] Gere o arquivo final de perfil de comunicacao usando a skill `.cursor/skills/ig-perfil-comunicacao` com base nas analises anteriores no arquivo perfil-michamenezes.md
  - **Evidencia:** 2026-07-29 00:06:00 -03 · saida `.spec/perfil-michamenezes/perfil-michamenezes.md` · sintetizado a partir das 4 analises + lente `ig-contexto`

## Observacoes
- Refresh da lista parcial (401 apos 24 itens); CSV final com 1439 entradas via merge com lista anterior.
- OpenAI key no `.env` do MCP retornou 401 para 2 arquivos novos; transcricoes desses shortcodes ja existiam e foram reaproveitadas.
- `2_DLN_f9BvwYr.txt` parece falha de ASR (musica); marcado nas analises, nao usado como assinatura.
