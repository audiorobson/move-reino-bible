# Repositório de conteúdo — Move Reino Bible

Estrutura separada por domínio para importação offline e pesquisa local.

```
data/
├── bibles/          # Textos bíblicos (versões, índice Meilisearch)
├── rag/             # Documentos teológicos para RAG offline
├── strong/          # Concordância Strong (Markdown → banco)
├── lexicon/         # Léxicos grego/hebraico complementares
├── originals/       # Textos originais (SBLGNT, OSHB, interlinear)
└── fonts/           # Fontes tipográficas (grego/hebraico offline)
```

## Comandos de importação

```bash
# Bíblias (já disponível)
pnpm import:bible --local-all
pnpm index:bibles

# RAG teológico (fontes em data/rag/sources/)
pnpm import:rag --list
pnpm import:rag --all
pnpm import:rag --file data/rag/sources/meu-documento.md

# Strong's completo (arquivo .md em data/strong/sources/)
pnpm import:strongs --file data/strong/sources/strongs-complete.md
pnpm import:strongs --list
```

## Fluxo offline

1. Coloque arquivos nas pastas `sources/` de cada domínio
2. Registre em `manifest.json` do domínio (quando aplicável)
3. Execute o script de importação correspondente
4. O app desktop consulta via API local (`localhost:4000`)
