# Léxicos — hebraico e aramaico

```
data/lexicon/
├── manifest.json
├── The-Hebrew-and-Aramaic-lexicon-of-the-Old-Testament-study-edition-volume-1.md
├── sources/     # JSON ou MD complementares
└── index/       # cache de tradução / metadados
```

## Indexação

```bash
pnpm import:lexicon --all
pnpm import:lexicon --list
```

O léxico HALOT é fragmentado por entradas (`## lema` e `* entrada`) e indexado no RAG com `documentType: lexicon`.

## Busca

- API: `GET /api/v1/lexicon/search?q=ab&limit=10`
- Status: `GET /api/v1/lexicon/status`
- IA: consulta automática via `localFirst` em `/api/v1/ai/chat`

## Política de fontes

A IA consulta **primeiro** arquivos locais (léxico HALOT, Strong, RAG, Bíblia). A regra está no system prompt OpenAI (`packages/llm-gateway/src/local-sources-policy.ts`). Busca online só com `allowOnline: true` na API.
