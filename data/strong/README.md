# Strong's Concordance — importação offline

## Estrutura

```
data/strong/
├── manifest.json
├── README.md
├── STRONGS_FORMAT.md      # Especificação do arquivo .md
├── sources/               # ← Coloque strongs-complete.md aqui
│   └── strongs.template.md
└── index/                 # Índice JSON exportado (futuro)
```

## Importar Strong's completo

1. Prepare o arquivo seguindo `STRONGS_FORMAT.md`
2. Salve como `data/strong/sources/strongs-complete.md`
3. Execute:

```bash
pnpm import:strongs --file data/strong/sources/strongs-complete.md
```

4. Verifique no app: módulo **Strong** ou `GET /api/v1/search/strong/G3056`

## O que é importado

| Destino Prisma | Conteúdo |
|----------------|----------|
| `LexiconEntry` | Definições, lemas, transliteração |
| `OriginalToken` | (fase 2) ocorrências por versículo |

A fase 1 importa o **léxico Strong** completo do Markdown para consulta offline.
