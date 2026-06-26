import { normalizeText } from "@mrb/bible-core";
import { resolveOsisBook } from "./osis-map.js";

export interface ParsedChainReference {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  osisRef: string;
}

function formatOsisRef(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number
): string {
  if (verseEnd && verseEnd !== verseStart) {
    return `${book}.${chapter}.${verseStart}-${book}.${chapter}.${verseEnd}`;
  }
  return `${book}.${chapter}.${verseStart}`;
}

function parseSegment(segment: string): ParsedChainReference | null {
  const dotMatch = segment.match(/^([1-3]?\s?[A-Za-z.]+)\.(\d+)\.(\d+)(?:-(\d+))?$/);
  if (dotMatch) {
    const bookRaw = dotMatch[1]!.replace(/\./g, " ").trim();
    const book = resolveOsisBook(bookRaw);
    if (!book) return null;
    const chapter = parseInt(dotMatch[2]!, 10);
    const verseStart = parseInt(dotMatch[3]!, 10);
    const verseEnd = dotMatch[4] ? parseInt(dotMatch[4], 10) : undefined;
    return {
      book,
      chapter,
      verseStart,
      verseEnd,
      osisRef: formatOsisRef(book, chapter, verseStart, verseEnd),
    };
  }

  const spaceMatch = segment.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (spaceMatch) {
    const book = resolveOsisBook(spaceMatch[1]!.trim());
    if (!book) return null;
    const chapter = parseInt(spaceMatch[2]!, 10);
    const verseStart = parseInt(spaceMatch[3]!, 10);
    const verseEnd = spaceMatch[4] ? parseInt(spaceMatch[4], 10) : undefined;
    return {
      book,
      chapter,
      verseStart,
      verseEnd,
      osisRef: formatOsisRef(book, chapter, verseStart, verseEnd),
    };
  }

  return null;
}

/** Parse referências OSIS (Exod.6.16), ranges (John.3.16-John.3.18) ou livres (John 3:16). */
export function parseChainReference(input: string): ParsedChainReference | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const rangeParts = trimmed.split("-");
  if (rangeParts.length === 2) {
    const start = parseSegment(rangeParts[0]!.trim());
    const end = parseSegment(rangeParts[1]!.trim());
    if (start && end && start.book === end.book && start.chapter === end.chapter) {
      return {
        ...start,
        verseEnd: end.verseStart,
        osisRef: formatOsisRef(start.book, start.chapter, start.verseStart, end.verseStart),
      };
    }
  }

  return parseSegment(trimmed);
}

export function parseTorreyVerse(verse: {
  book: string;
  chapter: number;
  verse: number;
  end_chapter?: number;
  end_verse?: number;
}): ParsedChainReference | null {
  const book = resolveOsisBook(verse.book);
  if (!book) return null;
  const verseEnd =
    verse.end_verse && verse.end_verse > 0 ? verse.end_verse : undefined;
  return {
    book,
    chapter: verse.chapter,
    verseStart: verse.verse,
    verseEnd,
    osisRef: formatOsisRef(book, verse.chapter, verse.verse, verseEnd),
  };
}

export function normalizeTopicTitle(title: string): string {
  return normalizeText(title);
}
