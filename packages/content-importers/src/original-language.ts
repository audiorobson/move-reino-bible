import type { PrismaClient } from "@prisma/client";
import type { OriginalTokenDto } from "@mrb/shared-types";
import { expandMorphology, loadGreekMorphologyMap } from "./tegmc-parser.js";
import { resolveStepDataPath } from "./step-import.js";
import { resolveTokenGlossPt } from "@mrb/shared-types";

let morphCache: Map<string, string> | null = null;

async function getMorphMap(): Promise<Map<string, string>> {
  if (morphCache) return morphCache;
  morphCache = new Map();
  const files = [
    "Morphology codes/TEGMC - Translators Expansion of Greek Morphhology Codes - STEPBible.org CC BY.txt",
    "Morphology codes/TEHMC - Translators Expansion of Hebrew Morphology Codes - STEPBible.org CC BY.txt",
  ];
  for (const rel of files) {
    try {
      const partial = await loadGreekMorphologyMap(resolveStepDataPath(rel));
      for (const [k, v] of partial) morphCache.set(k, v);
    } catch {
      /* optional */
    }
  }
  return morphCache;
}

function toDto(
  token: {
    id: string;
    surfaceForm: string;
    lemma: string | null;
    strongNumber: string | null;
    extendedStrong: string | null;
    morphologyCode: string | null;
    morphologyExpanded: string | null;
    transliteration: string | null;
    glossPt: string | null;
    glossEn: string | null;
    tokenOrder: number;
    testament: string;
    sourceDataset: string | null;
  },
  lexiconShortDefinition?: string
): OriginalTokenDto {
  const glossPt = resolveTokenGlossPt(token.glossEn, token.glossPt, lexiconShortDefinition);
  return {
    id: token.id,
    surfaceForm: token.surfaceForm,
    lemma: token.lemma ?? undefined,
    strongNumber: token.strongNumber ?? undefined,
    morphologyCode: token.morphologyCode ?? undefined,
    morphologyExpanded: token.morphologyExpanded ?? undefined,
    transliteration: token.transliteration ?? undefined,
    glossPt,
    glossEn: token.glossEn ?? undefined,
    tokenOrder: token.tokenOrder,
    testament: token.testament === "OT" || token.testament === "NT" ? token.testament : undefined,
    sourceDataset: token.sourceDataset ?? undefined,
  };
}

async function loadLexiconGlossMap(
  prisma: PrismaClient,
  strongNumbers: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(strongNumbers.filter(Boolean))];
  if (!unique.length) return new Map();

  const entries = await prisma.lexiconEntry.findMany({
    where: { strongNumber: { in: unique } },
    select: { strongNumber: true, shortDefinition: true },
  });

  return new Map(
    entries
      .filter((e) => e.strongNumber)
      .map((e) => [e.strongNumber!, e.shortDefinition])
  );
}

export async function getVerseOriginalTokens(
  prisma: PrismaClient,
  bookOsisId: string,
  chapter: number,
  verse: number
): Promise<OriginalTokenDto[]> {
  const tokens = await prisma.originalToken.findMany({
    where: { bookId: bookOsisId, chapter, verse },
    orderBy: { tokenOrder: "asc" },
  });

  const morphMap = await getMorphMap();
  const lexMap = await loadLexiconGlossMap(
    prisma,
    tokens.map((t) => t.strongNumber ?? "")
  );

  return tokens.map((t) => {
    const expanded =
      t.morphologyExpanded ??
      expandMorphology(t.morphologyCode, morphMap);
    const lexicon = t.strongNumber ? lexMap.get(t.strongNumber) : undefined;
    return toDto({ ...t, morphologyExpanded: expanded ?? null }, lexicon);
  });
}

export async function getOriginalTokenStats(prisma: PrismaClient): Promise<{
  totalTokens: number;
  books: number;
  datasets: string[];
}> {
  const totalTokens = await prisma.originalToken.count();
  const groups = await prisma.originalToken.groupBy({
    by: ["bookId"],
  });
  const datasets = await prisma.originalToken.groupBy({
    by: ["sourceDataset"],
  });

  return {
    totalTokens,
    books: groups.length,
    datasets: datasets.map((d) => d.sourceDataset ?? "unknown"),
  };
}

export async function getStrongOccurrences(
  prisma: PrismaClient,
  strongNumber: string,
  limit = 50
): Promise<Array<{ bookId: string; chapter: number; verse: number; surfaceForm: string; glossEn: string | null }>> {
  const tokens = await prisma.originalToken.findMany({
    where: { strongNumber },
    take: limit,
    orderBy: [{ bookId: "asc" }, { chapter: "asc" }, { verse: "asc" }, { tokenOrder: "asc" }],
    select: {
      bookId: true,
      chapter: true,
      verse: true,
      surfaceForm: true,
      glossEn: true,
    },
  });
  return tokens;
}

export async function getChapterOriginalAvailability(
  prisma: PrismaClient,
  bookOsisId: string,
  chapter: number
): Promise<{
  book: string;
  chapter: number;
  verses: number[];
  totalTokens: number;
  language: "greek" | "hebrew" | null;
  sourceDataset: string | null;
}> {
  const rows = await prisma.originalToken.groupBy({
    by: ["verse"],
    where: { bookId: bookOsisId, chapter },
    _count: { id: true },
  });

  const sample = await prisma.originalToken.findFirst({
    where: { bookId: bookOsisId, chapter },
    select: { testament: true, sourceDataset: true, strongNumber: true },
  });

  const verses = rows.map((r) => r.verse).sort((a, b) => a - b);
  const totalTokens = rows.reduce((sum, r) => sum + r._count.id, 0);

  let language: "greek" | "hebrew" | null = null;
  if (sample) {
    if (sample.testament === "OT" || sample.strongNumber?.startsWith("H")) language = "hebrew";
    else if (sample.testament === "NT" || sample.strongNumber?.startsWith("G")) language = "greek";
  }

  return {
    book: bookOsisId,
    chapter,
    verses,
    totalTokens,
    language,
    sourceDataset: sample?.sourceDataset ?? null,
  };
}

export type ChapterTokensByVerse = Record<number, OriginalTokenDto[]>;

export async function getChapterOriginalTokens(
  prisma: PrismaClient,
  bookOsisId: string,
  chapter: number
): Promise<ChapterTokensByVerse> {
  const tokens = await prisma.originalToken.findMany({
    where: { bookId: bookOsisId, chapter },
    orderBy: [{ verse: "asc" }, { tokenOrder: "asc" }],
  });

  const morphMap = await getMorphMap();
  const lexMap = await loadLexiconGlossMap(
    prisma,
    tokens.map((t) => t.strongNumber ?? "")
  );
  const byVerse: ChapterTokensByVerse = {};

  for (const t of tokens) {
    const expanded =
      t.morphologyExpanded ?? expandMorphology(t.morphologyCode, morphMap);
    const lexicon = t.strongNumber ? lexMap.get(t.strongNumber) : undefined;
    const dto = toDto({ ...t, morphologyExpanded: expanded ?? null }, lexicon);
    if (!byVerse[t.verse]) byVerse[t.verse] = [];
    byVerse[t.verse]!.push(dto);
  }

  return byVerse;
}
