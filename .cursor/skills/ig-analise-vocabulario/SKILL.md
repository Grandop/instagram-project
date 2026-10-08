---
name: ig-analise-vocabulario
description: >-
  Analisa vocabulario e jeito de falar em transcricoes de Reels: girias,
  bordoes, tratamento, complexidade, palavrões, referencias culturais e
  expressoes recorrentes. Use quando o usuario pedir vocabulario, como ele
  fala, bordoes, girias, tom de voz, palavrao, referencias ou lexicon do criador.
---

# IG Analise — Vocabulario

## Antes de tudo

1. Leia `.cursor/skills/ig-contexto/SKILL.md`.
2. Monte o corpus (texto colado **ou** pasta de `.txt` com `=== FILE: ... ===`).
3. Levante o **lexicon e o tom** recorrentes do criador.

## O que mapear

| Camada | Exemplos |
|--------|----------|
| Tratamento | voce, vocees, gente, amigos, gestores… |
| Bordoes / assinaturas | frases que repetem entre videos |
| Girias / internet BR | gíria, meme, abreviação |
| Complexidade | frases curtas vs longas; jargao tecnico |
| Intensidade | palavrao, superlativo, suavizacao |
| Referencias | celebridade, livro, serie, nicho |
| Campo semantico | palavras-eixo do nicho (amor, gestao, venda…) |

## Output (obrigatorio)

```markdown
# Analise de vocabulario — [criador ou pasta]

## Corpus
- N arquivos / volume aproximado de texto

## Tom em uma frase
Como ele soa (ex.: “coach intimo e direto, quase amiga no story”)

## Bordoes e assinaturas
Lista com frequencia relativa + citacao

## Lexicon do nicho
Palavras/campos que dominam (agrupados)

## Tratamento e distancia
Como fala com o publico

## Complexidade e ritmo verbal
Frase media, repeticao, recursos (pergunta, imperativo, reticencias…)

## Girias, palavroes, referencias
O que aparece e o efeito (intimidade, autoridade, humor)

## Banco para replicar
- 15–30 expressoes dele (copiaveis)
- 10 frases-template no tom dele (com lacunas)
- O que evitar pra nao soar “outro criador”
```

## Regras

- So o que estiver no corpus — nao invente bordao.
- Preferir lista e citacao a paragrafo generico.
- Regua IG (`ig-contexto`): tom lo-fi e BR sao positivos se autenticos.
- Independente das outras skills de analise.
