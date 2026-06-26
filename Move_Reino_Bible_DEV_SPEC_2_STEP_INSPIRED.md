# Move Reino Bible — DEV SPEC 2.0 STEP-Inspired Premium Edition

**Produto:** Move Reino Bible / Move Bible  
**Documento:** Atualização DEV 2.0 — motor bíblico inspirado no STEPBible + experiência premium + IA/RAG  
**Status:** especificação detalhada para desenvolvimento por equipe humana ou LLM programadora  
**Data:** 2026-06-15  
**Stack-alvo:** Electron + Node.js + React + TypeScript + PostgreSQL + SQLite offline + Search Engine + Vector DB + LLM Gateway  

---

## 0. Objetivo desta atualização 2.0

Este documento atualiza o plano DEV original do **Move Reino Bible** para aproximar a aplicação, em profundidade funcional, da experiência de estudo técnico oferecida pelo **STEPBible**, preservando a identidade visual premium da marca Move Reino, a interface moderna, a integração com IA por chave de API, o RAG teológico e a criação de estudos.

A meta do DEV 2.0 é transformar o Move Bible em um produto com três pilares:

1. **Profundidade bíblico-linguística** equivalente ao padrão de ferramentas como STEPBible: textos originais, Strong, léxicos, morfologia, interlinear, concordância, versificação e busca avançada.
2. **Experiência visual premium Move Reino**: azul profundo, dourado coroa, tipografia elegante, modo escuro, leitura confortável, painéis modernos e fluxo claro de estudo.
3. **Camada inteligente de IA/RAG**: interpretação rastreável por fontes, comparação teológica por tradição, geração de estudos, uso de web controlado e biblioteca teológica vetorizada.

---

## 1. Limite ético, técnico e jurídico: copiar vs. inspirar

### 1.1 O que podemos fazer

Podemos nos inspirar em **comportamentos funcionais**, fluxos públicos, conceitos de UX, modelos de dados abertos, documentação pública e datasets licenciados.

Exemplos permitidos:

- implementar busca por Strong;
- criar interlinear grego/hebraico;
- criar painel de palavra original;
- permitir comparação de versões;
- criar busca por morfologia;
- importar datasets públicos do STEPBible-Data quando a licença permitir;
- estudar o BibleEngine como referência arquitetural;
- criar linguagem própria de consulta inspirada na ideia de prefixos técnicos;
- criar versification mapping;
- criar tooltips e painéis de vocabulário.

### 1.2 O que não devemos fazer

Não devemos copiar:

- código-fonte proprietário;
- layout exato;
- marcas, ícones, textos visuais ou identidade do STEPBible;
- conteúdo bíblico protegido sem licença;
- comentários/licenças restritas sem permissão;
- assets gráficos, screenshots, CSS, componentes ou textos editoriais protegidos.

### 1.3 Diretriz oficial

> O Move Reino Bible deve alcançar **paridade funcional inspirada**, mas com implementação própria, identidade própria, arquitetura própria e política rígida de licenciamento.

---

## 2. Referências técnicas públicas usadas como inspiração

### 2.1 STEPBible.org

Referência de produto para estudo bíblico técnico, com leitura bíblica, recursos de linguagem original, busca, interlinear, comentários e uso offline.

**URL:** https://www.stepbible.org/

### 2.2 STEPBible User Guide — Advanced Search

Referência para quatro modos de busca avançada:

- advanced text search;
- specific Greek/Hebrew form;
- related by topic;
- free search.

**URL:** https://stepbibleguide.blogspot.com/p/advanced-search.html

### 2.3 STEPBible User Guide — Original Language Tools

Referência para:

- vocabulary by verse;
- vocabulary by word;
- interlinear vocabulary;
- grammar;
- color-coded grammar.

**URL:** https://stepbibleguide.blogspot.com/p/tools.html

### 2.4 STEPBible-Data

Repositório público com dados bíblicos em formato de texto tabulado, incluindo léxicos, morfologia, tagged Bibles, nomes próprios e versificação.

**URL:** https://github.com/STEPBible/STEPBible-Data

### 2.5 BibleEngine

Biblioteca TypeScript/JavaScript do ecossistema STEPBible para projetos bíblicos, com conceitos como conversão de versificação, dados originais, morfologia, matching de texto-fonte e glosses.

**URL:** https://github.com/STEPBible/BibleEngine

---

## 3. Nova visão DEV 2.0

O Move Reino Bible 2.0 deve ser desenvolvido como uma aplicação de estudo bíblico em camadas:

```txt
Camada 1 — Reader Premium
Leitura bíblica, comparação de versões, notas, histórico e favoritos.

Camada 2 — Biblical Language Engine
Texto original, Strong, Extended Strong, lema, morfologia, transliteração, glosses e concordância.

Camada 3 — Search & Discovery Engine
Busca textual, busca por palavra original, busca por Strong, busca morfológica, busca temática, busca semântica e busca RAG.

Camada 4 — Study Workspace
Estudos, cadeias temáticas, editor, exportação, sermões, aulas e devocionais.

Camada 5 — AI/RAG Theology Engine
LLM por chave de API, RAG teológico, fontes, comparação de tradições e interpretações rastreáveis.

Camada 6 — SaaS/Sync/Admin
Contas, sincronização, bibliotecas, permissões, equipes, logs, licenças e marketplace futuro.
```

---

## 4. Matriz de paridade funcional com STEPBible

| Função observada no STEPBible | Implementação Move Bible 2.0 | Nível de prioridade | Diferencial Move Reino |
|---|---|---:|---|
| Abrir várias Bíblias | Comparação até 4 colunas | Alta | Layout premium com colunas sincronizadas e IA contextual |
| Comparação de versões | Parallel Bible View | Alta | Destaque semântico de diferenças e análise IA |
| Vocabulário por versículo | Verse Vocabulary Panel | Alta | Cada versículo vira hub de estudo com IA/RAG |
| Vocabulário por palavra | Original Word Drawer | Alta | Painel lateral premium com Strong, lema, morfologia, definições e estudos salvos |
| Interlinear | Interlinear Studio | Alta | Camadas configuráveis + botão “Analisar com IA” |
| Gramática colorida | Grammar Color Layer | Média/Alta | Paleta elegante e configurável, sem poluição visual |
| Busca avançada | Move Query Builder | Alta | Interface visual + sintaxe especialista própria |
| Busca grego/hebraico | Original Language Search | Alta | Busca por lema, forma, transliteração e Strong |
| Busca por tópico | Topic & Chain Search | Média/Alta | Integração com cadeias temáticas e teologia RAG |
| Busca livre com prefixos | Move Bible Query Language | Alta | Prefixos próprios + parser + filtros visuais |
| Referências relacionadas | Cross Reference Engine | Média/Alta | Vinculação com IA e cadeias temáticas |
| Léxicos BDB/LSJ/Strong | Lexicon Hub | Alta | Licenciamento rastreável + RAG lexical |
| Versificação | Versification Mapping Engine | Alta | Suporte a tradição hebraica, grega, latina, inglesa e custom |
| Offline | Desktop offline-first | Alta | SQLite local + sincronização cloud |
| Muitos idiomas | Multi-language architecture | Média | Interface e conteúdo separados por locale |
| Comentários | Commentary Library | Média | Curadoria por tradição, licença e fonte |
| IA inexistente ou limitada | AI Study Assistant | Crítico | Principal diferencial do produto |

---

