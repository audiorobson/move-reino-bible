const API_BASE = "http://localhost:4000/api/v1";

type FetchApiOptions = RequestInit & { timeoutMs?: number };

async function fetchApi<T>(path: string, options?: FetchApiOptions): Promise<T> {
  const { timeoutMs = 30_000, ...fetchOptions } = options ?? {};
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...fetchOptions.headers },
      ...fetchOptions,
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      const msg =
        typeof (err as { error?: unknown }).error === "string"
          ? (err as { error: string }).error
          : (err as { message?: string }).message ?? res.statusText;
      throw new Error(msg);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Tempo esgotado. Verifique se a API está rodando (pnpm dev:api).");
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("ERR_CONNECTION") || msg.includes("NetworkError")) {
      throw new Error("API indisponível. Execute pnpm dev:api no terminal.");
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

export const api = {
  health: () => fetch("http://localhost:4000/health").then((r) => r.json()),

  getVersions: () =>
    fetchApi<Array<{ id: string; abbreviation: string; name: string; language?: string }>>("/bible/versions"),
  getBooks: () =>
    fetchApi<
      Array<{
        id: string;
        osisId: string;
        namePt: string;
        nameEn: string;
        testament: "OT" | "NT";
        canonOrder: number;
        chapterCount: number;
      }>
    >("/bible/books"),
  getChapter: (bookOsisId: string, chapter: number, version?: string) =>
    fetchApi<{
      bookName: string;
      chapter: number;
      verses: Array<{ id: string; verse: number; text: string }>;
    }>(`/bible/chapter/${bookOsisId}/${chapter}?version=${version ?? "BLIVRE"}`),

  search: (query: string, mode = "phrase", version?: string) =>
    fetchApi<{ results: Array<{ verse: { text: string; chapter: number; verse: number; bookId: string }; bookName: string; highlight?: string }> }>(
      `/search/verses?query=${encodeURIComponent(query)}&mode=${mode}${version ? `&version=${version}` : ""}`
    ),

  getParallel: (book: string, chapter: number, versions: string[]) =>
    fetchApi<{
      book: string;
      chapter: number;
      columns: Array<{
        version: { abbreviation: string; name: string };
        verses: Array<{ verse: number; text: string }>;
      }>;
    }>(`/bible/parallel?book=${book}&chapter=${chapter}&versions=${versions.join(",")}`),

  aiChat: (
    message: string,
    mode = "simple",
    passage?: string,
    options?: {
      provider?: string;
      apiKey?: string;
      model?: string;
      useRag?: boolean;
      localFirst?: boolean;
      allowOnline?: boolean;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    }
  ) =>
    fetchApi<{ text: string; model: string; citations?: Array<{ title: string; author?: string; excerpt: string }> }>(
      "/ai/chat",
      {
        method: "POST",
        timeoutMs: 120_000,
        body: JSON.stringify({
          message,
          mode,
          passage,
          history: options?.history,
          provider: options?.provider ?? "openai",
          apiKey: options?.apiKey,
          model: options?.model,
          useRag: options?.useRag ?? true,
          localFirst: options?.localFirst ?? true,
          allowOnline: options?.allowOnline ?? true,
        }),
      }
    ),

  getStudies: (userId: string) =>
    fetchApi<StudySessionRecord[]>(`/studies?userId=${userId}`),
  getStudy: (id: string) => fetchApi<StudySessionRecord>(`/studies/${id}`),
  createStudy: (data: {
    userId: string;
    title: string;
    description?: string;
    passageRange?: string;
    tags?: string[];
  }) => fetchApi<StudySessionRecord>("/studies", { method: "POST", body: JSON.stringify(data) }),
  updateStudy: (id: string, data: Partial<{ title: string; description: string; passageRange: string; tags: string[] }>) =>
    fetchApi<StudySessionRecord>(`/studies/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteStudy: (id: string) =>
    fetchApi<{ ok: boolean }>(`/studies/${id}`, { method: "DELETE" }),
  addStudyBlock: (studyId: string, block: StudyBlockInput) =>
    fetchApi<StudyBlockRecord>(`/studies/${studyId}/blocks`, { method: "POST", body: JSON.stringify(block) }),
  updateStudyBlock: (studyId: string, blockId: string, block: Partial<StudyBlockInput>) =>
    fetchApi<StudyBlockRecord>(`/studies/${studyId}/blocks/${blockId}`, {
      method: "PATCH",
      body: JSON.stringify(block),
    }),
  deleteStudyBlock: (studyId: string, blockId: string) =>
    fetchApi<{ ok: boolean }>(`/studies/${studyId}/blocks/${blockId}`, { method: "DELETE" }),

  getStrong: (number: string) =>
    fetchApi<StrongDetailResult>(`/search/strong/${encodeURIComponent(number)}`),
  searchStrongs: (q: string, options?: { mode?: StrongSearchMode; language?: string; limit?: number }) => {
    const params = new URLSearchParams({ q });
    if (options?.mode) params.set("mode", options.mode);
    if (options?.language) params.set("language", options.language);
    if (options?.limit) params.set("limit", String(options.limit));
    return fetchApi<StrongSearchResponse>(`/search/strongs?${params}`);
  },
  getStrongStats: () => fetchApi<StrongStatsResult>("/search/strongs/stats"),
  getLexicon: (number: string) =>
    fetchApi<LexiconEntryRecord>(`/search/lexicon/${encodeURIComponent(number)}`),

  getVerseTokens: (book: string, chapter: number, verse: number) =>
    fetchApi<VerseTokensResponse>(
      `/original/verse/${encodeURIComponent(book)}/${chapter}/${verse}/tokens`
    ),
  getChapterOriginalAvailability: (book: string, chapter: number) =>
    fetchApi<ChapterOriginalAvailability>(
      `/original/chapter/${encodeURIComponent(book)}/${chapter}/availability`
    ),
  getChapterOriginalTokens: (book: string, chapter: number) =>
    fetchApi<ChapterOriginalTokensResponse>(
      `/original/chapter/${encodeURIComponent(book)}/${chapter}/tokens`
    ),
  getOriginalStatus: () =>
    fetchApi<{ totalTokens: number; books: number; datasets: string[] }>("/original/status"),

  getChapterVersification: (
    book: string,
    chapter: number,
    from = "english",
    to = "hebrew"
  ) =>
    fetchApi<ChapterVersificationResponse>(
      `/versification/chapter/${encodeURIComponent(book)}/${chapter}?from=${from}&to=${to}`
    ),
  getVersificationStatus: () =>
    fetchApi<{ total: number; indexed: boolean }>("/versification/status"),

  getNotes: (userId: string) => fetchApi<BibleNoteRecord[]>(`/studies/notes?userId=${userId}`),
  saveBibleNote: (data: {
    userId: string;
    bookId: string;
    chapter: number;
    verse: number;
    content: string;
  }) => fetchApi<BibleNoteRecord>("/studies/notes", { method: "POST", body: JSON.stringify(data) }),
  getBibleFavorites: (userId: string) =>
    fetchApi<BibleFavoriteRecord[]>(`/studies/favorites?userId=${userId}`),
  addBibleFavorite: (data: { userId: string; bookId: string; chapter: number; verse: number }) =>
    fetchApi<BibleFavoriteRecord>("/studies/favorites", { method: "POST", body: JSON.stringify(data) }),
  removeBibleFavorite: (userId: string, bookId: string, chapter: number, verse: number) =>
    fetchApi<{ ok: boolean }>(
      `/studies/favorites?userId=${encodeURIComponent(userId)}&bookId=${encodeURIComponent(bookId)}&chapter=${chapter}&verse=${verse}`,
      { method: "DELETE" }
    ),
  getRagDocuments: () =>
    fetchApi<Array<{ id: string; title: string; author?: string; tradition?: string; _count?: { chunks: number } }>>(
      "/rag/documents"
    ),
  getRagStatus: () =>
    fetchApi<{ documents: number; chunks: number; embeddedChunks: number; vectorSearchReady: boolean }>(
      "/rag/status"
    ),
  searchRag: (query: string, options?: { tradition?: string; limit?: number; passage?: string }) =>
    fetchApi<RagSearchResponse>("/rag/search", {
      method: "POST",
      body: JSON.stringify({
        query: options?.passage ? `${options.passage} ${query}` : query,
        tradition: options?.tradition,
        limit: options?.limit ?? 8,
      }),
    }),
  getTraditions: () => fetchApi<Array<{ id: string; labelPt: string; accentColor: string }>>("/theology/traditions"),

  getLibraryBooks: () => fetchApi<LibraryBookSummary[]>("/library/books"),
  getLibraryBook: (id: string) => fetchApi<LibraryBookDetail>(`/library/books/${id}`),
  getLibraryToc: (id: string) => fetchApi<LibraryToc>(`/library/books/${id}/toc`),
  getLibraryChapter: (id: string, chapterId: string) =>
    fetchApi<LibraryChapterContent>(`/library/books/${id}/chapters/${chapterId}`),

  getLibraryNotes: (userId: string) =>
    fetchApi<LibraryNoteRecord[]>(`/library/notes?userId=${userId}`),
  saveLibraryNote: (data: {
    userId: string;
    libraryBookId: string;
    chapterId: string;
    content: string;
    excerpt?: string;
  }) =>
    fetchApi<LibraryNoteRecord>("/library/notes", { method: "POST", body: JSON.stringify(data) }),
  deleteLibraryNote: (id: string) =>
    fetchApi<{ ok: boolean }>(`/library/notes/${id}`, { method: "DELETE" }),

  getLibraryFavorites: (userId: string) =>
    fetchApi<LibraryFavoriteRecord[]>(`/library/favorites?userId=${userId}`),
  addLibraryFavorite: (data: {
    userId: string;
    libraryBookId: string;
    chapterId: string;
    chapterTitle?: string;
  }) =>
    fetchApi<LibraryFavoriteRecord>("/library/favorites", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeLibraryFavorite: (userId: string, libraryBookId: string, chapterId: string) =>
    fetchApi<{ ok: boolean }>(
      `/library/favorites?userId=${encodeURIComponent(userId)}&libraryBookId=${encodeURIComponent(libraryBookId)}&chapterId=${encodeURIComponent(chapterId)}`,
      { method: "DELETE" }
    ),

  getChainStats: () => fetchApi<ChainStatsResult>("/chains/stats"),
  searchChainTopics: (q: string, source?: string) => {
    const params = new URLSearchParams({ q });
    if (source) params.set("source", source);
    return fetchApi<ChainSearchResult>(`/chains/topics/search?${params}`);
  },
  getChainTopic: (id: string) => fetchApi<ChainTopicDetail>("/chains/topics/" + id),
  getChain: (id: string) => fetchApi<ChainDetailResult>("/chains/chains/" + id),
  createUserChain: (payload: CreateUserChainPayload) =>
    fetchApi<ChainDetailResult>("/chains/user-chains", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  exportChain: (id: string, format: "markdown" | "json" = "markdown") =>
    fetchApi<{ format: string; content: string }>(`/chains/chains/${id}/export?format=${format}`),
  getChainSources: () =>
    fetchApi<Array<{ sourceKey: string; title: string; license: string | null }>>("/chains/sources"),

  getSpotifyTopTracks: (artistId?: string, market = "BR") => {
    const params = new URLSearchParams({ market });
    if (artistId) params.set("artistId", artistId);
    return fetchApi<SpotifyTopTracksResponse>(`/spotify/top-tracks?${params}`);
  },
};

export interface StudyBlockInput {
  type: string;
  content: Record<string, unknown>;
  linkedVerses?: unknown[];
  linkedSources?: unknown[];
  order?: number;
}

export interface StudyBlockRecord {
  id: string;
  type: string;
  content: Record<string, unknown>;
  linkedVerses?: unknown;
  linkedSources?: unknown;
  order: number;
  aiGenerated: boolean;
}

export interface StudySessionRecord {
  id: string;
  title: string;
  description?: string | null;
  passageRange?: string | null;
  tags: string[];
  blocks: StudyBlockRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface LexiconEntryRecord {
  id: string;
  language: string;
  strongNumber: string | null;
  lemma: string;
  transliteration: string | null;
  shortDefinition: string;
  extendedDefinition: string | null;
  semanticDomain: string | null;
}

export type StrongSearchMode = "number" | "lemma" | "transliteration" | "definition" | "all";

export interface StrongSearchHit {
  id: string;
  strongNumber: string;
  language: string;
  lemma: string;
  transliteration: string | null;
  shortDefinition: string;
  extendedDefinition: string | null;
  semanticDomain: string | null;
  score: number;
}

export interface StrongSearchResponse {
  query: string;
  mode: StrongSearchMode;
  count: number;
  results: StrongSearchHit[];
}

export interface StrongStatsResult {
  total: number;
  greek: number;
  hebrew: number;
  aramaic: number;
  indexed: boolean;
}

export interface StrongDetailResult {
  strongNumber: string;
  lexicon: StrongSearchHit | null;
  related: StrongSearchHit[];
  occurrences: number;
  tokens: Array<{
    id: string;
    bookId: string;
    chapter: number;
    verse: number;
    surfaceForm: string;
    lemma: string | null;
    glossPt: string | null;
    glossEn: string | null;
  }>;
}

export interface StrongLookupResult {
  strongNumber: string;
  lexicon: LexiconEntryRecord | null;
  occurrences: number;
  tokens: unknown[];
}

export interface VerseTokensResponse {
  book: string;
  chapter: number;
  verse: number;
  tokenCount: number;
  tokens: Array<{
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
  }>;
  source: string | null;
  attribution?: string;
}

export interface ChapterOriginalAvailability {
  book: string;
  chapter: number;
  verses: number[];
  totalTokens: number;
  language?: "greek" | "hebrew" | null;
  sourceDataset?: string | null;
}

export interface ChapterOriginalTokensResponse {
  book: string;
  chapter: number;
  verses: Record<string, VerseTokensResponse["tokens"]>;
  source: string | null;
  attribution?: string;
}

export interface ChapterVersificationResponse {
  book: string;
  chapter: number;
  hasDifferences: boolean;
  mappings: Array<{
    sourceVerse: number;
    targetVerse: number;
    sourceRef: string;
    targetRef: string;
  }>;
}

export interface ChainTopicSummary {
  id: string;
  title: string;
  normalizedTitle: string;
  parentId: string | null;
  description: string | null;
  sourceKey: string;
  externalId: string | null;
  verseCount: number;
  childCount: number;
}

export interface ChainNodeResult {
  id: string;
  chainId: string;
  osisRef: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  orderIndex: number;
  note: string | null;
  text?: string;
  bookNamePt?: string;
  reference?: string;
}

export interface ChainDetailResult {
  id: string;
  title: string;
  description: string | null;
  sourceKey: string;
  nodes: ChainNodeResult[];
}

export interface ChainTopicDetail extends ChainTopicSummary {
  children: ChainTopicSummary[];
  verses: Array<{
    id: string;
    osisRef: string;
    book: string;
    chapter: number;
    verseStart: number;
    verseEnd: number | null;
    chainOrder: number;
    text?: string;
    bookNamePt?: string;
  }>;
  chain: ChainDetailResult | null;
  aliases: Array<{ id: string; alias: string }>;
  relatedTopics: ChainTopicSummary[];
}

export interface ChainSearchResult {
  query: string;
  count: number;
  topics: ChainTopicSummary[];
}

export interface ChainStatsResult {
  indexed: boolean;
  totalTopics: number;
  totalVerses: number;
  totalChains: number;
  sources: Array<{
    sourceKey: string;
    title: string;
    topicCount: number;
    verseCount: number;
    chainCount: number;
  }>;
}

export interface CreateUserChainPayload {
  userId: string;
  title: string;
  description?: string;
  verses: Array<{
    bookOsisId: string;
    chapter: number;
    verse: number;
    text?: string;
    reference?: string;
  }>;
}

export interface SpotifyTrackDto {
  id: string;
  name: string;
  uri: string;
  previewUrl: string | null;
  albumImage: string | null;
  durationMs: number;
}

export interface SpotifyTopTracksResponse {
  configured: boolean;
  fallback: boolean;
  count?: number;
  tracks: SpotifyTrackDto[];
  message?: string;
  error?: string;
}

export interface LibraryBookSummary {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  tradition?: string;
  language: string;
  documentType: string;
  description?: string;
}

export interface LibraryBookDetail extends LibraryBookSummary {
  enabled: boolean;
  license: string;
  format: string;
  sourceFile: string;
  chapterCount: number;
  volumes: LibraryVolume[];
  ready: boolean;
}

export interface LibraryVolume {
  roman: string;
  label: string;
  chapterIds: string[];
}

export interface LibraryChapterMeta {
  id: string;
  bookRoman: string;
  bookLabel: string;
  chapterNumber: number;
  title: string;
  wordCount: number;
}

export interface LibraryToc {
  bookId: string;
  title: string;
  author: string;
  chapterCount: number;
  volumes: LibraryVolume[];
  chapters: LibraryChapterMeta[];
}

export interface LibraryChapterContent {
  bookId: string;
  chapterId: string;
  title: string;
  bookLabel?: string;
  chapterNumber?: number;
  content: string;
}

export interface RagSearchResult {
  chunkId: string;
  documentId: string;
  title: string;
  author?: string;
  tradition?: string;
  excerpt: string;
  citation?: string;
  score: number;
}

export interface RagSearchResponse {
  query: string;
  count: number;
  results: RagSearchResult[];
  citations: Array<{ title: string; author?: string; excerpt: string; confidence: number }>;
}

export interface BibleNoteRecord {
  id: string;
  userId: string;
  bookId: string;
  chapter: number;
  verse: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BibleFavoriteRecord {
  id: string;
  userId: string;
  bookId: string;
  chapter: number;
  verse: number;
  createdAt: string;
}

export interface LibraryNoteRecord {
  id: string;
  userId: string;
  libraryBookId: string;
  chapterId: string;
  content: string;
  excerpt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryFavoriteRecord {
  id: string;
  userId: string;
  libraryBookId: string;
  chapterId: string;
  chapterTitle?: string | null;
  createdAt: string;
}
