import type { BibleReference } from "@mrb/shared-types";

const BOOK_ALIASES: Record<string, string> = {
  gen: "Gen", genesis: "Gen", "gênesis": "Gen", geneses: "Gen",
  ex: "Exod", exod: "Exod", exodo: "Exod", "êxodo": "Exod",
  lev: "Lev", levitico: "Lev", "levítico": "Lev",
  num: "Num", numeros: "Num", "números": "Num",
  deut: "Deut", deuteronomio: "Deut", "deuteronômio": "Deut",
  jo: "John", joao: "John", "joão": "John", john: "John",
  mt: "Matt", mateus: "Matt", matt: "Matt",
  mc: "Mark", marcos: "Mark", mark: "Mark",
  lc: "Luke", lucas: "Luke", luke: "Luke",
  at: "Acts", atos: "Acts", acts: "Acts",
  rm: "Rom", rom: "Rom", romanos: "Rom",
  ap: "Rev", apocalipse: "Rev", rev: "Rev", revelation: "Rev",
  sl: "Ps", salmos: "Ps", ps: "Ps", psalms: "Ps",
};

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseReference(input: string): BibleReference | null {
  const cleaned = input.trim();
  const match = cleaned.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i);
  if (!match) return null;

  const [, bookPart, chapterStr, verseStartStr, verseEndStr] = match;
  if (!bookPart || !chapterStr) return null;

  const bookKey = bookPart.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const osisId = BOOK_ALIASES[bookKey] ?? bookPart;

  return {
    bookOsisId: osisId,
    chapter: parseInt(chapterStr, 10),
    verseStart: verseStartStr ? parseInt(verseStartStr, 10) : undefined,
    verseEnd: verseEndStr ? parseInt(verseEndStr, 10) : undefined,
  };
}

export function formatReference(ref: BibleReference, bookName?: string): string {
  const book = bookName ?? ref.bookOsisId;
  let result = `${book} ${ref.chapter}`;
  if (ref.verseStart !== undefined) {
    result += `:${ref.verseStart}`;
    if (ref.verseEnd !== undefined && ref.verseEnd !== ref.verseStart) {
      result += `-${ref.verseEnd}`;
    }
  }
  return result;
}

export function formatVerseForCopy(
  text: string,
  ref: BibleReference,
  bookName: string,
  versionAbbreviation: string
): string {
  const reference = formatReference(ref, bookName);
  return `${text} — ${reference} (${versionAbbreviation})`;
}

export interface VerseSearchQuery {
  query: string;
  mode: "exact" | "phrase" | "all_words" | "any_word";
}

export function buildSearchTerms(query: VerseSearchQuery): string[] {
  const normalized = normalizeText(query.query);
  switch (query.mode) {
    case "exact":
    case "phrase":
      return [normalized];
    case "all_words":
    case "any_word":
      return normalized.split(" ").filter(Boolean);
    default:
      return [normalized];
  }
}

export function matchesSearch(
  verseText: string,
  query: VerseSearchQuery
): boolean {
  const normalized = normalizeText(verseText);
  const terms = buildSearchTerms(query);

  switch (query.mode) {
    case "exact":
      return normalized === terms[0];
    case "phrase":
      return normalized.includes(terms[0] ?? "");
    case "all_words":
      return terms.every((t) => normalized.includes(t));
    case "any_word":
      return terms.some((t) => normalized.includes(t));
    default:
      return false;
  }
}