## 5. Nova arquitetura do monorepo DEV 2.0

```txt
move-reino-bible/
├─ apps/
│  ├─ desktop/                         # Electron + React + Vite
│  ├─ web/                             # Next.js SaaS/web
│  ├─ api/                             # Node.js API
│  ├─ admin/                           # Painel editorial/licenças/RAG
│  ├─ worker/                          # filas, importações, embeddings
│  └─ cli/                             # ferramentas DEV: import, validate, index
│
├─ packages/
│  ├─ bible-core/                      # entidades bíblicas centrais
│  ├─ bible-reader-engine/             # leitura, range, navigation
│  ├─ bible-versioning/                # versões, licenças, metadados
│  ├─ versification-engine/            # alinhamento de versículos
│  ├─ step-data-importer/              # importador STEPBible-Data TSV
│  ├─ osis-importer/                   # OSIS import
│  ├─ usfm-importer/                   # USFM import
│  ├─ sword-importer/                  # futuro: SWORD modules
│  ├─ original-language-engine/        # grego, hebraico, tokens, morfologia
│  ├─ strong-engine/                   # Strong / Extended Strong
│  ├─ lexicon-engine/                  # BDB, LSJ, Abbott-Smith etc.
│  ├─ concordance-engine/              # ocorrências por palavra/lema/Strong
│  ├─ search-engine/                   # textual + lexical + morfológica
│  ├─ move-query-language/             # parser da linguagem de busca MRQL
│  ├─ topic-engine/                    # temas, cadeias, Nave-like future
│  ├─ cross-reference-engine/          # refs cruzadas e relacionadas
│  ├─ rag-engine/                      # RAG teológico e semântico
│  ├─ llm-gateway/                     # OpenAI, Anthropic, Gemini, Ollama etc.
│  ├─ study-engine/                    # estudos, blocos, exportação
│  ├─ citation-engine/                 # citação de fontes, licenças e bibliografia
│  ├─ ui-kit/                          # design system Move Reino
│  ├─ icons/                           # ícones lineares próprios
│  ├─ shared-types/                    # DTOs, enums, schemas Zod
│  └─ telemetry/                       # eventos locais e métricas de qualidade
│
├─ data/
│  ├─ raw/                             # dados brutos não versionados no git
│  ├─ staged/                          # dados convertidos antes da validação
│  ├─ seeds/                           # dados mínimos para DEV/test
│  ├─ licenses/                        # snapshots de licenças
│  └─ attribution/                     # créditos exigidos por dataset
│
├─ docs/
│  ├─ DEV_SPEC.md
│  ├─ DEV_SPEC_2_STEP_INSPIRED.md
│  ├─ VISUAL_IDENTITY.md
│  ├─ LICENSING_POLICY.md
│  ├─ RAG_POLICY.md
│  ├─ AI_PROMPTS.md
│  ├─ QUERY_LANGUAGE.md
│  ├─ DATA_IMPORT_PIPELINE.md
│  └─ SECURITY.md
│
├─ infra/
│  ├─ docker-compose.yml
│  ├─ postgres/
│  ├─ qdrant/
│  ├─ redis/
│  ├─ meilisearch/
│  ├─ nginx/
│  └─ backup/
│
└─ tests/
   ├─ fixtures/
   ├─ integration/
   ├─ e2e/
   ├─ data-validation/
   └─ search-golden-tests/
```

---

## 6. Módulos DEV 2.0 obrigatórios

## 6.1 Module A — Premium Bible Reader

### Objetivo

Criar o leitor bíblico principal com aparência premium, navegação rápida e base técnica compatível com múltiplas versões, notas, títulos, parágrafos e diferentes versificações.

### Funcionalidades

```txt
- Abrir versão bíblica.
- Abrir livro/capítulo/versículo.
- Selecionar intervalo: Jo 1; Jo 1:1-18; Rm 8:1-11.
- Exibir títulos editoriais separadamente.
- Exibir notas de rodapé.
- Exibir números de versículo.
- Selecionar versículo.
- Enviar versículo para painel IA.
- Adicionar versículo ao estudo.
- Abrir referências cruzadas.
- Abrir palavras originais do versículo.
- Alternar tema escuro/claro/sépia.
- Ajustar tamanho de fonte, altura de linha e largura de coluna.
```

### Componentes React

```txt
<BibleReaderPage />
<BibleToolbar />
<BibleVersionSelector />
<BookChapterSelector />
<PassageInput />
<BibleText />
<BibleParagraph />
<BibleVerse />
<VerseNumber />
<VerseActionsPopover />
<FootnoteMarker />
<EditorialHeading />
<ReaderSettingsDrawer />
```

### Critérios de aceite

```txt
1. O usuário consegue abrir uma passagem em até 2 cliques após a tela carregada.
2. O texto bíblico permanece legível em sessões longas.
3. O versículo selecionado abre ações contextuais sem recarregar a página.
4. A troca de versão preserva a referência atual.
5. A interface não quebra com livros de capítulos longos, como Salmos 119.
```

---

## 6.2 Module B — Parallel Bible Premium View

### Objetivo

Implementar comparação de até 4 textos lado a lado, inspirada em ferramentas clássicas, porém com UX premium, sincronização por versículo e integração IA.

### Modos de exibição

```txt
1. Colunas lado a lado.
2. Linhas intercaladas por versículo.
3. Texto original + tradução.
4. Duas traduções + comentário.
5. Quatro versões simultâneas.
6. Modo diferença textual.
7. Modo estudo com painel lateral.
```

### Recursos técnicos

```txt
- Scroll sincronizado.
- Cabeçalho fixo por coluna.
- Alinhamento por canonicalVerseId.
- Fallback por VerseMapping quando a versão tiver versificação diferente.
- Destaque de palavras equivalentes, quando houver tagging.
- Comparação lexical básica.
- Exportação de comparação para estudo.
```

### Componentes

```txt
<ParallelBiblePage />
<ParallelColumn />
<VersionColumnHeader />
<SyncedVerseRow />
<VerseAlignmentWarning />
<DiffHighlight />
<CompareWithAIButton />
```

### Critérios de aceite

```txt
1. O sistema exibe 2, 3 ou 4 colunas sem perder legibilidade.
2. Em telas menores, colunas viram abas horizontais ou carrossel.
3. Versículos desalinhados são indicados com aviso discreto.
4. O usuário pode enviar uma linha comparada para a IA.
5. A comparação pode ser salva como StudyBlock.
```

---

## 6.3 Module C — STEP-Inspired Original Language Engine

### Objetivo

Criar o motor de língua original do Move Bible, com tokens originais grego/hebraico, Strong, Extended Strong, lema, morfologia, transliteração, gloss, ocorrências e léxicos.

### Entidades principais

```ts
export type Testament = "OT" | "NT";

export type OriginalLanguage = "hebrew" | "aramaic" | "greek";

export type OriginalToken = {
  id: string;
  testament: Testament;
  language: OriginalLanguage;
  canonicalVerseId: string;
  bookCode: string;
  chapter: number;
  verse: number;
  tokenIndex: number;
  subTokenIndex?: number;

  surface: string;
  normalizedSurface: string;
  lemma: string;
  normalizedLemma: string;
  transliteration?: string;

  strongNumber?: string;
  extendedStrong?: string;
  semanticStrong?: string;

  morphologyCode?: string;
  morphologyExpanded?: MorphologyExpanded;

  glossPt?: string;
  glossEn?: string;
  contextualGloss?: string;

  sourceEdition?: string;
  sourceDataset?: string;
  sourceLicenseId?: string;
};

export type MorphologyExpanded = {
  partOfSpeech?: string;
  tense?: string;
  voice?: string;
  mood?: string;
  case?: string;
  gender?: string;
  number?: string;
  person?: string;
  state?: string;
  stem?: string;
  aspect?: string;
  degree?: string;
  explanation?: string;
  examples?: string[];
};
```

