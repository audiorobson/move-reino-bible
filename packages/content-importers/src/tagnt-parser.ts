import { stepBookToOsis } from "./step-book-map.js";

export interface StepTagntToken {
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
  dictionaryGloss?: string;
}

const DATA_LINE_RE = /^([A-Za-z0-9]+)\.(\d+)\.(\d+)#(\d+)=(\w+)\t/;

function parseGreekField(raw: string): { surface: string; transliteration?: string } {
  const trimmed = raw.trim();
  const m = trimmed.match(/^(.+?)\s*\(([^)]+)\)\s*,?$/);
  if (m) {
    return { surface: m[1]!.trim(), transliteration: m[2]!.trim() };
  }
  return { surface: trimmed.replace(/,$/, "").trim() };
}

function parseStrongMorph(field: string): {
  extendedStrong?: string;
  strongNumber?: string;
  morphologyCode?: string;
} {
  const eq = field.indexOf("=");
  if (eq === -1) return {};
  const code = field.slice(0, eq).trim();
  const morph = field.slice(eq + 1).trim();
  const baseMatch = code.match(/^(G)(\d+)/i);
  const strongNumber = baseMatch
    ? `G${parseInt(baseMatch[2]!, 10)}`
    : undefined;
  return {
    extendedStrong: code,
    strongNumber: strongNumber ?? undefined,
    morphologyCode: morph || undefined,
  };
}

function parseDictionaryField(field: string): { lemma?: string; gloss?: string } {
  const eq = field.indexOf("=");
  if (eq === -1) return {};
  return {
    lemma: field.slice(0, eq).trim(),
    gloss: field.slice(eq + 1).trim(),
  };
}

export function parseTagntLine(line: string): StepTagntToken | null {
  const m = line.match(DATA_LINE_RE);
  if (!m) return null;

  const [, stepBook, chapterStr, verseStr, orderStr, wordType] = m;
  const bookOsisId = stepBookToOsis(stepBook!);
  if (!bookOsisId) return null;

  const cols = line.split("\t");
  if (cols.length < 5) return null;

  const greek = parseGreekField(cols[1] ?? "");
  const glossEn = (cols[2] ?? "").trim() || undefined;
  const strongMorph = parseStrongMorph(cols[3] ?? "");
  const dict = parseDictionaryField(cols[4] ?? "");
  return {
    bookOsisId,
    chapter: parseInt(chapterStr!, 10),
    verse: parseInt(verseStr!, 10),
    tokenOrder: parseInt(orderStr!, 10),
    wordType: wordType ?? "UNK",
    surfaceForm: greek.surface,
    transliteration: greek.transliteration,
    glossEn,
    lemma: dict.lemma,
    dictionaryGloss: dict.gloss,
    strongNumber: strongMorph.strongNumber,
    extendedStrong: strongMorph.extendedStrong,
    morphologyCode: strongMorph.morphologyCode,
  };
}

export interface TagntFilter {
  bookOsisId?: string;
  chapter?: number;
  verse?: number;
}

export function tagntLineMatchesFilter(token: StepTagntToken, filter?: TagntFilter): boolean {
  if (!filter) return true;
  if (filter.bookOsisId && token.bookOsisId !== filter.bookOsisId) return false;
  if (filter.chapter != null && token.chapter !== filter.chapter) return false;
  if (filter.verse != null && token.verse !== filter.verse) return false;
  return true;
}
