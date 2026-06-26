import { create } from "zustand";
import type { AppModule, ThemeId, UserPreferences, OriginalTokenDto } from "@mrb/shared-types";
import type { VerseContext } from "../lib/verse-context";
import type { StudySessionRecord } from "../lib/api";
import { detectWordSearchKind, normalizeStrongQuery } from "../lib/word-search";
import {
  electronCloseStudy,
  electronOpenStudy,
  electronSendVerseToStudy,
  electronToggleStudy,
  isElectronStudyWindow,
  isStudyWindowRoute,
} from "../lib/study-electron";

export interface StudyFloatingLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
}

const DEFAULT_STUDY_FLOAT: StudyFloatingLayout = {
  x: -1,
  y: -1,
  width: 440,
  height: 580,
  minimized: false,
};

interface AppState {
  activeModule: AppModule;
  setActiveModule: (module: AppModule) => void;
  toolPanelOpen: boolean;
  setToolPanelOpen: (open: boolean) => void;
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  currentBook: string;
  currentChapter: number;
  currentVersion: string;
  compareMode: boolean;
  parallelColumnCount: 2 | 3 | 4;
  parallelVersions: string[];
  selectedVerse: number | null;
  selectedVerseContext: VerseContext | null;
  studyVerses: VerseContext[];
  studyVerseInbox: VerseContext[];
  studyModeOpen: boolean;
  activeStudyId: string | null;
  studyDraftDirty: boolean;
  studyFloating: StudyFloatingLayout;
  studyPreviewOpen: boolean;
  studyPreviewStudy: StudySessionRecord | null;
  studyPreviewFloating: StudyFloatingLayout;
  chainVerses: VerseContext[];
  aiAttachedVerse: VerseContext | null;
  strongVerseRef: string | null;
  selectedStrongNumber: string | null;
  openStrongLookup: (number: string) => void;
  ragVerseQuery: string | null;
  selectedOriginalToken: OriginalTokenDto | null;
  showInterlinearLayer: boolean;
  showInterlinearEn: boolean;
  showInterlinearPt: boolean;
  showGreekParallelColumn: boolean;
  originalVocabVerse: number | null;
  setLocation: (book: string, chapter: number) => void;
  setVersion: (version: string) => void;
  setCompareMode: (enabled: boolean) => void;
  setParallelVersion: (index: number, version: string) => void;
  setParallelColumnCount: (count: 2 | 3 | 4) => void;
  selectVerse: (ctx: VerseContext) => void;
  clearVerseSelection: () => void;
  dispatchVerseToModule: (module: AppModule, ctx: VerseContext) => void;
  removeStudyVerse: (index: number) => void;
  clearStudyVerses: () => void;
  removeChainVerse: (index: number) => void;
  clearChainVerses: () => void;
  clearAiAttachedVerse: () => void;
  setSelectedOriginalToken: (token: OriginalTokenDto | null) => void;
  setShowInterlinearLayer: (show: boolean) => void;
  toggleInterlinearLayer: () => void;
  setShowInterlinearEn: (show: boolean) => void;
  toggleInterlinearEn: () => void;
  setShowInterlinearPt: (show: boolean) => void;
  toggleInterlinearPt: () => void;
  setShowGreekParallelColumn: (show: boolean) => void;
  toggleGreekParallelColumn: () => void;
  setOriginalVocabVerse: (verse: number | null) => void;
  openStudyMode: () => void;
  closeStudyMode: () => void;
  setStudyModeOpen: (open: boolean) => void;
  toggleStudyMode: () => void;
  setActiveStudyId: (id: string | null) => void;
  setStudyDraftDirty: (dirty: boolean) => void;
  setStudyFloating: (layout: Partial<StudyFloatingLayout>) => void;
  setStudyPreviewOpen: (open: boolean) => void;
  openStudyPreview: (study: StudySessionRecord) => void;
  closeStudyPreview: () => void;
  setStudyPreviewFloating: (layout: Partial<StudyFloatingLayout>) => void;
  sendVerseToStudy: (ctx: VerseContext) => void;
  consumeStudyVerseInbox: () => VerseContext[];
  referenceInput: string;
  setReferenceInput: (ref: string) => void;
  wordSearchQuery: string;
  wordSearchSubmitted: string;
  setWordSearchQuery: (query: string) => void;
  submitWordSearch: (query?: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeModule: "bible",
  setActiveModule: (module) => {
    const updates: Partial<AppState> = {
      activeModule: module,
      toolPanelOpen: true,
      ...(module === "parallel" ? { compareMode: true } : {}),
    };
    if (module === "studies" && isElectronStudyWindow() && !isStudyWindowRoute()) {
      void electronOpenStudy();
    }
    set(updates);
  },
  toolPanelOpen: true,
  setToolPanelOpen: (open) => set({ toolPanelOpen: open }),
  preferences: {
    theme: "reino-dark",
    bibleFontSize: 18,
    bibleLineHeight: 1.85,
    defaultVersionId: "BLIVRE",
    focusMode: false,
    sidebarCollapsed: false,
    llmProvider: "openai",
    sidebarWidth: 280,
    toolPanelWidth: 420,
    showBookSelectorBar: true,
  },
  setPreferences: (prefs) =>
    set((s) => ({ preferences: { ...s.preferences, ...prefs } })),
  currentBook: "John",
  currentChapter: 1,
  currentVersion: "BLIVRE",
  compareMode: false,
  parallelColumnCount: 2,
  parallelVersions: ["NVI", "ARA", "ACF", "NTLH"],
  selectedVerse: null,
  selectedVerseContext: null,
  studyVerses: [],
  studyVerseInbox: [],
  studyModeOpen: false,
  activeStudyId: null,
  studyDraftDirty: false,
  studyFloating: { ...DEFAULT_STUDY_FLOAT },
  studyPreviewOpen: false,
  studyPreviewStudy: null,
  studyPreviewFloating: { x: -1, y: -1, width: 620, height: 720, minimized: false },
  chainVerses: [],
  aiAttachedVerse: null,
  strongVerseRef: null,
  selectedStrongNumber: null,
  openStrongLookup: (number) => {
    const normalized = number.trim().toUpperCase();
    if (!normalized) return;
    set({
      activeModule: "strong",
      toolPanelOpen: true,
      selectedStrongNumber: normalized,
    });
  },
  ragVerseQuery: null,
  selectedOriginalToken: null,
  showInterlinearLayer: false,
  showInterlinearEn: true,
  showInterlinearPt: true,
  showGreekParallelColumn: true,
  originalVocabVerse: null,
  setLocation: (book, chapter) =>
    set({
      currentBook: book,
      currentChapter: chapter,
      selectedVerse: null,
      selectedVerseContext: null,
    }),
  setVersion: (version) =>
    set((s) => {
      const next = [...s.parallelVersions];
      next[0] = version;
      return { currentVersion: version, parallelVersions: next };
    }),
  setCompareMode: (enabled) => set({ compareMode: enabled }),
  setParallelVersion: (index, version) =>
    set((s) => {
      const next = [...s.parallelVersions];
      next[index] = version;
      return { parallelVersions: next };
    }),
  setParallelColumnCount: (count) => set({ parallelColumnCount: count }),
  selectVerse: (ctx) =>
    set({
      selectedVerseContext: ctx,
      selectedVerse: ctx.verse,
      referenceInput: ctx.reference,
      toolPanelOpen: true,
    }),
  clearVerseSelection: () =>
    set({ selectedVerseContext: null, selectedVerse: null }),
  dispatchVerseToModule: (module, ctx) => {
    const base = {
      activeModule: module,
      toolPanelOpen: true,
      selectedVerseContext: ctx,
      selectedVerse: ctx.verse,
      referenceInput: ctx.reference,
    };

    switch (module) {
      case "ai":
        set({ ...base, aiAttachedVerse: ctx });
        break;
      case "studies":
        get().sendVerseToStudy(ctx);
        set(base);
        break;
      case "chains":
        set((s) => ({
          ...base,
          chainVerses: s.chainVerses.some((v) => v.reference === ctx.reference)
            ? s.chainVerses
            : [...s.chainVerses, ctx],
        }));
        break;
      case "strong":
        set({ ...base, strongVerseRef: ctx.reference });
        break;
      case "theology-rag":
        set({
          ...base,
          ragVerseQuery: `Explique o contexto teológico de ${ctx.reference}: "${ctx.text}"`,
        });
        break;
      default:
        set(base);
    }
  },
  removeStudyVerse: (index) =>
    set((s) => ({
      studyVerses: s.studyVerses.filter((_, i) => i !== index),
    })),
  clearStudyVerses: () => set({ studyVerses: [] }),
  removeChainVerse: (index) =>
    set((s) => ({
      chainVerses: s.chainVerses.filter((_, i) => i !== index),
    })),
  clearChainVerses: () => set({ chainVerses: [] }),
  clearAiAttachedVerse: () => set({ aiAttachedVerse: null }),
  setSelectedOriginalToken: (token) =>
    set({
      selectedOriginalToken: token,
      ...(token?.strongNumber
        ? { selectedStrongNumber: token.strongNumber.toUpperCase() }
        : {}),
    }),
  setShowInterlinearLayer: (show) => set({ showInterlinearLayer: show }),
  toggleInterlinearLayer: () => set((s) => ({ showInterlinearLayer: !s.showInterlinearLayer })),
  setShowInterlinearEn: (show) => set({ showInterlinearEn: show }),
  toggleInterlinearEn: () => set((s) => ({ showInterlinearEn: !s.showInterlinearEn })),
  setShowInterlinearPt: (show) => set({ showInterlinearPt: show }),
  toggleInterlinearPt: () => set((s) => ({ showInterlinearPt: !s.showInterlinearPt })),
  setShowGreekParallelColumn: (show) => set({ showGreekParallelColumn: show }),
  toggleGreekParallelColumn: () =>
    set((s) => ({ showGreekParallelColumn: !s.showGreekParallelColumn })),
  setOriginalVocabVerse: (verse) => set({ originalVocabVerse: verse }),
  openStudyMode: () => {
    if (isElectronStudyWindow() && !isStudyWindowRoute()) {
      void electronOpenStudy();
      return;
    }
    set({ studyModeOpen: true, studyFloating: { ...DEFAULT_STUDY_FLOAT, minimized: false } });
  },
  closeStudyMode: () => {
    if (isElectronStudyWindow() && !isStudyWindowRoute()) {
      void electronCloseStudy();
      return;
    }
    set({ studyModeOpen: false });
  },
  setStudyModeOpen: (open) =>
    set({
      studyModeOpen: open,
      ...(open ? { studyFloating: { ...DEFAULT_STUDY_FLOAT, minimized: false } } : {}),
    }),
  toggleStudyMode: () => {
    if (isElectronStudyWindow() && !isStudyWindowRoute()) {
      void electronToggleStudy();
      return;
    }
    set((s) => ({
      studyModeOpen: !s.studyModeOpen,
      studyFloating: s.studyModeOpen ? s.studyFloating : { ...s.studyFloating, minimized: false },
    }));
  },
  setActiveStudyId: (id) => set({ activeStudyId: id }),
  setStudyDraftDirty: (dirty) => set({ studyDraftDirty: dirty }),
  setStudyFloating: (layout) =>
    set((s) => ({ studyFloating: { ...s.studyFloating, ...layout } })),
  setStudyPreviewOpen: (open) =>
    set((s) => ({
      studyPreviewOpen: open,
      studyPreviewStudy: open ? s.studyPreviewStudy : null,
    })),
  openStudyPreview: (study) => set({ studyPreviewOpen: true, studyPreviewStudy: study }),
  closeStudyPreview: () => set({ studyPreviewOpen: false, studyPreviewStudy: null }),
  setStudyPreviewFloating: (layout) =>
    set((s) => ({ studyPreviewFloating: { ...s.studyPreviewFloating, ...layout } })),
  sendVerseToStudy: (ctx) => {
    if (isElectronStudyWindow() && !isStudyWindowRoute()) {
      void electronSendVerseToStudy(ctx);
    }
    set((s) => {
      const duplicate = (list: VerseContext[]) =>
        list.some(
          (v) =>
            v.reference === ctx.reference &&
            v.version === ctx.version &&
            v.bookOsisId === ctx.bookOsisId &&
            v.chapter === ctx.chapter &&
            v.verse === ctx.verse
        );
      return {
        studyModeOpen: true,
        studyFloating: { ...s.studyFloating, minimized: false },
        studyVerseInbox: duplicate(s.studyVerseInbox) ? s.studyVerseInbox : [...s.studyVerseInbox, ctx],
        studyVerses: duplicate(s.studyVerses) ? s.studyVerses : [...s.studyVerses, ctx],
        selectedVerseContext: ctx,
        selectedVerse: ctx.verse,
        referenceInput: ctx.reference,
      };
    });
  },
  consumeStudyVerseInbox: () => {
    const items = get().studyVerseInbox;
    set({ studyVerseInbox: [] });
    return items;
  },
  referenceInput: "João 1",
  setReferenceInput: (ref) => set({ referenceInput: ref }),
  wordSearchQuery: "",
  wordSearchSubmitted: "",
  setWordSearchQuery: (query) => set({ wordSearchQuery: query }),
  submitWordSearch: (query) => {
    const q = (query ?? get().wordSearchQuery).trim();
    if (!q) return;

    const kind = detectWordSearchKind(q);
    if (kind === "strong") {
      const normalized = normalizeStrongQuery(q);
      set({
        wordSearchQuery: q,
        wordSearchSubmitted: q,
        activeModule: "strong",
        toolPanelOpen: true,
        selectedStrongNumber: normalized,
      });
      return;
    }

    set({
      wordSearchQuery: q,
      wordSearchSubmitted: q,
      activeModule: "search",
      toolPanelOpen: true,
    });
  },
}));
