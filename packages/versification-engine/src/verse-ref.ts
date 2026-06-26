import { tvtmsBookToOsis } from "./tvtms-book-map.js";

export type VersificationTradition = "english" | "hebrew" | "greek";

export interface ParsedVerseRef {
  book: string;
  bookOsisId: string;
  chapter: number;
  verse: number;
  raw: string;
}

const SINGLE_REF_RE = /^([A-Za-z0-9]+)\.(\d+):(\d+)\s*$/;

export function parseTvtmsRef(ref: string): ParsedVerseRef | null {
  const trimmed = ref.trim();
  const m = trimmed.match(SINGLE_REF_RE);
  if (!m) return null;

  const book = m[1]!;
  const osis = tvtmsBookToOsis(book);
  if (!osis) return null;

  return {
    book,
    bookOsisId: osis,
    chapter: parseInt(m[2]!, 10),
    verse: parseInt(m[3]!, 10),
    raw: trimmed,
  };
}

export function formatVerseRef(bookOsisId: string, chapter: number, verse: number): string {
  return `${bookOsisId} ${chapter}:${verse}`;
}