### Banco de dados

```sql
CREATE TABLE original_token (
  id UUID PRIMARY KEY,
  testament TEXT NOT NULL,
  language TEXT NOT NULL,
  canonical_verse_id UUID NOT NULL,
  book_code TEXT NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  token_index INT NOT NULL,
  sub_token_index INT,
  surface TEXT NOT NULL,
  normalized_surface TEXT,
  lemma TEXT,
  normalized_lemma TEXT,
  transliteration TEXT,
  strong_number TEXT,
  extended_strong TEXT,
  semantic_strong TEXT,
  morphology_code TEXT,
  morphology_json JSONB,
  gloss_pt TEXT,
  gloss_en TEXT,
  contextual_gloss TEXT,
  source_edition TEXT,
  source_dataset TEXT,
  source_license_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_original_token_verse ON original_token(canonical_verse_id);
CREATE INDEX idx_original_token_strong ON original_token(strong_number);
CREATE INDEX idx_original_token_extended_strong ON original_token(extended_strong);
CREATE INDEX idx_original_token_lemma ON original_token(normalized_lemma);
CREATE INDEX idx_original_token_surface ON original_token(normalized_surface);
CREATE INDEX idx_original_token_morph ON original_token(morphology_code);
CREATE INDEX idx_original_token_language ON original_token(language);
```

### Funcionalidades

```txt
- Tokenizar texto original por versículo.
- Relacionar token original com versão/tradução, quando possível.
- Exibir tooltip rápido ao passar o mouse.
- Exibir drawer completo ao clicar.
- Listar ocorrências do lema.
- Listar ocorrências do Strong.
- Listar ocorrências por livro.
- Exibir morfologia expandida.
- Explicar morfologia em linguagem simples.
- Enviar token para IA contextual.
- Criar estudo de palavra.
```

---

## 6.4 Module D — Verse Vocabulary Panel

### Inspiração funcional

O STEPBible permite clicar no número do versículo para ver palavras originais daquele versículo. O Move Bible deve implementar esse conceito de forma premium.

### Fluxo UX

```txt
Usuário clica no número do versículo
→ abre popover ou painel lateral
→ lista palavras originais do versículo
→ cada palavra mostra lema, Strong, gloss e ocorrência
→ usuário clica em palavra
→ abre Original Word Drawer completo
```

### UI proposta

```txt
João 1:1 — Palavras originais

Ἐν        G1722  prep.      em, dentro de
ἀρχῇ      G746   noun dat.  princípio, origem
ἦν        G2258  verb       era, existia
ὁ         G3588  article    o
λόγος     G3056  noun nom.  palavra, verbo, razão
```

### Componentes

```txt
<VerseVocabularyPopover />
<VerseVocabularyList />
<VerseVocabularyItem />
<OccurrenceMiniBadge />
<OpenOriginalWordButton />
```

---

## 6.5 Module E — Original Word Drawer

### Objetivo

Criar o painel completo de análise lexical, substituindo a experiência dispersa por um centro premium de estudo de palavra.

### Seções do drawer

```txt
1. Cabeçalho
   - forma original
   - transliteração
   - Strong / Extended Strong
   - idioma

2. Definição curta
   - gloss em português
   - gloss em inglês
   - definição resumida

3. Morfologia
   - código original
   - expansão técnica
   - explicação simples

4. Léxicos
   - Strong clássico
   - léxico breve
   - BDB/LSJ quando licenciado
   - notas de fonte

5. Ocorrências
   - total Bíblia
   - total AT/NT
   - por livro
   - por autor/corpus futuro

6. Contextos principais
   - primeiros 20 resultados
   - filtro por livro
   - filtro por sentido

7. Palavras relacionadas
   - mesmo radical
   - mesmo domínio semântico
   - cognatos
   - sinônimos

8. Ações
   - Criar estudo desta palavra
   - Comparar traduções desta palavra
   - Perguntar à IA
   - Ver em RAG teológico
```

### Componentes

```txt
<OriginalWordDrawer />
<WordHeader />
<StrongBadge />
<MorphologyTable />
<LexiconTabs />
<OccurrenceChart />
<OccurrenceList />
<RelatedWords />
<AIWordActions />
```

---

## 6.6 Module F — Interlinear Studio

### Objetivo

Implementar um modo interlinear configurável com camadas ligáveis/desligáveis, preservando clareza visual.

### Camadas interlineares

```txt
[ ] Tradução principal
[ ] Texto original
[ ] Transliteração
[ ] Lema
[ ] Strong
[ ] Morfologia curta
[ ] Morfologia expandida
[ ] Gloss literal
[ ] Cor gramatical
[ ] Variações textuais futuras
```

### Layout técnico

```txt
Português:     No princípio      era        o Verbo
Grego:         Ἐν ἀρχῇ           ἦν         ὁ λόγος
Translit.:     en archē          ēn         ho logos
Strong:        G1722 G746        G2258      G3588 G3056
Morph:         PREP N-DSF        V-IAI-3S   T-NSM N-NSM
Gloss:         em princípio      era        o palavra
```

### CSS visual premium

```css
.interlinear-token {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(209, 160, 88, 0.12);
  background: rgba(255,255,255,0.02);
}

.interlinear-token:hover {
  border-color: rgba(209, 160, 88, 0.38);
  background: rgba(209,160,88,0.08);
}

.interlinear-original {
  font-family: var(--font-greek), var(--font-hebrew), serif;
  font-size: 1.22rem;
  color: var(--text-main-dark);
}

.interlinear-strong {
  color: var(--mr-gold-600);
  font-size: 0.72rem;
  font-weight: 700;
}
```

---

## 6.7 Module G — Grammar Color Layer

### Objetivo

Oferecer codificação visual gramatical sem poluir a leitura.

### Regras

```txt
1. Cores gramaticais só aparecem quando o modo estiver ativado.
2. O padrão visual deve ser discreto: sublinhado, borda inferior ou badge pequeno.
3. O usuário pode escolher o que colorir: parte do discurso, caso, tempo, voz, modo.
4. Deve existir legenda gramatical.
5. Deve existir modo "explicar gramática" para leigos.
```

### Exemplo de mapeamento

```txt
Verbo: azul claro
Substantivo: dourado suave
Adjetivo: verde suave
Artigo: cinza
Preposição: ciano
Conjunção: roxo discreto
Pronome: laranja suave
Partícula: prata
```

### Critério de aceite

```txt
A codificação gramatical ajuda o estudo, mas nunca deve competir visualmente com o texto bíblico.
```

---

## 6.8 Module H — Move Bible Query Language — MBQL

### Objetivo

Criar uma linguagem de busca própria, inspirada no conceito de prefixos avançados, mas com nomes claros, documentação própria e construtor visual.

### Regras de design

```txt
- Usuário comum usa filtros visuais.
- Usuário avançado pode digitar comandos.
- A sintaxe deve ser previsível e traduzível para filtros internos.
- Toda query deve poder ser salva.
- Toda query deve poder virar cadeia temática ou estudo.
```

