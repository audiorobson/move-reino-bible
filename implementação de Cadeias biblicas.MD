# PROMPT DEV — Importação de Cadeias Temáticas Bíblicas para o Move Bible

Você é um engenheiro de software sênior especializado em aplicações bíblicas, bancos de dados textuais, Electron, Node.js, SQLite, TypeScript e normalização de dados religiosos.

Estamos desenvolvendo o **Move Bible**, um aplicativo Electron/Node.js premium para estudo bíblico profundo, com Bíblias completas, léxicos, Strong, concordância, pesquisa semântica, cadeia temática de versículos, integração com IA e recursos visuais modernos.

Sua tarefa é criar o módulo:

**Move Chain System — Cadeias Temáticas Bíblicas**

O objetivo é implementar um sistema de versículos em cadeia temática, semelhante ao conceito da **Thompson Chain Reference Bible**, mas usando fontes abertas e tecnicamente seguras para importação.

---

## 1. Objetivo principal

Criar um sistema interno para o Move Bible capaz de:

1. Importar tópicos bíblicos.
2. Importar subtópicos.
3. Importar referências bíblicas ligadas a temas.
4. Criar cadeias sequenciais de versículos.
5. Permitir navegação do tipo:

```text
Tema → Subtema → Cadeia → Versículo → Próximo versículo relacionado
```

6. Permitir busca por tema, palavra-chave, livro, referência, Strong, léxico e similaridade semântica.
7. Gerar banco local SQLite/JSON otimizado para uso offline no Electron.
8. Manter rastreabilidade da fonte de cada dado importado.

---

## 2. Repositórios e fontes a localizar/importar

### 2.1 Base principal recomendada — Torrey Topical Textbook

Use como fonte inicial o projeto:

```text
GitHub:
gitrdm/torrey_bible_app

URL:
https://github.com/gitrdm/torrey_bible_app
```

Este repositório deve ser avaliado e importado como primeira base porque contém estrutura temática baseada em **Torrey New Topical Textbook**, com tópicos, subtópicos e referências bíblicas.

Tarefas:

1. Clonar o repositório.
2. Localizar os arquivos JSON ou assets de dados bíblicos.
3. Identificar estrutura de tópicos, subtópicos e referências.
4. Criar script de importação para o Move Bible.
5. Converter os dados para o schema oficial do Move Chain System.
6. Registrar a origem como:

```text
source = "torrey"
```

Comando sugerido:

```bash
git clone https://github.com/gitrdm/torrey_bible_app.git
```

---

### 2.2 Base complementar — Nave’s Topical Bible

Pesquisar e importar uma base Nave para enriquecer o sistema temático.

Fonte recomendada:

```text
GitHub:
basokant/nave

URL:
https://github.com/basokant/nave
```

Arquivos esperados:

```text
data/nave.txt
data/parsed-nave.json
```

Tarefas:

1. Clonar o repositório.
2. Verificar os arquivos `nave.txt` e `parsed-nave.json`.
3. Identificar tópicos, aliases, referências e blocos textuais.
4. Normalizar títulos de temas.
5. Unificar temas equivalentes com os temas do Torrey.
6. Registrar a origem como:

```text
source = "nave"
```

Comando sugerido:

```bash
git clone https://github.com/basokant/nave.git
```

---

### 2.3 Base CSV alternativa — Bible Data

Avaliar também o repositório:

```text
GitHub:
BradyStephenson/bible-data

URL:
https://github.com/BradyStephenson/bible-data
```

Arquivo de interesse:

```text
NavesTopicalDictionary.csv
```

Este repositório pode ser usado como fonte alternativa ou complementar para Nave, principalmente se o CSV estiver mais fácil de importar do que o JSON/texto bruto.

Tarefas:

1. Clonar o repositório.
2. Verificar o arquivo `NavesTopicalDictionary.csv`.
3. Criar parser CSV.
4. Comparar a qualidade dos dados com `basokant/nave`.
5. Usar apenas se a estrutura estiver limpa e juridicamente segura.
6. Registrar a origem como:

```text
source = "nave_csv"
```

Comando sugerido:

```bash
git clone https://github.com/BradyStephenson/bible-data.git
```

---

### 2.4 Base relacional inspiradora — MetaV

Avaliar o projeto:

```text
GitHub:
gusheng/MetaV

URL:
https://github.com/gusheng/MetaV
```

Este projeto pode conter tabelas ou arquivos úteis como:

```text
Topics
TopicIndex
```

A documentação indica que há uma combinação de dados de Nave e Torrey. Usar este repositório como referência para modelagem relacional.

Tarefas:

1. Clonar o repositório.
2. Localizar arquivos relacionados a `Topics` e `TopicIndex`.
3. Estudar o relacionamento entre tema e versículo.
4. Aproveitar a modelagem caso seja tecnicamente superior.
5. Não importar cegamente sem validar licença, estrutura e duplicidade.
6. Registrar origem como:

