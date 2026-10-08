# Geracao do Perfil de Comunicacao — {{NOME_INFLUENCIADOR}}

> Template: copie para `.spec/perfil-{{USERNAME}}/spec.md` e substitua os placeholders.
>
> Placeholders:
> - `{{NOME_INFLUENCIADOR}}` — nome de exibicao (ex.: Micha Menezes)
> - `{{USERNAME}}` — handle sem @ (ex.: michamenezes)
> - `{{QTD_VIDEOS}}` — quantos top videos baixar (ex.: 10)

## Tarefas

### Fase 1: obtencao dos dados

- [ ] Obter a lista de videos do Instagram da conta @{{USERNAME}} usando o MCP `resources/mcps/instagram-lista`
- [ ] Obter os {{QTD_VIDEOS}} melhores videos do Instagram da conta @{{USERNAME}} usando o MCP `resources/mcps/instagram-top-videos-download` (CSV em `resources/videos/{{USERNAME}}/lista.csv`)
- [ ] Transcrever os videos usando o MCP `resources/mcps/video-transcricao` (pasta `resources/videos/{{USERNAME}}`)

### Fase 2: analise das transcricoes

Pasta de trabalho das analises: `resources/videos/{{USERNAME}}/` (ou `.spec/perfil-{{USERNAME}}/` se preferir guardar so os `.md` la).

- [ ] Executar a skill `.cursor/skills/ig-analise-ganchos` na pasta das transcricoes e salvar em `ig-analise-ganchos.md`
- [ ] Executar a skill `.cursor/skills/ig-analise-retencao` na pasta das transcricoes e salvar em `ig-analise-retencao.md`
- [ ] Executar a skill `.cursor/skills/ig-analise-storytelling` na pasta das transcricoes e salvar em `ig-analise-storytelling.md`
- [ ] Executar a skill `.cursor/skills/ig-analise-vocabulario` na pasta das transcricoes e salvar em `ig-analise-vocabulario.md`
- [ ] Gerar o perfil final com a skill `.cursor/skills/ig-perfil-comunicacao` com base nas analises anteriores, salvando em `perfil-{{USERNAME}}.md`

## Referencias rapidas

| Etapa | Artefato |
|-------|----------|
| Lista | `resources/videos/{{USERNAME}}/lista.csv` |
| Videos | `resources/videos/{{USERNAME}}/N_shortcode.mp4` |
| Transcricoes | `resources/videos/{{USERNAME}}/*.txt` |
| Analises | `ig-analise-*.md` |
| Perfil | `perfil-{{USERNAME}}.md` |

| MCP / Skill | Uso |
|-------------|-----|
| `instagram-lista` | Lista completa da conta |
| `instagram-top-videos-download` | Top N por likes |
| `video-transcricao` | Whisper → `.txt` ao lado do video |
| `ig-contexto` | Lente (lida pelas skills de analise) |
| `ig-analise-ganchos` | Aberturas |
| `ig-analise-retencao` | Retencao / CTA / loop |
| `ig-analise-storytelling` | Narrativa |
| `ig-analise-vocabulario` | Tom / bordoes |
| `ig-perfil-comunicacao` | Sintese prescritiva |