### Prefixos MBQL

```txt
text:amor                       busca textual normal
phrase:"o amor de Deus"         frase exata
ref:Joao.3.16                   referência exata
range:Rm.8.1-11                 intervalo
book:Romanos                    escopo por livro
testament:NT                    escopo por testamento
version:ACF                     versão

strong:G26                      Strong grego
strong:H2617                    Strong hebraico
xstrong:G3056.1                 Extended Strong
lemma:agape                     lema transliterado
greek:λόγος                     forma grega
hebrew:חסד                      forma hebraica
translit:hesed                  transliteração
morph:V-IAI-3S                  código morfológico
pos:verb                        parte do discurso
case:nominative                 caso gramatical
tense:aorist                    tempo verbal
voice:active                    voz
mood:indicative                 modo

wordTranslatedAs:amor           original traduzido como "amor"
originalRelated:agape           palavras originais relacionadas

xref:Joao.3.16                  refs cruzadas
topic:aliança                   tema
doctrine:justificação           doutrina
person:Davi                     pessoa bíblica
place:Jerusalém                 lugar bíblico

rag:calvino                     busca RAG geral
tradition:reformada             filtra tradição
source:Calvino                  filtra fonte
century:16                      filtra século

ai:"explique Romanos 9"         pergunta para IA com contexto
web:"artigo acadêmico Romanos 9" busca web controlada
```

### Operadores

```txt
AND
OR
NOT
+
-
()
"frase exata"
*
?
~ fuzzy
NEAR/n proximidade
```

### Exemplos

```txt
strong:G26 AND book:Joao
lemma:logos AND book:Joao
text:fé AND text:obras AND range:Tg.2.14-26
greek:λόγος OR lemma:logos
morph:V-IAI-3S AND book:Joao
topic:aliança AND testament:OT
tradition:reformada AND rag:"Romanos 9"
strong:H2617 NEAR/3 aliança
```

### Parser interno

```ts
export type MBQLAst = {
  type: "query";
  nodes: MBQLNode[];
};

export type MBQLNode =
  | { type: "term"; field?: string; value: string; fuzzy?: boolean }
  | { type: "phrase"; field?: string; value: string }
  | { type: "boolean"; operator: "AND" | "OR" | "NOT"; left: MBQLNode; right: MBQLNode }
  | { type: "proximity"; distance: number; terms: MBQLNode[] }
  | { type: "range"; field: string; from: string; to: string };
```

---

## 6.9 Module I — Advanced Search Builder

### Objetivo

Criar uma interface visual para gerar queries avançadas sem exigir que o usuário memorize MBQL.

### Abas

```txt
1. Texto bíblico
2. Palavra original
3. Strong / Léxico
4. Morfologia
5. Tema / Pessoa / Lugar
6. RAG teológico
7. Busca livre especialista
```

### Aba “Texto bíblico”

Campos:

```txt
- termo
- frase exata
- qualquer palavra
- todas as palavras
- excluir palavra
- palavras próximas
- escopo: Bíblia inteira, AT, NT, livro, intervalo
- versão bíblica
```

### Aba “Palavra original”

Campos:

```txt
- idioma: grego, hebraico, aramaico
- forma original
- lema
- transliteração
- Strong
- palavras relacionadas
- traduzida como...
```

### Aba “Morfologia”

Campos:

```txt
- parte do discurso
- tempo
- voz
- modo
- caso
- gênero
- número
- pessoa
- estado
- stem
```

### Aba “RAG teológico”

Campos:

```txt
- tradição
- autor
- obra
- século
- doutrina
- passagem bíblica
- nível de fonte
- idioma
```

---

## 6.10 Module J — Concordance Engine

### Objetivo

Criar concordância completa por palavra, lema, Strong, Extended Strong, forma original, palavra traduzida e conceito.

### Tipos de concordância

```txt
1. Concordância textual — palavra em português/inglês/etc.
2. Concordância Strong — G3056, H2617 etc.
3. Concordância por lema — logos, hesed etc.
4. Concordância morfológica — todos os verbos aoristos etc.
5. Concordância semântica — palavras relacionadas por domínio.
6. Concordância temática — passagens relacionadas a um tema.
7. Concordância RAG — fontes teológicas que citam ou discutem a passagem.
```

### UI

```txt
Cabeçalho:
λόγος — G3056 — logos
Ocorrências: 330 no NT | 40 em João | 24 em 1 João

Filtros:
[Livro] [Corpus] [Morfologia] [Tradução] [Tema]

Lista:
Jo 1:1 — No princípio era o Verbo...
Jo 1:14 — E o Verbo se fez carne...
1Jo 1:1 — ...a Palavra da vida...
```

### API

```http
GET /api/concordance/strong/G3056
GET /api/concordance/lemma/logos
GET /api/concordance/text?term=amor&version=ACF
GET /api/concordance/morph?code=V-IAI-3S
GET /api/concordance/concept?topic=aliança
```

---

## 6.11 Module K — Versification Mapping Engine

### Objetivo

Suportar diferenças de versificação entre tradições e versões.

### Problema

Bíblias podem divergir em numeração, divisão de capítulos, presença de livros deuterocanônicos, títulos de salmos e agrupamento de versículos.

### Modelo

```sql
CREATE TABLE canonical_verse (
  id UUID PRIMARY KEY,
  canonical_book_code TEXT NOT NULL,
  canonical_chapter INT NOT NULL,
  canonical_verse INT NOT NULL,
  testament TEXT NOT NULL,
  standard_ref TEXT NOT NULL
);

CREATE TABLE verse_mapping (
  id UUID PRIMARY KEY,
  canonical_verse_id UUID NOT NULL REFERENCES canonical_verse(id),
  version_id UUID NOT NULL,
  local_book_code TEXT NOT NULL,
  local_chapter INT NOT NULL,
  local_verse TEXT NOT NULL,
  local_ref TEXT NOT NULL,
  mapping_type TEXT NOT NULL, -- exact, split, merged, missing, extra, title, uncertain
  confidence NUMERIC(4,3) DEFAULT 1.0,
  notes TEXT
);
```

### Funcionalidades

```txt
- Converter referência local para referência canônica.
- Converter referência canônica para versão local.
- Detectar versículos ausentes/mesclados.
- Alinhar colunas paralelas.
- Mostrar aviso discreto quando a comparação não for exata.
- Permitir mapas de versificação por tradição: English, Hebrew, Greek, Latin, Catholic, Custom.
```

---

## 6.12 Module L — STEPBible-Data Import Pipeline

### Objetivo

Criar pipeline seguro para importar datasets públicos do STEPBible-Data, com licença, transformação, validação e atribuição.

### Datasets candidatos

```txt
TAHOT — Hebrew OT com tags morfológicas e semânticas
TAGNT — Greek NT amalgamado com variantes e tags
TBESH — léxico breve hebraico Extended Strongs
TBESG — léxico breve grego Extended Strongs
TFLSJ — LSJ formatado para palavras bíblicas
TIPNR — nomes próprios, pessoas, lugares e referências
TVTMS — tradições de versificação
TEHMC — expansão de códigos morfológicos hebraicos
TEGMC — expansão de códigos morfológicos gregos
```

### Pipeline

