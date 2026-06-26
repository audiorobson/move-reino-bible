# Move Reino Bible

> Estudo bíblico profundo, assistido por IA, com fontes rastreáveis, originais bíblicos, comparação teológica e criação inteligente de estudos.

Plataforma bíblica em monorepo TypeScript com Electron (desktop), Fastify (API), Next.js (web) e pacotes internos modulares.

## Stack

- **Desktop:** Electron + React + Vite + Zustand + TanStack Query
- **API:** Fastify + Prisma + PostgreSQL + pgvector
- **Web:** Next.js (SaaS futuro)
- **Pacotes:** bible-core, search-engine, rag-engine, llm-gateway, ui-kit, etc.

## Estrutura

```
move-reino-bible/
├── apps/
│   ├── desktop/     # App Electron principal
│   ├── api/         # API REST Fastify
│   ├── web/         # Next.js SaaS
│   ├── admin/       # Admin editorial CLI
│   └── worker/      # Jobs: importação, embeddings
├── packages/        # Pacotes compartilhados
├── prisma/          # Schema e seeds
└── infra/           # Docker, PostgreSQL, Redis
```

## Módulos funcionais

| Módulo | Status |
|--------|--------|
| Bible Reader | ✅ Fase 1 — leitura, notas, favoritos, cópia |
| Parallel Bible | ✅ Fase 1 — até 4 colunas sincronizadas |
| Search Lab | ✅ MVP |
| Original Languages | ✅ Funcional (STEP + interlinear PT) |
| Strong & Concordance | ✅ Funcional |
| Study Builder | ✅ MVP |
| Thematic Chains | 🟡 UI + API (importação Torrey pendente) |
| Theology RAG | 🟡 MVP (indexação vetorial pendente) |
| AI Study Assistant | 🟡 MVP (mock LLM; OpenAI parcial) |
| Admin Editorial | ✅ CLI |
| Library (notas/favoritos) | ✅ UI |

## Início rápido

### Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL)

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar ambiente

```bash
cp .env.example .env
```

### 3. Subir infraestrutura

```bash
docker compose up -d
```

### 4. Banco de dados

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 6. Importar Bíblias

```bash
# Listar fontes disponíveis
pnpm import:bible --list

# Importação automática (BLIVRE + BSB + WEB via helloao API)
pnpm import:bible --all

# Uma versão específica
pnpm import:bible --helloao por_blj

# Arquivo JSON local (coloque em data/bibles/local/)
pnpm import:bible --file data/bibles/local/example-john1.json
```

Repositório de textos: `data/bibles/` — veja [data/bibles/README.md](./data/bibles/README.md)

```bash
# Importar textos originais STEP (NT completo)
pnpm import:step:nt

# Importar Antigo Testamento STEP
pnpm import:step:ot

# Amostra rápida (João 1)
pnpm import:step:sample

# API (porta 4000)
pnpm dev:api

# Desktop Electron (porta 5173)
pnpm dev:desktop
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Todos os apps em dev |
| `pnpm dev:desktop` | App Electron |
| `pnpm dev:api` | API Fastify |
| `pnpm build` | Build completo |
| `pnpm typecheck` | Verificação TypeScript |
| `pnpm test` | Testes |
| `pnpm db:migrate` | Migrations Prisma |
| `pnpm db:seed` | Seed (66 livros + João 1) |
| `pnpm import:step:nt` | Importar NT grego (STEP TAGNT) |
| `pnpm import:step:ot` | Importar AT hebraico (STEP TAHOT) |

## Segurança Electron

- `contextIsolation: true`
- `sandbox: true`
- `nodeIntegration: false`
- IPC validado com Zod
- Chaves de API criptografadas localmente
- CSP configurado

## Licenciamento

Nenhum conteúdo bíblico real é incluído sem licença rastreável. O seed usa apenas versículos de demonstração em domínio público.

## Roadmap

Ver `Move_Reino_Bible_DEV_SPEC.md` para especificação completa.

- **Fase 1:** ✅ MVP bíblico — leitura, busca, comparação, notas, favoritos
- **Fase 2 (atual):** Originais STEP, Strong, busca morfológica, concordância por livro
- **Fase 3:** Estudos completos, exportação
- **Fase 4:** IA com provedores reais
- **Fase 5:** RAG vetorial completo
- **Fase 6:** SaaS, auth, sync

Repositório: [github.com/audiorobson/move-reino-bible](https://github.com/audiorobson/move-reino-bible)

## Documentação

Especificação mestre: [Move_Reino_Bible_DEV_SPEC.md](./Move_Reino_Bible_DEV_SPEC.md)
