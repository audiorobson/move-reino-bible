import type { PrismaClient } from "@prisma/client";
import type { VersificationPair } from "./tvtms-parser.js";
import type { VersificationTradition } from "./verse-ref.js";

export async function importVersificationPairs(
  prisma: PrismaClient,
  pairs: VersificationPair[]
): Promise<{ created: number; skipped: number }> {
  await prisma.versificationMapping.deleteMany({});

  let created = 0;
  const BATCH = 500;
  const batch: Array<{
    sourceTradition: string;
    targetTradition: string;
    sourceBook: string;
    sourceChapter: number;
    sourceVerse: number;
    targetBook: string;
    targetChapter: number;
    targetVerse: number;
    sourceRef: string;
    targetRef: string;
    mappingType: string;
  }> = [];

  const flush = async () => {
    if (!batch.length) return;
    const result = await prisma.versificationMapping.createMany({ data: [...batch], skipDuplicates: true });
    created += result.count;
    batch.length = 0;
  };

  for (const pair of pairs) {
    batch.push({
      sourceTradition: pair.sourceTradition,
      targetTradition: pair.targetTradition,
      sourceBook: pair.source.bookOsisId,
      sourceChapter: pair.source.chapter,
      sourceVerse: pair.source.verse,
      targetBook: pair.target.bookOsisId,
      targetChapter: pair.target.chapter,
      targetVerse: pair.target.verse,
      sourceRef: pair.source.raw,
      targetRef: pair.target.raw,
      mappingType: "exact",
    });
    if (batch.length >= BATCH) await flush();
  }

  await flush();
  return { created, skipped: pairs.length - created };
}

export async function convertVerseRef(
  prisma: PrismaClient,
  opts: {
    bookOsisId: string;
    chapter: number;
    verse: number;
    from: VersificationTradition;
    to: VersificationTradition;
  }
): Promise<{
  book: string;
  chapter: number;
  verse: number;
  mapped: boolean;
  sourceRef: string;
  targetRef?: string;
}> {
  const { bookOsisId, chapter, verse, from, to } = opts;

  if (from === to) {
    return { book: bookOsisId, chapter, verse, mapped: false, sourceRef: `${bookOsisId} ${chapter}:${verse}` };
  }

  const hit = await prisma.versificationMapping.findFirst({
    where: {
      sourceTradition: from,
      targetTradition: to,
      sourceBook: bookOsisId,
      sourceChapter: chapter,
      sourceVerse: verse,
    },
  });

  if (!hit) {
    return { book: bookOsisId, chapter, verse, mapped: false, sourceRef: `${bookOsisId} ${chapter}:${verse}` };
  }

  return {
    book: hit.targetBook,
    chapter: hit.targetChapter,
    verse: hit.targetVerse,
    mapped: true,
    sourceRef: hit.sourceRef,
    targetRef: hit.targetRef,
  };
}

export async function getChapterVersificationProfile(
  prisma: PrismaClient,
  bookOsisId: string,
  chapter: number,
  from: VersificationTradition,
  to: VersificationTradition
): Promise<{
  book: string;
  chapter: number;
  hasDifferences: boolean;
  mappings: Array<{ sourceVerse: number; targetVerse: number; sourceRef: string; targetRef: string }>;
}> {
  const rows = await prisma.versificationMapping.findMany({
    where: {
      sourceTradition: from,
      targetTradition: to,
      sourceBook: bookOsisId,
      sourceChapter: chapter,
    },
    orderBy: { sourceVerse: "asc" },
  });

  const mappings = rows.map((r) => ({
    sourceVerse: r.sourceVerse,
    targetVerse: r.targetVerse,
    sourceRef: r.sourceRef,
    targetRef: r.targetRef,
  }));

  const hasDifferences = mappings.some((m) => m.sourceVerse !== m.targetVerse);

  return { book: bookOsisId, chapter, hasDifferences, mappings };
}

export async function getVersificationStats(prisma: PrismaClient) {
  const total = await prisma.versificationMapping.count();
  const traditions = await prisma.versificationMapping.groupBy({ by: ["sourceTradition", "targetTradition"], _count: true });
  return { total, indexed: total > 0, traditions };
}