```txt
1. Download manual ou scriptado para data/raw/stepbible.
2. Capturar data, commit hash, URL, licença e checksum.
3. Validar encoding UTF-8.
4. Validar delimitador TAB.
5. Converter para JSONL intermediário em data/staged.
6. Normalizar campos.
7. Rodar validação Zod.
8. Inserir em tabelas staging.
9. Gerar relatório de erros.
10. Aprovar importação.
11. Inserir em tabelas finais.
12. Atualizar tabela de atribuições.
```

### CLI

```bash
pnpm mrb import:step --dataset TAGNT --source ./data/raw/step/TAGNT.tsv
pnpm mrb import:step --dataset TAHOT --source ./data/raw/step/TAHOT.tsv
pnpm mrb validate:dataset --dataset TAGNT
pnpm mrb licenses:check
pnpm mrb attribution:generate
```

### Tabela de licença

```sql
CREATE TABLE source_license (
  id UUID PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  license_name TEXT NOT NULL,
  license_url TEXT,
  attribution_text TEXT,
  commercial_allowed BOOLEAN,
  redistribution_allowed BOOLEAN,
  modification_allowed BOOLEAN,
  imported_at TIMESTAMP DEFAULT NOW(),
  source_commit_hash TEXT,
  checksum TEXT,
  notes TEXT
);
```

### Regra obrigatória

```txt
Nenhum dado importado aparece na aplicação sem vínculo com source_license.
```

---

## 6.13 Module M — Lexicon Hub

### Objetivo

Centralizar léxicos e definições por Strong/Extended Strong/lema.

### Modelo

```sql
CREATE TABLE lexicon_entry (
  id UUID PRIMARY KEY,
  language TEXT NOT NULL,
  strong_number TEXT,
  extended_strong TEXT,
  lemma TEXT,
  transliteration TEXT,
  pronunciation TEXT,
  short_definition TEXT,
  long_definition TEXT,
  semantic_domain TEXT,
  source_name TEXT NOT NULL,
  source_license_id UUID REFERENCES source_license(id),
  raw_entry JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lexicon_strong ON lexicon_entry(strong_number);
CREATE INDEX idx_lexicon_extended ON lexicon_entry(extended_strong);
CREATE INDEX idx_lexicon_lemma ON lexicon_entry(lemma);
```

### UX

```txt
Lexicon Hub deve abrir como:
- painel lateral quando chamado a partir de palavra;
- página completa quando chamado pela busca;
- modal compacto em hover.
```

---

## 6.14 Module N — Cross Reference & Related Topics Engine

### Objetivo

Cada versículo deve virar um hub com referências cruzadas, temas, pessoas, lugares, palavras e fontes RAG.

### Entidades

```sql
CREATE TABLE cross_reference (
  id UUID PRIMARY KEY,
  source_verse_id UUID NOT NULL,
  target_verse_id UUID NOT NULL,
  relation_type TEXT NOT NULL, -- quote, allusion, parallel, topic, prophecy, fulfillment
  strength NUMERIC(4,3),
  source_dataset TEXT,
  source_license_id UUID
);

CREATE TABLE topic (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_topic_id UUID
);

CREATE TABLE topic_verse (
  id UUID PRIMARY KEY,
  topic_id UUID NOT NULL,
  verse_id UUID NOT NULL,
  confidence NUMERIC(4,3),
  source_dataset TEXT
);
```

### Painel de versículo

```txt
Ao selecionar João 3:16:
- Texto em versões abertas
- Palavras originais
- Strong principais
- Referências cruzadas
- Temas: amor, vida eterna, fé, Filho de Deus
- Comentários relacionados
- Interpretações por tradição
- Estudos do usuário
- IA contextual
```

---

## 6.15 Module O — AI Study Assistant 2.0

### Objetivo

Integrar IA de forma nativa ao motor bíblico, não como chatbot isolado.

### Contextos automáticos

A IA deve receber contexto estruturado conforme ação do usuário:

```txt
1. Passagem bíblica selecionada.
2. Versões abertas.
3. Tokens originais relevantes.
4. Strong/léxico selecionado.
5. Morfologia expandida.
6. Comentários/RAG recuperados.
7. Tradição teológica escolhida.
8. Tipo de saída desejado: estudo, sermon, aula, devocional, análise técnica.
```

### Modos

```txt
- Explicar passagem
- Analisar palavra original
- Comparar versões
- Comparar tradições
- Criar estudo bíblico
- Criar sermão
- Criar aula
- Criar devocional
- Criar perguntas para grupo
- Gerar cadeia temática
- Verificar fontes
- Resumir comentários
```

### Prompt base de sistema

```txt
Você é o Assistente de Estudo Bíblico do Move Reino Bible.
Sua função é auxiliar o usuário com estudo bíblico, exegese, línguas originais e comparação teológica.
Você não deve inventar fontes, não deve afirmar que uma tradição é a única correta, e deve separar texto bíblico, análise lexical, contexto histórico, teologia, tradição interpretativa e aplicação.
Quando fontes RAG forem fornecidas, use-as e cite-as.
Quando os dados forem insuficientes, diga explicitamente que a resposta é limitada.
Preserve respeito às tradições cristãs e não caricature posições.
```

### Saída estruturada padrão

```txt
1. Síntese
2. Contexto da passagem
3. Observações do texto original
4. Pontos lexicais/Strong
5. Comparação de versões
6. Interpretação por tradição, se solicitado
7. Aplicação pastoral/devocional, se solicitado
8. Fontes consultadas
9. Limites da resposta
```

---

## 6.16 Module P — Theology RAG 2.0

### Objetivo

Permitir que o Move Bible compare como tradições cristãs interpretam passagens bíblicas com base em documentos, comentários, confissões e obras indexadas.

### Tipos de documentos

```txt
- Bíblia
- Comentário bíblico
- Teologia sistemática
- Catecismo
- Confissão
- Credo
- Obra patrística
- Sermão clássico
- Artigo acadêmico
- Livro devocional
- Documento denominacional
- Material próprio do usuário
```

### Metadados obrigatórios

```sql
CREATE TABLE rag_document (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  tradition TEXT,
  denomination TEXT,
  century INT,
  language TEXT,
  document_type TEXT,
  source_url TEXT,
  source_license_id UUID,
  reliability_level TEXT,
  is_primary_source BOOLEAN DEFAULT FALSE,
  is_user_uploaded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rag_chunk (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES rag_document(id),
  chunk_index INT NOT NULL,
  chunk_text TEXT NOT NULL,
  biblical_refs TEXT[],
  doctrine_tags TEXT[],
  tradition_tags TEXT[],
  embedding VECTOR,
  token_count INT,
  citation_label TEXT
);
```

### RAG retrieval pipeline

```txt
Pergunta
→ detectar passagem bíblica
→ detectar tradição solicitada
→ detectar doutrina
→ recuperar texto bíblico
→ recuperar tokens originais se relevante
→ recuperar léxico se relevante
→ recuperar chunks RAG
→ reranking
→ montar contexto
→ chamar LLM
→ validar citação
→ responder em estrutura
→ permitir salvar como StudyBlock
```

---

## 6.17 Module Q — Study Workspace 2.0

### Objetivo

Transformar estudo em produção de material.

### Blocos

```txt
- Texto bíblico
- Comparação de versões
- Palavra original
- Strong/léxico
- Nota pessoal
- Comentário
- Citação RAG
- Resposta IA
- Aplicação
- Pergunta
- Cadeia temática
- Esboço de sermão
- Aula
- Devocional
```

### Integrações