```text
source = "metav"
```

Comando sugerido:

```bash
git clone https://github.com/gusheng/MetaV.git
```

---

### 2.5 Thompson demonstrativo — inspiração de API/UI, não base final

Avaliar o repositório:

```text
GitHub:
Benighter/-Thompson-Chain-Reference-Bible

URL:
https://github.com/Benighter/-Thompson-Chain-Reference-Bible
```

Este projeto deve ser usado apenas como inspiração de arquitetura, porque a base de cadeias parece demonstrativa e pequena.

Pontos úteis:

1. API de cadeias.
2. Gerenciador de referências.
3. Estrutura de navegação por cadeia.
4. Exportação em JSON/HTML/texto.
5. Ideia de cadeias personalizadas.

Não usar como fonte principal de dados.

Registrar qualquer dado importado, caso seja usado, como:

```text
source = "thompson_demo"
```

Comando sugerido:

```bash
git clone https://github.com/Benighter/-Thompson-Chain-Reference-Bible.git
```

---

### 2.6 Thompson real — CrossWire/SWORD TCR

Além do GitHub, localizar e avaliar o módulo:

```text
CrossWire SWORD:
TCR — Thompson Chain Topics

Página:
https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=TCR
```

Este é o caminho mais próximo de uma base Thompson real. O Move Bible deve ter um importador SWORD opcional para esse tipo de módulo.

Tarefas:

1. Avaliar formato do módulo SWORD.
2. Verificar se pode ser baixado legalmente.
3. Verificar licença marcada como Public Domain.
4. Criar importador SWORD/TCR.
5. Converter entradas para o schema interno.
6. Registrar origem como:

```text
source = "tcr_sword"
```

Importante: este módulo deve ser tratado como fonte especial, pois é o mais próximo do conceito Thompson real.

---

## 3. Schema interno obrigatório

Criar banco SQLite com as seguintes tabelas mínimas:

```sql
CREATE TABLE IF NOT EXISTS chain_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  repository_url TEXT,
  license TEXT,
  notes TEXT,
  imported_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  parent_id INTEGER,
  description TEXT,
  source_key TEXT NOT NULL,
  external_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(parent_id) REFERENCES topics(id)
);

CREATE TABLE IF NOT EXISTS topic_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  source_key TEXT NOT NULL,
  FOREIGN KEY(topic_id) REFERENCES topics(id)
);

CREATE TABLE IF NOT EXISTS topic_verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  osis_ref TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_start INTEGER NOT NULL,
  verse_end INTEGER,
  chain_order INTEGER,
  source_key TEXT NOT NULL,
  note TEXT,
  confidence REAL DEFAULT 1.0,
  FOREIGN KEY(topic_id) REFERENCES topics(id)
);

CREATE TABLE IF NOT EXISTS chains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  description TEXT,
  source_key TEXT NOT NULL,
  external_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chain_nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chain_id INTEGER NOT NULL,
  osis_ref TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_start INTEGER NOT NULL,
  verse_end INTEGER,
  order_index INTEGER NOT NULL,
  note TEXT,
  previous_node_id INTEGER,
  next_node_id INTEGER,
  source_key TEXT NOT NULL,
  FOREIGN KEY(chain_id) REFERENCES chains(id),
  FOREIGN KEY(previous_node_id) REFERENCES chain_nodes(id),
  FOREIGN KEY(next_node_id) REFERENCES chain_nodes(id)
);

CREATE TABLE IF NOT EXISTS import_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_key TEXT NOT NULL,
  status TEXT NOT NULL,
  total_topics INTEGER DEFAULT 0,
  total_aliases INTEGER DEFAULT 0,
  total_topic_verses INTEGER DEFAULT 0,
  total_chains INTEGER DEFAULT 0,
  total_chain_nodes INTEGER DEFAULT 0,
  errors TEXT,
  imported_at TEXT NOT NULL
);
```

---

## 4. Normalização obrigatória

Implementar normalização para:

1. Nomes de livros bíblicos.
2. Abreviações em inglês.
3. Abreviações em português.
4. OSIS references.
5. Ranges de versículos.
6. Tópicos duplicados.
7. Sinônimos temáticos.

Exemplos:

```text
Gen 1:1 → Gen.1.1
Genesis 1:1 → Gen.1.1
Gn 1:1 → Gen.1.1
João 3:16 → John.3.16
John 3:16-18 → John.3.16-John.3.18
```

Criar um arquivo de mapeamento:

```text
src/shared/bible/books/osis-map.ts
```

Com estrutura:

```ts
export const OSIS_BOOK_MAP = {
  "Genesis": "Gen",
  "Gen": "Gen",
  "Gn": "Gen",
  "Gênesis": "Gen",
  "Exodus": "Exod",
  "Êxodo": "Exod",
  "John": "John",
  "João": "John",
};
```

---

## 5. Scripts de importação esperados

