# Formato Markdown — Strong's Concordance

Use este formato para `data/strong/sources/strongs-complete.md`.

## Regras

- Cada entrada começa com `## G1234` (grego) ou `## H5678` (hebraico)
- Campos em lista com `- **Campo:** valor`
- Separador opcional `---` entre entradas
- Encoding UTF-8 (grego/hebraico inline)

## Campos suportados

| Campo | Obrigatório | Exemplo |
|-------|-------------|---------|
| Lemma | Sim | λόγος / אֱלֹהִים |
| Transliteration | Recomendado | logos / elohim |
| Language | Sim | greek / hebrew |
| Short definition | Sim | palavra, razão, discurso |
| Extended definition | Opcional | texto longo |
| Pronunciation | Opcional | ló-gos |
| Semantic domain | Opcional | Communication |

## Exemplo — Grego

```markdown
## G3056

- **Lemma:** λόγος
- **Transliteration:** logos
- **Language:** greek
- **Pronunciation:** ló-gos
- **Short definition:** palavra, razão, discurso, conta, mensagem
- **Extended definition:** Do verbo λέγω (legō), "dizer". No NT designa frequentemente o Verbo encarnado (João 1:1).
- **Semantic domain:** Communication

---
```

## Exemplo — Hebraico

```markdown
## H430

- **Lemma:** אֱלֹהִים
- **Transliteration:** elohim
- **Language:** hebrew
- **Short definition:** Deus, deuses, juízes, seres poderosos
- **Extended definition:** Plural de intensidade ou majestade para o Deus verdadeiro no AT.

---
```

## Importação em lote

Arquivos grandes (milhares de entradas) são suportados. O importador processa em lotes de 500 registros.

```bash
pnpm import:strongs --file data/strong/sources/strongs-complete.md
pnpm import:strongs --list
```