```txt
- Inserir versículo selecionado.
- Inserir comparação de versões.
- Inserir análise de palavra.
- Inserir resposta IA.
- Inserir fonte RAG.
- Exportar Markdown.
- Exportar PDF.
- Futuro: exportar DOCX/PPTX.
```

---

## 7. Identidade visual preservada e ampliada

## 7.1 Direção visual

O Move Bible 2.0 deve manter a aparência premium já definida pela logo:

```txt
- azul profundo como base institucional;
- dourado coroa como acento nobre;
- tipografia serifada para marca e leitura bíblica;
- tipografia sans moderna para UI;
- cartões escuros elegantes;
- linhas douradas finas;
- interface séria, reverente e tecnológica;
- evitar estética infantil, genérica ou excessivamente colorida.
```

## 7.2 Design tokens obrigatórios

```css
:root {
  --mr-blue-900: #003A66;
  --mr-blue-800: #004A80;
  --mr-blue-700: #075188;
  --mr-blue-600: #0B5D9A;
  --mr-blue-500: #126EAF;

  --mr-gold-900: #8A6125;
  --mr-gold-800: #A97832;
  --mr-gold-700: #C38E42;
  --mr-gold-600: #D1A058;
  --mr-gold-500: #E0B66E;

  --bg-dark-950: #05070C;
  --bg-dark-900: #080D16;
  --bg-dark-850: #0B1220;
  --bg-dark-800: #101827;
  --bg-dark-700: #172033;

  --bg-light-50: #FBF8F1;
  --bg-light-100: #F5EFE3;
  --bg-light-200: #ECE1D0;

  --text-main-dark: #F5F0E8;
  --text-secondary-dark: #C9D2DE;
  --text-muted-dark: #8D9AAD;

  --ai-purple: #7C5CFF;
  --rag-green: #3FA878;
  --source-cyan: #3AAED8;

  --font-brand: "Cinzel", "Cormorant Garamond", serif;
  --font-ui: "Inter", "Manrope", "Segoe UI", sans-serif;
  --font-bible: "Merriweather", "Crimson Pro", Georgia, serif;
  --font-greek: "SBL Greek", "Cardo", "Noto Serif", serif;
  --font-hebrew: "SBL Hebrew", "Ezra SIL", "Noto Serif Hebrew", serif;
}
```

## 7.3 Interface principal DEV 2.0

```txt
┌──────────────────────────────────────────────────────────────────┐
│ Top Command Bar: busca, passagem, versão, IA, perfil              │
├───────────────┬───────────────────────────────────┬──────────────┤
│ Sidebar       │ Workspace bíblico                 │ Context Rail  │
│ Bíblia        │ Leitura / Comparação / Interlinear│ Palavra       │
│ Busca         │ Busca / Estudos / RAG             │ Strong        │
│ Interlinear   │                                   │ IA            │
│ Strong        │                                   │ Fontes        │
│ Estudos       │                                   │ Notas         │
│ RAG           │                                   │               │
└───────────────┴───────────────────────────────────┴──────────────┘
```

### Regras visuais para manter premium

```txt
- Nunca usar muitas cores no texto bíblico padrão.
- Dourado deve indicar nobreza, seleção ou recurso especial.
- Roxo deve indicar IA.
- Verde deve indicar RAG/fonte validada.
- Azul deve estruturar navegação e ação principal.
- As funções técnicas devem parecer acessíveis, não assustadoras.
```

---

## 8. Especificação de telas DEV 2.0

## 8.1 Tela Dashboard

### Objetivo

Ser uma entrada elegante e produtiva.

### Cards

```txt
- Continuar estudo
- Abrir passagem
- Comparar versões
- Buscar palavra/Strong
- Criar estudo com IA
- Biblioteca RAG
- Fontes recentes
```

### Métricas de UI

```txt
- Time to first passage: < 5s após abrir app.
- Ação principal visível acima da dobra.
- Nenhum card deve depender de internet para renderizar.
```

---

## 8.2 Tela Reader

### Layout

```txt
Top: seletor de passagem + versão + ações
Centro: texto bíblico
Direita: painel contextual recolhível
Baixo: status de versão/licença/opções de leitura
```

### Ações de versículo

```txt
- Copiar
- Favoritar
- Criar nota
- Ver palavras originais
- Ver referências cruzadas
- Enviar para IA
- Adicionar ao estudo
- Comparar versões
```

---

## 8.3 Tela Parallel

### Layout

```txt
Coluna 1 — Versão A
Coluna 2 — Versão B
Coluna 3 — Original/Versão C
Coluna 4 — Comentário/Versão D
```

### Recursos premium

```txt
- modo foco em uma coluna;
- modo destacar divergências;
- modo IA: “explique diferenças relevantes”;
- modo exportar comparação para estudo.
```

---

## 8.4 Tela Search Lab

### Objetivo

Ser o centro de descoberta bíblica.

### Partes

```txt
- Busca rápida no topo.
- Filtros laterais.
- Abas de tipo de busca.
- Resultados com contexto.
- Facets por livro, testamento, versão, Strong, tema.
- Botão “transformar resultado em cadeia temática”.
```

### Resultados

```txt
[João 1:1] No princípio era o Verbo...
Versão: ACF | Strong: G3056 | Lema: logos | Ocorrência 1/40 em João
```

---

## 8.5 Tela Interlinear Studio

### Objetivo

Ser o equivalente premium e moderno do interlinear técnico.

### Painéis

```txt
- Texto interlinear principal.
- Configuração de camadas.
- Legenda gramatical.
- Painel de palavra selecionada.
- Ações IA.
```

---

## 8.6 Tela Lexicon Hub

### Objetivo

Uma central de palavra original.

### Seções

```txt
- Palavra/lema/Strong.
- Definição resumida.
- Léxicos disponíveis.
- Morfologia.
- Ocorrências.
- Gráfico por livro.
- Contextos bíblicos.
- RAG lexical.
- IA: análise da palavra no contexto escolhido.
```

---

## 8.7 Tela Theology RAG

### Objetivo

Gerenciar fontes teológicas e comparações por tradição.

### Seções

```txt
- Biblioteca de fontes.
- Upload/importação.
- Metadados.
- Licenças.
- Indexação.
- Busca em fontes.
- Comparar tradição.
- Qualidade das fontes.
```

---

## 9. Endpoints API DEV 2.0

### Bíblia

```http
GET /api/bibles/versions
GET /api/bibles/:versionId/books
GET /api/bibles/:versionId/passage?ref=Joao.3.16
GET /api/bibles/:versionId/verse/:canonicalVerseId
GET /api/bibles/compare?versions=ACF,KJV,SBLGNT&ref=Joao.1.1-18
```

### Originais

```http
GET /api/original/verse/:canonicalVerseId/tokens
GET /api/original/token/:tokenId
GET /api/original/strong/:strongNumber
GET /api/original/lemma/:lemma
GET /api/original/search?language=greek&lemma=logos
GET /api/original/morphology/:code
```

### Concordância

```http
GET /api/concordance/text?term=amor&version=ACF
GET /api/concordance/strong/:strongNumber
GET /api/concordance/lemma/:lemma
GET /api/concordance/morph?code=V-IAI-3S
```

### Busca

```http
POST /api/search/simple
POST /api/search/advanced
POST /api/search/mbql
POST /api/search/rag
GET /api/search/suggestions?q=logos
```

### RAG/IA

