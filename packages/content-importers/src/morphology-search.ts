import type { PrismaClient } from "@prisma/client";

export interface MorphologySearchHit {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  surfaceForm: string;
  lemma: string | null;
  strongNumber: string | null;
  morphologyCode: string | null;
  morphologyExpanded: string | null;
  glossEn: string | null;
  glossPt: string | null;
  testament: string;
}

export interface MorphologySearchResult {
  query: string;
  count: number;
  results: MorphologySearchHit[];
}

export function isMorphologyQuery(input: string): boolean {
  const q = input.trim();
  if (!q || q.length < 2) return false;
  if (/^([gh])?\s*\d{1,5}$/i.test(q.replace(/\s/g, ""))) return false;
  if (/^(.+?)\s+\d+(?::\d+)?$/i.test(q)) return false;
  if (/^[A-Z]{1,3}\/[\w]+/i.test(q)) return true;
  if (/^[NVADRPCEI][\w-]*$/i.test(q) && q.length <= 24) return true;
  if (/^(noun|verb|adj|part|prep|conj|pron|art|adv|interj)/i.test(q)) return true;
  return false;
}

export async function searchMorphology(
  prisma: PrismaClient,
  query: string,
  options?: { testament?: "OT" | "NT"; limit?: number }
): Promise<MorphologySearchResult> {
  const q = query.trim();
  const limit = Math.min(options?.limit ?? 40, 100);
  if (!q) return { query: q, count: 0, results: [] };

  const tokens = await prisma.originalToken.findMany({
    where: {
      ...(options?.testament ? { testament: options.testament } : {}),
      OR: [
        { morphologyCode: { startsWith: q, mode: "insensitive" } },
        { morphologyCode: { contains: q, mode: "insensitive" } },
        { morphologyExpanded: { contains: q, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: [{ bookId: "asc" }, { chapter: "asc" }, { verse: "asc" }, { tokenOrder: "asc" }],
    select: {
      id: true,
      bookId: true,
      chapter: true,
      verse: true,
      surfaceForm: true,
      lemma: true,
      strongNumber: true,
      morphologyCode: true,
      morphologyExpanded: true,
      glossEn: true,
      glossPt: true,
      testament: true,
    },
  });

  return { query: q, count: tokens.length, results: tokens };
}
