import { stepBookToOsis } from "./step-book-map.js";

export interface StepTahotToken {
  bookOsisId: string;
  chapter: number;
  verse: number;
  tokenOrder: number;
  wordType: string;
  surfaceForm: string;
  transliteration?: string;
  glossEn?: string;
  glossPt?: string;
  strongNumber?: string;
  extendedStrong?: string;
  morphologyCode?: string;
  lemma?: string;
}

const DATA_LINE_RE = /^([A-Za-z0-9]+)\.(\d+)\.(\d+)#(\d+)=(\w+)\t/;

function normalizeHebrewStrong(raw: string): string | undefined {
  const m = raw.match(/^H(\d+)/i);
  if (!m) return undefined;
  return `H${parseInt(m[1]!, 10)}`;
}

function parseHebrewDStrongs(field: string): {
  extendedStrong?: string;
  strongNumber?: string;
} {
  const trimmed = field.trim();
  if (!trimmed) return {};

  const braced = trimmed.match(/\{([Hh]\d+[A-Za-z]?)\}/g);
  if (braced?.length) {
    const last = braced[braced.length - 1]!.slice(1, -1);
    return {
      extendedStrong: trimmed,
      strongNumber: normalizeHebrewStrong(last),
    };
  }

  const parts = trimmed.match(/([Hh]\d+[A-Za-z]?)/g);
  if (parts?.length) {
    const last = parts[parts.length - 1]!;
    return {
      extendedStrong: trimmed,
      strongNumber: normalizeHebrewStrong(last),
    };
  }

  return { extendedStrong: trimmed };
}

export function parseTahotLine(line: string): StepTahotToken | null {
  const m = line.match(DATA_LINE_RE);
  if (!m) return null;

  const [, stepBook, chapterStr, verseStr, orderStr, wordType] = m;
  const bookOsisId = stepBookToOsis(stepBook!);
  if (!bookOsisId) return null;

  const cols = line.split("\t");
  if (cols.length < 6) return null;

  const surfaceForm = (cols[1] ?? "").trim();
  if (!surfaceForm) return null;

  const transliteration = (cols[2] ?? "").trim() || undefined;
  const glossEn = (cols[3] ?? "").trim() || undefined;
  const dStrongs = parseHebrewDStrongs(cols[4] ?? "");
  const morphologyCode = (cols[5] ?? "").trim() || undefined;
  const rootStrong = (cols[8] ?? "").trim();
  const lemma = rootStrong.match(/^H\d+[A-Za-z]?/) ? undefined : undefined;

  return {
    bookOsisId,
    chapter: parseInt(chapterStr!, 10),
    verse: parseInt(verseStr!, 10),
    tokenOrder: parseInt(orderStr!, 10),
    wordType: wordType ?? "UNK",
    surfaceForm,
    transliteration,
    glossEn,
    strongNumber: dStrongs.strongNumber,
    extendedStrong: dStrongs.extendedStrong,
    morphologyCode,
    lemma,
  };
}

export interface TahotFilter {
  bookOsisId?: string;
  chapter?: number;
  verse?: number;
}

export function tahotLineMatchesFilter(token: StepTahotToken, filter?: TahotFilter): boolean {
  if (!filter) return true;
  if (filter.bookOsisId && token.bookOsisId !== filter.bookOsisId) return false;
  if (filter.chapter != null && token.chapter !== filter.chapter) return false;
  if (filter.verse != null && token.verse !== filter.verse) return false;
  return true;
}
