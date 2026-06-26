import { DEMO_STUDY_USER } from "./study-utils";

export type ReaderTheme = "sepia" | "paper" | "night";
export type ReaderFontSize = "sm" | "md" | "lg" | "xl";
export type HighlightColor = "yellow" | "green" | "blue" | "pink";

export interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: ReaderFontSize;
  lineWidth: "narrow" | "normal" | "wide";
  immersive: boolean;
}

export interface ReadingProgress {
  bookId: string;
  chapterId: string;
  chapterTitle?: string;
  scrollTop: number;
  scrollPercent: number;
  bookPercent?: number;
  updatedAt: string;
}

export interface TextHighlight {
  id: string;
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  text: string;
  color: HighlightColor;
  createdAt: string;
}

const SETTINGS_KEY = "mrb-library-reader-settings";
const PROGRESS_PREFIX = "mrb-library-progress";
const HIGHLIGHTS_KEY = "mrb-library-highlights";

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "sepia",
  fontSize: "md",
  lineWidth: "normal",
  immersive: true,
};

function storageKey(userId: string, bookId: string) {
  return `${PROGRESS_PREFIX}:${userId}:${bookId}`;
}

export function loadReaderSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveReaderSettings(settings: ReaderSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadReadingProgress(
  bookId: string,
  userId = DEMO_STUDY_USER
): ReadingProgress | null {
  try {
    const raw = localStorage.getItem(storageKey(userId, bookId));
    return raw ? (JSON.parse(raw) as ReadingProgress) : null;
  } catch {
    return null;
  }
}

export function saveReadingProgress(
  progress: ReadingProgress,
  userId = DEMO_STUDY_USER
) {
  localStorage.setItem(
    storageKey(userId, progress.bookId),
    JSON.stringify({ ...progress, updatedAt: new Date().toISOString() })
  );
}

export function loadAllReadingProgress(userId = DEMO_STUDY_USER): ReadingProgress[] {
  const results: ReadingProgress[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(`${PROGRESS_PREFIX}:${userId}:`)) continue;
    try {
      const item = JSON.parse(localStorage.getItem(key)!) as ReadingProgress;
      if (item.bookId) results.push(item);
    } catch {
      /* ignore */
    }
  }
  return results.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function loadHighlights(userId = DEMO_STUDY_USER): TextHighlight[] {
  try {
    const raw = localStorage.getItem(`${HIGHLIGHTS_KEY}:${userId}`);
    return raw ? (JSON.parse(raw) as TextHighlight[]) : [];
  } catch {
    return [];
  }
}

export function saveHighlights(highlights: TextHighlight[], userId = DEMO_STUDY_USER) {
  localStorage.setItem(`${HIGHLIGHTS_KEY}:${userId}`, JSON.stringify(highlights));
}

export function addHighlight(
  highlight: Omit<TextHighlight, "id" | "createdAt">,
  userId = DEMO_STUDY_USER
): TextHighlight {
  const entry: TextHighlight = {
    ...highlight,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const all = loadHighlights(userId);
  saveHighlights([...all, entry], userId);
  return entry;
}

export function removeHighlight(id: string, userId = DEMO_STUDY_USER) {
  const all = loadHighlights(userId).filter((h) => h.id !== id);
  saveHighlights(all, userId);
}

export function getChapterHighlights(
  bookId: string,
  chapterId: string,
  userId = DEMO_STUDY_USER
) {
  return loadHighlights(userId).filter(
    (h) => h.bookId === bookId && h.chapterId === chapterId
  );
}

export function getBookHighlights(bookId: string, userId = DEMO_STUDY_USER) {
  return loadHighlights(userId).filter((h) => h.bookId === bookId);
}

export function exportBookHighlightsMarkdown(
  bookTitle: string,
  author: string | undefined,
  bookId: string,
  chapterTitles: Map<string, string>,
  userId = DEMO_STUDY_USER
): string {
  const highlights = getBookHighlights(bookId, userId);
  if (!highlights.length) return "";

  const lines = [`# Grifos — ${bookTitle}`, author ? `*${author}*` : "", ""];
  for (const hl of highlights) {
    const chapter = chapterTitles.get(hl.chapterId) ?? hl.chapterId;
    lines.push(`## ${chapter}`, `> ${hl.text}`, "");
  }
  return lines.join("\n").trim();
}

export function computeBookPercent(chapterIndex: number, scrollRatio: number, totalChapters: number) {
  if (totalChapters <= 0) return 0;
  return Math.min(100, ((chapterIndex + scrollRatio) / totalChapters) * 100);
}

export function formatCitation(
  bookTitle: string,
  author: string | undefined,
  chapterTitle: string,
  text: string
) {
  return `${bookTitle}${author ? ` — ${author}` : ""}\n${chapterTitle}\n\n"${text.trim()}"`;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function applyHighlightsToText(
  text: string,
  highlights: TextHighlight[],
  paragraphIndex: number
): Array<{ text: string; highlight?: HighlightColor }> {
  const relevant = highlights
    .filter((h) => h.paragraphIndex === paragraphIndex && h.text.trim())
    .sort((a, b) => text.indexOf(a.text) - text.indexOf(b.text));

  if (!relevant.length) return [{ text }];

  const segments: Array<{ text: string; highlight?: HighlightColor }> = [];
  let cursor = 0;

  for (const hl of relevant) {
    const idx = text.indexOf(hl.text, cursor);
    if (idx === -1) continue;
    if (idx > cursor) segments.push({ text: text.slice(cursor, idx) });
    segments.push({ text: hl.text, highlight: hl.color });
    cursor = idx + hl.text.length;
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments.length ? segments : [{ text }];
}
