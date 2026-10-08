---
name: ig-perfil-comunicacao
description: >-
  Sintetiza analises de Reels (ganchos, vocabulario, storytelling, retencao) num
  perfil de comunicacao Markdown prescritivo e autossuficiente para reescrever
  copy na voz do influenciador. Use quando o usuario pedir perfil de
  comunicacao, perfil de voz, guia de estilo, consolidar analises, juntar
  analises num perfil, ou artefato para escrever/reescrever texto no estilo de
  alguem.
---

# IG Perfil de Comunicacao

Etapa de **sintese**. Junta dimensoes de analise num unico artefato reutilizavel:
o perfil nao e relatorio pra esquecer — e ferramenta que, colada numa conversa
nova com qualquer copy, permite reescrever na voz do criador **sem** transcricoes
nem outras skills.

## Antes de sintetizar

1. Leia `.cursor/skills/ig-contexto/SKILL.md` (lente Instagram/Reels).
2. Resolva o input (abaixo).
3. Sintetize so o que for **assinatura** (repete no corpus). Traço unico = acidente; ignore ou marque como “ocasional”, nao como regra.

## Input (no proprio prompt)

### A) Analises ja prontas
Usuario cola (ou aponta) saidas de:
- `ig-analise-ganchos`
- `ig-analise-vocabulario`
- `ig-analise-storytelling`
- `ig-analise-retencao`

Va direto para a sintese.

### B) So transcricoes (ponta a ponta)
Texto colado **ou** pasta com `.txt` (junte com `=== FILE: nome ===`).

Entao, nesta ordem, rode o criterio de cada skill (leia o SKILL.md correspondente e produza a analise, mesmo que so internamente):

1. `.cursor/skills/ig-analise-ganchos/SKILL.md`
2. `.cursor/skills/ig-analise-vocabulario/SKILL.md`
3. `.cursor/skills/ig-analise-storytelling/SKILL.md`
4. `.cursor/skills/ig-analise-retencao/SKILL.md`

Depois sintetize. Consistencia entre videos define o perfil.

## Regras de sintese

- **Prescritivo:** frases do tipo “Faca X / Evite Y”, nao “percebe-se que…”.
- **Autossuficiente:** quem ler so o Markdown deve calibrar a voz. Inclua citacoes literais como ancora.
- **Sem sobreposicao:** cada traco aparece **uma vez**, na secao mais forte (ex.: bordao em vocabulario, nao repetir em gancho).
- **Priorize diferenciacao:** o que torna esta voz reconhecivel vs. generico “coach IG”.
- **Anti-padroes obrigatorios:** o que essa voz **nunca** faria (registro, palavras, ritmo).
- **Regua IG:** julgue abertura/ritmo/CTA pela lente do `ig-contexto`.

## Saida — arquivo Markdown

1. Nome do arquivo:
   - Se o prompt der nome → use esse nome (garanta `.md`).
   - Senao → `perfil-comunicacao-<criador>.md` no diretorio atual de trabalho (ou pasta que o usuario indicar).
2. Escreva o arquivo no disco.
3. No chat, diga o caminho absoluto/relativo onde salvou + 2–3 linhas de resumo.

### Template fixo (obrigatorio)

Use exatamente estas secoes e headings:

```markdown
# Perfil de comunicacao — <Criador>

> Artefato prescritivo para reescrever copy na voz deste criador.
> Autossuficiente: nao depende de transcricoes nem de outras skills.

## 1. Resumo da voz
[3–5 frases densas: quem e a voz, pra quem fala, sensacao ao ouvir]

## 2. Principios da voz
Regras curtas (5–9). Formato de cada item:
- **Regra:** ...
  - **Por que:** ...
  - **Ancora:** "citacao literal"

## 3. Gancho / abertura
- Padroes de abertura (regras)
- Tipos que priorizar
- Templates prontos (3–5)
- Ancoras literais (2–4 aberturas reais)

## 4. Vocabulario e tom
- Tratamento do publico
- Bordoes / assinaturas (lista)
- Lexicon do nicho (grupos de palavras)
- Ritmo e complexidade da frase
- **Evitar (anti-padroes):** palavras, cliches, registros e ritmos proibidos
- Ancoras literais

## 5. Estrutura narrativa
- Arco prototipico (batidas)
- Estruturas preferidas (lista, antes/depois, case, serie…)
- Personagens / provas
- Ancoras literais

## 6. Retencao e ritmo
- Mecanismos recorrentes (regras)
- Meio do video: re-ganchos / interrupts
- Fechamento: CTA / loop
- Ancoras literais

## 7. Banco de exemplos literais
8–15 falas curtas copiaveis do corpus (so calibracao de tom — nao inventar)

## 8. Como aplicar a uma copy
### Passo a passo
1. ...
2. ...
3. ...

### Checklist de conformidade
- [ ] Abertura no padrao do criador (sem intro formal)
- [ ] ...
- [ ] Anti-padroes respeitados
- [ ] Pelo menos 1 ancora de tom (bordao/ritmo/estrutura) presente
```

Preencha todas as secoes. Nao deixe placeholder vazio. Se faltar evidencia numa dimensao, diga “evidencia insuficiente no corpus” e nao invente regra.

## Relacao com o resto do kit

| Skill | Papel |
|-------|--------|
| `ig-contexto` | Lente (sempre ler antes) |
| `ig-analise-*` | Dimensoes de entrada |
| `ig-perfil-comunicacao` | Sintese → artefato de escrita |

Independente na invocacao: usuario pode chamar so esta skill com transcricoes; ela orquestra as analises internamente.
