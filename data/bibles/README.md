# Repositório de Bíblias — Move Reino Bible

Este diretório centraliza **fontes bíblicas licenciadas** para importação no banco de dados.

## Estrutura

```
data/bibles/
├── manifest.json          # Catálogo de fontes (helloao + arquivos locais)
├── README.md              # Este arquivo
└── local/                 # Coloque seus JSONs de Bíblia aqui
    └── example-john1.json # Exemplo do formato aceito
```

## Importação automática (helloao API)

Fontes configuradas em `manifest.json` com `"type": "helloao"` e `"autoImport": true`:

| Abrev. | helloao ID | Licença |
|--------|------------|---------|
| BLIVRE | por_blj    | CC BY 4.0 |
| BSB    | BSB        | Domínio público |
| WEB    | ENGWEBP    | Domínio público |

### Comandos

```bash
# Importar todas as fontes com autoImport: true
pnpm import:bible --all

# Importar uma versão específica
pnpm import:bible --helloao BSB
pnpm import:bible --helloao por_blj

# Importar arquivo JSON local
pnpm import:bible --file data/bibles/local/meu-texto.json

# Listar fontes do manifest
pnpm import:bible --list
```

## Formato JSON local (`local/`)

Coloque arquivos `.json` em `data/bibles/local/` e registre em `manifest.json` ou importe direto:

```json
{
  "version": {
    "name": "Nome da Versão",
    "abbreviation": "SIGLA",
    "language": "pt-BR",
    "licenseType": "LICENSE_OK_CC_BY",
    "licenseUrl": "https://...",
    "sourceUrl": "origem do arquivo",
    "isPublicDomain": false,
    "attributionRequired": true
  },
  "verses": [
    {
      "book": "John",
      "chapter": 1,
      "verse": 1,
      "text": "No princípio era o Verbo..."
    }
  ]
}
```

### Campo `book`

Aceita **OSIS ID** (`John`, `Gen`, `Matt`) ou **ID helloao** (`JHN`, `GEN`, `MAT`).

### Tipos de licença (`licenseType`)

- `LICENSE_OK_PUBLIC_DOMAIN`
- `LICENSE_OK_CC_BY`
- `LICENSE_OK_CC_BY_SA` — use `"storageTier": "copyleft_isolated"` no manifest; mantenha `enabled: false` até isolamento de DB
- `LICENSE_UNKNOWN` — bloqueia importação

## Adicionar nova fonte helloao

1. Consulte traduções em https://bible.helloao.org/api/available_translations.json
2. Adicione entrada em `manifest.json`:

```json
{
  "type": "helloao",
  "helloaoId": "BSB",
  "abbreviation": "BSB",
  "name": "Berean Standard Bible",
  "language": "en",
  "licenseType": "LICENSE_OK_PUBLIC_DOMAIN",
  "autoImport": true,
  "storageTier": "primary",
  "enabled": true
}
```

3. Execute `pnpm import:bible --helloao BSB`

## Adicionar JSON manual

1. Crie `data/bibles/local/minha-biblia.json` no formato acima
2. Importe: `pnpm import:bible --file data/bibles/local/minha-biblia.json`

Ou registre em `manifest.json`:

```json
{
  "type": "local",
  "file": "minha-biblia.json",
  "enabled": true,
  "description": "Minha tradução customizada"
}
```

## API REST

```http
POST /api/v1/import/bible/file
Content-Type: application/json
{ "filePath": "data/bibles/local/example-john1.json" }

POST /api/v1/import/bible/helloao
{ "helloaoId": "BSB" }

POST /api/v1/import/bible/all
{ "helloaoOnly": ["BSB", "por_blj"] }
```

## Requisitos

- PostgreSQL rodando (`docker compose up -d`)
- Seed de livros: `pnpm db:seed`
- Conexão em `.env` → `DATABASE_URL`
