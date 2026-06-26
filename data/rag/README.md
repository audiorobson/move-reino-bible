# RAG Teológico — conteúdo offline

## Estrutura

```
data/rag/
├── manifest.json       # Catálogo de fontes teológicas
├── README.md
├── sources/            # ← Coloque Markdown, TXT aqui
│   └── .gitkeep
├── processed/          # Chunks gerados na importação (JSON)
└── index/              # Índice leve para consulta offline
```

## Adicionar documento

1. Crie `data/rag/sources/confissao-exemplo.md` com frontmatter:

```markdown
---
title: Confissão de Fé — Exemplo
author: Autor
tradition: Reformada
language: pt-BR
license: LICENSE_OK_PUBLIC_DOMAIN
documentType: confession
reliabilityLevel: high
---

Texto do documento...
```

2. Registre em `manifest.json` ou importe direto:

```bash
pnpm import:rag --file data/rag/sources/confissao-exemplo.md
```

3. Para indexação vetorial completa (futuro): `pnpm worker:embeddings`

## Pesquisa offline

- **Fase atual:** chunks no PostgreSQL + busca por texto
- **Fase futura:** embeddings pgvector / Qdrant + consulta semântica