Criar os seguintes scripts:

```text
scripts/import-chain-sources/
  import-torrey.ts
  import-nave-json.ts
  import-nave-csv.ts
  import-metav.ts
  import-thompson-demo.ts
  import-tcr-sword.ts
  normalize-references.ts
  merge-topics.ts
  validate-chain-db.ts
  build-chain-index.ts
```

Cada importador deve:

1. Ler os dados da fonte.
2. Validar licença e metadados.
3. Converter referências para OSIS.
4. Inserir tópicos.
5. Inserir subtópicos.
6. Inserir versículos temáticos.
7. Criar logs de importação.
8. Gerar relatório final em Markdown.

Relatório esperado:

```text
docs/import-reports/chain-import-report.md
```

---

## 6. Integração com o Move Bible

Adicionar módulo em:

```text
src/modules/chains/
```

Estrutura sugerida:

```text
src/modules/chains/
  chain.types.ts
  chain.repository.ts
  chain.service.ts
  chain.search.ts
  chain.normalizer.ts
  chain.controller.ts
  chain.routes.ts
  chain-ai.service.ts
```

A API interna deve permitir:

```ts
searchTopics(query: string): Promise<Topic[]>

getTopicById(topicId: number): Promise<TopicDetail>

getVersesByTopic(topicId: number): Promise<TopicVerse[]>

getChainById(chainId: number): Promise<ChainDetail>

getNextChainNode(nodeId: number): Promise<ChainNode | null>

getRelatedTopics(topicId: number): Promise<Topic[]>

createUserChain(input: CreateUserChainInput): Promise<Chain>

exportChain(chainId: number, format: "json" | "markdown" | "html"): Promise<string>
```

---

## 7. Interface visual esperada

Criar uma interface premium dentro do Move Bible:

```text
Painel esquerdo:
- Busca temática
- Lista de tópicos
- Filtros por fonte: Torrey, Nave, TCR, Usuário

Painel central:
- Cadeia de versículos
- Versículo atual em destaque
- Botões: anterior, próximo, abrir contexto, comparar versões

Painel direito:
- Comentários
- Léxico
- Strong
- IA explicando conexão temática
- Tópicos relacionados
```

A navegação deve lembrar o conceito Thompson:

```text
Amor de Deus
  → João 3:16
  → Romanos 5:8
  → 1 João 4:9
  → 1 João 4:16
```

Mas com recursos modernos:

1. Busca inteligente.
2. IA para explicar por que os versículos estão relacionados.
3. Comparação de versões.
4. Exportação para estudo, sermão, célula ou devocional.
5. Criação de cadeias próprias pelo usuário.

---

## 8. Cuidados legais

Antes de importar dados:

1. Verificar licença de cada repositório.
2. Não importar material proprietário moderno sem autorização.
3. Registrar fonte e licença no banco.
4. Criar arquivo:

```text
docs/licenses/chain-sources.md
```

Este arquivo deve listar:

```text
Fonte
URL
Licença
Status de uso
Observações
Data da verificação
```

O sistema deve bloquear importação de fonte sem licença clara, exceto em ambiente experimental local.

---

## 9. Resultado final esperado

Entregar:

1. Banco SQLite `move_chain.sqlite`.
2. Scripts de importação funcionando.
3. Relatório de importação em Markdown.
4. API interna do módulo `chains`.
5. Interface inicial integrada ao Move Bible.
6. Sistema preparado para Torrey, Nave, MetaV e TCR/SWORD.
7. Testes automatizados para parsing, normalização e busca.

---

## 10. Ordem de execução recomendada

Executar nesta ordem:

```text
1. Criar schema SQLite.
2. Criar normalizador OSIS.
3. Importar Torrey.
4. Importar Nave.
5. Mesclar tópicos duplicados.
6. Criar índice de busca.
7. Criar API local.
8. Criar tela inicial de cadeias temáticas.
9. Avaliar MetaV.
10. Criar importador TCR/SWORD.
11. Adicionar IA explicativa.
12. Criar exportação Markdown/HTML/JSON.
```

---

## 11. Critério de qualidade

O módulo só deve ser considerado aprovado quando:

1. Tiver no mínimo uma base Torrey importada.
2. Conseguir pesquisar temas por palavra-chave.
3. Conseguir abrir um tema e listar referências.
4. Conseguir abrir uma referência no leitor bíblico do Move Bible.
5. Conseguir navegar de um versículo para o próximo dentro de uma cadeia.
6. Registrar fonte e licença de cada item.
7. Funcionar offline.
8. Não quebrar a arquitetura Electron/Node.js do Move Bible.

---

## 12. Nome interno do módulo

Usar o nome técnico:

```text
Move Chain System
```

Nome de interface para o usuário:

```text
Cadeias Bíblicas
```

Subtítulo visual:

```text
Estude temas bíblicos por conexões, referências e cadeias de versículos.
```
