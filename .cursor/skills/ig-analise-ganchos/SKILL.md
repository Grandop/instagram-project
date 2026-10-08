---
name: ig-analise-ganchos
description: >-
  Analisa ganchos e aberturas dos primeiros segundos em transcricoes de Reels.
  Classifica tipo de gancho, por que trava o scroll e padroes recorrentes do
  criador. Use quando o usuario pedir ganchos, aberturas, primeiros segundos,
  hook, cold open, ou “como ele comeca o video”.
---

# IG Analise — Ganchos

## Antes de tudo

1. Leia `.cursor/skills/ig-contexto/SKILL.md` (lente Instagram/Reels).
2. Obtenha o corpus (abaixo).
3. Analise **padroes de abertura do criador**, nao um video isolado (salvo se o usuario pedir um so).

## Input flexivel

**Texto no prompt** — uma ou varias transcricoes coladas.

**Pasta** — leia todos os `.txt` da pasta (ignore `.mp4` e outros). Junte num corpus unico com separador claro:

```
=== FILE: nome-do-arquivo.txt ===
<conteudo>
```

Se a pasta estiver vazia ou sem `.txt`, avise e pare.

## Escopo

Foque so nos **primeiros segundos / primeiras frases** de cada peca (aprox. inicio ate a primeira virada ou ~15% do texto, o que vier primeiro). Resto do video so existe se explicar o gancho.

## Tipos de gancho (classifique cada abertura)

Use estes labels (pode combinar 2):

| Tipo | Sinal |
|------|--------|
| Dor/problema | Nomeia sofrimento do publico |
| Promessa | Resultado claro se assistir |
| Choque/contrarian | Afirmacao contra o senso comum |
| Curiosidade/lacuna | Info incompleta que puxa |
| Identidade | “Se voce e X…” |
| Historia in media res | Cai no meio da cena |
| Prova social / autoridade | Numero, famoso, “eu fiz” |
| Binario | “So existem 2 caminhos…” |
| Pergunta | Pergunta que o ego responde |
| Lista teaser | “N erros / N dicas” |

## Output (obrigatorio)

```markdown
# Analise de ganchos — [criador ou pasta]

## Corpus
- N transcricoes / arquivos usados

## Padroes recorrentes
- Padrao 1 (frequencia aproximada) + por que trava o scroll (regua IG)
- Padrao 2 ...

## Catalogo de aberturas
Para cada video/trecho:
- **Arquivo/ID**
- **Abertura (cite 1–3 frases literais)**
- **Tipo(s)**
- **Por que funciona / falha** (especifico, nao generico)

## Assinatura do criador
3–5 regras do “jeito dele comecar”

## Como replicar
3–5 templates de abertura no estilo dele (prontos pra gravar)
```

## Regras

- Exemplos **literais** das transcricoes — sem inventar falas.
- Julgue pela lente do `ig-contexto` (scroll, lo-fi, BR).
- Independente: nao precisa rodar retencao/storytelling/vocabulario.
- Pratico > teorico.