```http
POST /api/ai/ask
POST /api/ai/analyze-passage
POST /api/ai/analyze-word
POST /api/ai/compare-traditions
POST /api/rag/index-document
POST /api/rag/search
GET /api/rag/documents
GET /api/rag/documents/:id/chunks
```

### Estudos

```http
GET /api/studies
POST /api/studies
GET /api/studies/:id
PATCH /api/studies/:id
DELETE /api/studies/:id
POST /api/studies/:id/blocks
PATCH /api/study-blocks/:blockId
DELETE /api/study-blocks/:blockId
POST /api/studies/:id/export
```

---

## 10. Banco de dados consolidado DEV 2.0

### Núcleo bíblico

```sql
CREATE TABLE bible_version (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  language TEXT NOT NULL,
  copyright_status TEXT,
  license_id UUID,
  has_strongs BOOLEAN DEFAULT FALSE,
  has_morphology BOOLEAN DEFAULT FALSE,
  has_footnotes BOOLEAN DEFAULT FALSE,
  has_headings BOOLEAN DEFAULT FALSE,
  versification_profile TEXT DEFAULT 'english-standard',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bible_book (
  id UUID PRIMARY KEY,
  osis_code TEXT UNIQUE NOT NULL,
  name_pt TEXT NOT NULL,
  name_en TEXT,
  testament TEXT NOT NULL,
  canonical_order INT NOT NULL
);

CREATE TABLE bible_verse (
  id UUID PRIMARY KEY,
  version_id UUID REFERENCES bible_version(id),
  canonical_verse_id UUID,
  book_id UUID REFERENCES bible_book(id),
  chapter INT NOT NULL,
  verse TEXT NOT NULL,
  text TEXT NOT NULL,
  normalized_text TEXT,
  paragraph_id TEXT,
  heading TEXT,
  footnotes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Busca textual

```sql
CREATE INDEX idx_bible_verse_ref ON bible_verse(version_id, book_id, chapter, verse);
CREATE INDEX idx_bible_verse_text_pt ON bible_verse USING gin(to_tsvector('portuguese', normalized_text));
CREATE INDEX idx_bible_verse_text_simple ON bible_verse USING gin(to_tsvector('simple', normalized_text));
```

### Histórico e preferências

```sql
CREATE TABLE user_reader_state (
  id UUID PRIMARY KEY,
  user_id UUID,
  current_ref TEXT,
  current_version_id UUID,
  parallel_versions UUID[],
  reader_theme TEXT,
  font_size INT,
  line_height NUMERIC,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 11. Offline-first

### Estratégia

```txt
Desktop:
- SQLite local para versões autorizadas, índices e estudos do usuário.
- Cache local de léxico e Strong.
- Sincronização opcional com cloud.
- RAG local opcional para documentos pequenos.

Servidor/SaaS:
- PostgreSQL como fonte principal.
- Redis para filas/cache.
- Vector DB para embeddings.
- Meilisearch/Typesense ou Postgres FTS para busca textual.
```

### Regra

```txt
O usuário deve conseguir ler Bíblia, buscar em versões locais, usar Strong/léxico local e abrir estudos salvos mesmo offline.
```

---

## 12. Integração com IA preservada e ampliada

## 12.1 Providers

```txt
- OpenAI
- Anthropic
- Google Gemini
- Groq
- Mistral
- OpenRouter
- Ollama/local
```

## 12.2 API keys

```txt
- armazenar criptografadas;
- permitir chave por usuário;
- permitir chave global para SaaS admin;
- nunca logar chave;
- validar provedor antes de salvar;
- permitir remover chave;
- mostrar custo estimado quando possível.
```

## 12.3 Context builder

Antes de chamar a LLM, construir contexto estruturado:

```json
{
  "passage": {
    "reference": "João 1:1",
    "versions": ["ACF", "KJV", "SBLGNT"],
    "texts": []
  },
  "originalTokens": [],
  "lexiconEntries": [],
  "crossReferences": [],
  "ragSources": [],
  "userMode": "exegese",
  "traditions": ["reformada", "catolica", "metodista"],
  "outputFormat": "structured-study"
}
```

---

## 13. Segurança e governança

### Regras de segurança Electron

```txt
- contextIsolation: true
- nodeIntegration: false no renderer
- preload API restrita
- CSP rígido
- validação de IPC com Zod
- bloquear remote module
- sanitizar HTML de fontes externas
- criptografar API keys
```

### Regras de conteúdo

```txt
- Licença obrigatória por conteúdo.
- Atribuição obrigatória por dataset.
- Logs de importação.
- Bloqueio de conteúdo sem licença verificada.
- Separação entre conteúdo bíblico, comentário, IA e fonte externa.
```

---

## 14. Métricas DEV 2.0

## 14.1 Métricas funcionais

```txt
- Abrir passagem: < 500ms local, < 1500ms remoto.
- Busca textual simples: < 500ms para base local indexada.
- Busca Strong: < 300ms.
- Abrir painel de palavra: < 250ms após dados cacheados.
- Comparação de 4 versões: < 1000ms para capítulo médio.
- Interlinear de capítulo: render progressivo, sem travar UI.
```

## 14.2 Métricas de qualidade de dados

```txt
- 100% dos tokens originais importados devem ter source_dataset.
- 100% dos dados importados devem ter source_license_id.
- Erro máximo de parsing tolerado: 0% em datasets aprovados.
- Registros incertos devem ir para tabela de quarantine.
- Todo dataset deve ter checksum.
```

## 14.3 Métricas de IA

```txt
- Resposta RAG deve citar pelo menos uma fonte quando fonte for usada.
- Resposta comparativa deve separar tradições em blocos explícitos.
- A IA deve indicar limites quando não houver fonte suficiente.
- Nenhuma citação bibliográfica deve ser inventada.
- Todo StudyBlock gerado por IA deve ter flag ai_generated=true.
```

## 14.4 Métricas UX

```txt
- Usuário iniciante deve conseguir buscar uma palavra sem entender Strong.
- Usuário avançado deve conseguir digitar MBQL diretamente.
- A leitura bíblica deve permitir ajuste de fonte.
- A comparação de 4 versões deve manter cabeçalhos fixos.
- Painel IA não deve bloquear o texto bíblico.
```

---

## 15. Roadmap recomendado DEV 2.0

## Sprint 0 — Auditoria do DEV atual

```txt
- Ler DEV_SPEC existente.
- Criar branch dev-2-step-inspired.
- Mapear módulos já criados.
- Identificar lacunas para Bible Language Engine.
- Criar issues por módulo.
```

## Sprint 1 — Data & License Foundation

```txt
- Implementar source_license.
- Implementar import_log.
- Implementar data_quarantine.
- Criar CLI base.
- Criar política de atribuição.
- Criar seed mínimo.
```

## Sprint 2 — Bible Reader Core

```txt
- BibleVersion.
- BibleBook.
- BibleVerse.
- Passage parser.
- Reader premium.
- Version selector.
- Passage navigation.
```

## Sprint 3 — Parallel Bible

```txt
- CanonicalVerse.
- VerseMapping básico.
- 2 colunas.
- 4 colunas.
- Scroll sincronizado.
- Exportar comparação para estudo.
```

## Sprint 4 — STEPBible-Data Importer MVP

```txt
- Importar morphology codes.
- Importar lexicon sample.
- Importar TAGNT sample.
- Importar TAHOT sample.
- Gerar relatório de validação.
```

## Sprint 5 — Original Language Panel

```txt
- OriginalToken table.
- Tokens por versículo.
- Tooltip rápido.
- Drawer completo.
- Ocorrências por Strong/lema.
```

## Sprint 6 — Interlinear Studio

```txt
- Interlinear rendering.
- Camadas configuráveis.
- Morfologia curta.
- Strong.
- Transliteração.
- Color grammar MVP.
```

## Sprint 7 — Search Lab

```txt
- Busca textual.
- Busca Strong.
- Busca lema.
- Busca morfológica.
- MBQL parser MVP.
- Advanced Search Builder.
```

## Sprint 8 — Concordance Engine

```txt
- Concordância textual.
- Concordância Strong.
- Concordância lema.
- Ocorrências por livro.
- Gráfico discreto.
```

## Sprint 9 — AI Contextual

```txt
- LLM Gateway.
- Configuração API key.
- AI Context Builder.
- Analisar passagem.
- Analisar palavra original.
- Inserir resposta no estudo.
```

## Sprint 10 — RAG Theology MVP

```txt
- Upload documento.
- Chunking.
- Embeddings.
- Busca RAG.
- Citação.
- Comparar tradições MVP.
```

## Sprint 11 — Study Workspace

```txt
- StudySession.
- StudyBlock.
- Editor.
- Inserções contextuais.
- Export Markdown.
- Export PDF futuro.
```

## Sprint 12 — Polimento premium e beta

```txt
- Performance.
- Acessibilidade.
- Temas.
- Logs.
- Testes E2E.
- Instalador Electron.
- Build Docker SaaS.
```

---

## 16. Definition of Done geral

Uma funcionalidade só será considerada concluída se:

```txt
1. Possuir types TypeScript.
2. Possuir validação Zod ou equivalente.
3. Possuir teste unitário quando aplicável.
4. Possuir teste de integração para dados críticos.
5. Respeitar design tokens Move Reino.
6. Respeitar licenças de conteúdo.
7. Não travar o renderer do Electron.
8. Ter estado de loading, empty e error.
9. Ter comportamento offline quando aplicável.
10. Estar documentada em docs/.
```

---

## 17. Golden Tests obrigatórios

### Busca Strong

```txt
Query: strong:G3056
Esperado: retornar ocorrências de λόγος/logos no NT.
```

### Busca lema

```txt
Query: lemma:agape
Esperado: retornar ocorrências relacionadas ao lema configurado.
```

### Busca texto

```txt
Query: phrase:"o amor de Deus"
Esperado: retornar versículos com frase exata na versão selecionada.
```

### Interlinear

```txt
Passagem: João 1:1
Esperado: exibir texto original, transliteração, Strong e morfologia.
```

### Versificação

```txt
Comparar Salmo com versificação divergente
Esperado: exibir aviso de alinhamento, sem quebrar comparação.
```

### IA

```txt
Pergunta: Compare Romanos 9 na tradição reformada e metodista.
Esperado: resposta separada por tradição, com fontes quando RAG estiver ativo.
```

---

## 18. Prompt mestre para LLM programadora — DEV 2.0

```txt
Você é uma LLM programadora sênior trabalhando no projeto Move Reino Bible.
Sua tarefa é implementar a atualização DEV 2.0, inspirada funcionalmente no STEPBible, mas com código, UI e identidade próprios.

Restrições:
- Não copie código, UI, assets ou marca do STEPBible.
- Use apenas dados com licença verificada.
- Preserve identidade premium Move Reino: azul profundo, dourado, serif para Bíblia, sans moderna para UI.
- Mantenha arquitetura modular TypeScript.
- Sempre implemente testes e validação de dados.
- Nunca misture texto bíblico, comentário, IA e fonte RAG sem identificação visual.

Prioridade inicial:
1. Data/license foundation.
2. Bible reader.
3. Parallel Bible.
4. Original language engine.
5. Strong/lexicon/concordance.
6. Search Lab com MBQL.
7. AI contextual.
8. RAG theology.

Ao implementar qualquer módulo:
- apresente plano de arquivos;
- gere código em pequenos passos;
- explique dependências;
- escreva testes;
- evite quebrar módulos existentes;
- valide build ao final.
```

---

## 19. Prompt para pesquisa profunda de dados STEP

```txt
Você é um pesquisador técnico de dados bíblicos.
Analise o repositório STEPBible-Data e crie um plano de importação para o Move Reino Bible.

Para cada dataset, responda:
- nome;
- finalidade;
- campos principais;
- formato;
- licença;
- atribuição exigida;
- tabelas de destino;
- riscos de parsing;
- riscos jurídicos;
- prioridade de importação;
- exemplos de registros;
- validações necessárias.

Datasets prioritários:
- TAHOT
- TAGNT
- TBESH
- TBESG
- TFLSJ
- TIPNR
- TVTMS
- TEHMC
- TEGMC

Não invente campos. Se não conseguir confirmar algo, marque como “exige inspeção manual”.
```

---

## 20. Prompt para UI/UX inspirada, sem cópia

```txt
Você é um designer de produto sênior.
Crie telas para o Move Reino Bible inspiradas funcionalmente em ferramentas bíblicas técnicas como STEPBible, mas sem copiar seu visual.

Preserve:
- logo Move Reino Bible;
- azul profundo;
- dourado coroa;
- aparência premium;
- experiência moderna de app desktop;
- foco em estudo bíblico sério;
- integração IA/RAG.

Telas obrigatórias:
1. Dashboard.
2. Bible Reader.
3. Parallel Bible com 4 colunas.
4. Verse Vocabulary Popover.
5. Original Word Drawer.
6. Interlinear Studio.
7. Search Lab.
8. Advanced Search Builder.
9. Concordance View.
10. Theology RAG Library.
11. AI Study Assistant.
12. Study Workspace.

Para cada tela, entregue:
- objetivo;
- componentes;
- layout;
- estados;
- microinterações;
- acessibilidade;
- critérios de aceite.
```

---

## 21. Conclusão DEV 2.0

A atualização DEV 2.0 reposiciona o Move Reino Bible como uma aplicação de estudo bíblico tecnicamente profunda, com motor linguístico robusto inspirado nas melhores ideias públicas do STEPBible, mas com uma experiência visual e funcional própria.

A frase guia para desenvolvimento deve ser:

> Profundidade linguística do padrão STEPBible, experiência premium Move Reino e inteligência rastreável com IA/RAG.

A implementação deve começar pelo núcleo de dados, licenças, versificação e motor linguístico. A IA só será realmente poderosa quando estiver conectada ao texto bíblico, ao texto original, ao léxico, à concordância, aos comentários e às fontes RAG.

---

## 22. Checklist executivo

```txt
[ ] Criar branch dev-2-step-inspired
[ ] Criar packages/step-data-importer
[ ] Criar packages/original-language-engine
[ ] Criar packages/strong-engine
[ ] Criar packages/lexicon-engine
[ ] Criar packages/concordance-engine
[ ] Criar packages/versification-engine
[ ] Criar packages/move-query-language
[ ] Criar tabelas source_license e import_log
[ ] Criar parser MBQL MVP
[ ] Criar Verse Vocabulary Popover
[ ] Criar Original Word Drawer
[ ] Criar Interlinear Studio
[ ] Criar Search Lab
[ ] Criar Concordance View
[ ] Integrar AI Context Builder
[ ] Integrar RAG Theology
[ ] Criar testes dourados
[ ] Atualizar documentação
```
