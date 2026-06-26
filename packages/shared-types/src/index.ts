// ─── Bíblia ───────────────────────────────────────────────────────────────────

export interface BibleBookDto {
  id: string;
  osisId: string;
  namePt: string;
  nameEn: string;
  testament: "OT" | "NT";
  canonOrder: number;
  chapterCount?: number;
}

export interface BibleVerseDto {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  versionId: string;
  versionAbbreviation?: string;
}

export interface BibleChapterDto {
  bookId: string;
  bookOsisId: string;
  bookName: string;
  chapter: number;
  verses: BibleVerseDto[];
}

export interface BibleReference {
  bookOsisId: string;
  bookName?: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

// ─── Busca ────────────────────────────────────────────────────────────────────

export type SearchMode =
  | "exact"
  | "phrase"
  | "all_words"
  | "any_word"
  | "reference"
  | "strong"
  | "lemma"
  | "semantic"
  | "hybrid";

export interface SearchFilters {
  testament?: "OT" | "NT";
  bookOsisId?: string;
  versionId?: string;
  strongNumber?: string;
  tradition?: string;
}

export interface SearchResult {
  verse: BibleVerseDto;
  bookName: string;
  score: number;
  highlight?: string;
}

// ─── Original Languages ───────────────────────────────────────────────────────

export interface OriginalTokenDto {
  id: string;
  surfaceForm: string;
  lemma?: string;
  strongNumber?: string;
  morphologyCode?: string;
  morphologyExpanded?: string;
  transliteration?: string;
  glossPt?: string;
  glossEn?: string;
  tokenOrder: number;
  testament?: "OT" | "NT";
  sourceDataset?: string;
}

export interface LexiconEntryDto {
  id: string;
  language: string;
  strongNumber?: string;
  lemma: string;
  transliteration?: string;
  shortDefinition: string;
  extendedDefinition?: string;
}

// ─── Estudos ──────────────────────────────────────────────────────────────────

export type StudyBlockType =
  | "bible_text"
  | "observation"
  | "interpretation"
  | "application"
  | "original_word"
  | "theological_citation"
  | "ai_comment"
  | "question"
  | "comparison_table"
  | "thematic_chain";

export interface StudyBlockDto {
  id: string;
  type: StudyBlockType;
  content: Record<string, unknown>;
  linkedVerses?: BibleReference[];
  aiGenerated: boolean;
  order: number;
}

export interface StudySessionDto {
  id: string;
  title: string;
  description?: string;
  passageRange?: string;
  tags: string[];
  blocks: StudyBlockDto[];
}

// ─── RAG ──────────────────────────────────────────────────────────────────────

export interface RagDocumentDto {
  id: string;
  title: string;
  author?: string;
  tradition?: string;
  denomination?: string;
  language: string;
  license: string;
  documentType: string;
  reliabilityLevel: string;
}

export interface SourceCitation {
  documentId: string;
  title: string;
  author?: string;
  tradition?: string;
  excerpt: string;
  confidence: number;
  citation?: string;
}

// ─── IA ───────────────────────────────────────────────────────────────────────

export type AiResponseMode =
  | "simple"
  | "pastoral"
  | "academic"
  | "exegetical"
  | "devotional"
  | "theology_comparison"
  | "sermon_prep"
  | "bible_class"
  | "rag_strict";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmChatInput {
  model: string;
  messages: LlmMessage[];
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface LlmChatOutput {
  text: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  citations?: SourceCitation[];
}

export interface LlmModel {
  id: string;
  name: string;
  provider: string;
  contextWindow?: number;
}

export interface LlmProviderConfig {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}

// ─── Licenciamento ────────────────────────────────────────────────────────────

export type LicenseStatus =
  | "LICENSE_OK_PUBLIC_DOMAIN"
  | "LICENSE_OK_CC_BY"
  | "LICENSE_OK_CC_BY_SA"
  | "LICENSE_OK_COMMERCIAL_CONTRACT"
  | "LICENSE_RESTRICTED_PERSONAL_USE"
  | "LICENSE_UNKNOWN"
  | "LICENSE_REJECTED";

// ─── Teologia ─────────────────────────────────────────────────────────────────

export type TheologyTradition =
  | "reformed"
  | "catholic"
  | "methodist"
  | "pentecostal"
  | "baptist"
  | "patristic"
  | "lutheran"
  | "orthodox"
  | "arminian"
  | "other";

export interface TheologyComparisonEntry {
  tradition: TheologyTradition;
  thesis: string;
  sources: string[];
  arguments: string[];
  strengths: string[];
  debatablePoints: string[];
}

// ─── UI / App ─────────────────────────────────────────────────────────────────

export type AppModule =
  | "dashboard"
  | "bible"
  | "parallel"
  | "search"
  | "originals"
  | "strong"
  | "studies"
  | "chains"
  | "theology-rag"
  | "ai"
  | "library"
  | "settings";

export type ThemeId = "reino-dark" | "scroll-light" | "deep-night";

export interface UserPreferences {
  theme: ThemeId;
  bibleFontSize: number;
  bibleLineHeight: number;
  defaultVersionId?: string;
  focusMode: boolean;
  sidebarCollapsed: boolean;
  llmProvider: string;
  sidebarWidth: number;
  toolPanelWidth: number;
  showBookSelectorBar: boolean;
}

export {
  deriveGlossPtFromEn,
  isStoredGlossPtValid,
  primaryLexiconGloss,
  resolveTokenGlossPt,
} from "./gloss-pt.js";
