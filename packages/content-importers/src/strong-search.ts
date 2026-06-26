import type { PrismaClient } from "@prisma/client";

export type StrongSearchMode = "number" | "lemma" | "transliteration" | "definition" | "all";

export interface StrongSearchHit {
  id: string;
  strongNumber: string;
  language: string;
  lemma: string;
  transliteration: string | null;
  shortDefinition: string;
  extendedDefinition: string | null;
  semanticDomain: string | null;
  score: number;
}

export interface StrongDetailResult {
  strongNumber: string;
  lexicon: StrongSearchHit | null;
  related: StrongSearchHit[];
  occurrences: number;
  tokens: Array<{
    id: string;
    bookId: string;
    chapter: number;
    verse: number;
    surfaceForm: string;
    lemma: string | null;
    glossPt: string | null;
    glossEn: string | null;
  }>;
}

const GREEK_RE = /[\u0370-\u03FF\u1F00-\u1FFF]/;
const HEBREW_RE = /[\u0590-\u05FF]/;

export function normalizeStrongNumber(input: string): string | null {
  const trimmed = input.trim().toUpperCase().replace(/\s+/g, "");
  const match = trimmed.match(/^([GH])?(\d{1,5})$/);
  if (!match) return null;
  const prefix = match[1] ?? "G";
  const num = parseInt(match[2]!, 10);
  if (Number.isNaN(num) || num <= 0) return null;
  return `${prefix}${num}`;
}

export function parseStrongQuery(input: string): { mode: StrongSearchMode; value: string } {
  const q = input.trim();
  if (!q) return { mode: "all", value: "" };

  const asNumber = normalizeStrongNumber(q);
  if (asNumber) return { mode: "number", value: asNumber };

  if (GREEK_RE.test(q) || HEBREW_RE.test(q)) {
    return { mode: "lemma", value: q };
  }

  if (/^[a-zA-Z][a-zA-Z\s'-]*$/.test(q)) {
    return { mode: "transliteration", value: q };
  }

  return { mode: "all", value: q };
}

function scoreEntry(
  entry: {
    strongNumber: string | null;
    lemma: string;
    transliteration: string | null;
    shortDefinition: string;
    extendedDefinition: string | null;
  },
  query: string,
  mode: StrongSearchMode
): number {
  const q = query.toLowerCase().replace(/^['']+|['']+$/g, "");
  const strong = (entry.strongNumber ?? "").toLowerCase();
  const lemma = entry.lemma.toLowerCase();
  const translit = (entry.transliteration ?? "").toLowerCase().replace(/^['']+|['']+$/g, "");
  const short = entry.shortDefinition.toLowerCase();
  const extended = (entry.extendedDefinition ?? "").toLowerCase();

  if (mode === "number") {
    return strong === q.toLowerCase() ? 1 : 0;
  }
  if (mode === "lemma") {
    if (lemma === q) return 1;
    if (lemma.includes(q)) return 0.85;
    return 0;
  }
  if (mode === "transliteration") {
    if (translit === q) return 1;
    if (translit.includes(q)) return 0.85;
    return 0;
  }
  if (mode === "definition") {
    if (short.includes(q) || extended.includes(q)) return 0.8;
    return 0;
  }

  let score = 0;
  if (strong.includes(q)) score = Math.max(score, 0.95);
  if (lemma.includes(q)) score = Math.max(score, 0.9);
  if (translit.includes(q)) score = Math.max(score, 0.88);
  if (short.includes(q) || extended.includes(q)) score = Math.max(score, 0.75);
  return score;
}

export async function searchStrongLexicon(
  prisma: PrismaClient,
  query: string,
  options?: { mode?: StrongSearchMode; limit?: number; language?: "greek" | "hebrew" | "aramaic" }
): Promise<{ query: string; mode: StrongSearchMode; count: number; results: StrongSearchHit[] }> {
  const limit = options?.limit ?? 40;
  const parsed = options?.mode
    ? { mode: options.mode, value: query.trim() }
    : parseStrongQuery(query);

  if (!parsed.value) {
    return { query, mode: parsed.mode, count: 0, results: [] };
  }

  if (parsed.mode === "number") {
    const raw = parsed.value.trim().toUpperCase();
    const prefixed = normalizeStrongNumber(raw);
    const candidates =
      prefixed && /^[GH]/.test(raw.replace(/\s+/g, ""))
        ? [prefixed]
        : /^\d+$/.test(raw)
          ? [`G${parseInt(raw, 10)}`, `H${parseInt(raw, 10)}`]
          : prefixed
            ? [prefixed]
            : [];

    const entries = await prisma.lexiconEntry.findMany({
      where: { strongNumber: { in: candidates } },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    if (!entries.length) return { query, mode: "number", count: 0, results: [] };

    const results = entries.map((e) => ({ ...mapEntry(e), score: 1 }));
    return { query, mode: "number", count: results.length, results };
  }

  const where =
    parsed.mode === "lemma"
      ? { lemma: { contains: parsed.value, mode: "insensitive" as const } }
      : parsed.mode === "transliteration"
        ? { transliteration: { contains: parsed.value, mode: "insensitive" as const } }
        : parsed.mode === "definition"
          ? {
              OR: [
                { shortDefinition: { contains: parsed.value, mode: "insensitive" as const } },
                { extendedDefinition: { contains: parsed.value, mode: "insensitive" as const } },
              ],
            }
          : {
              OR: [
                { strongNumber: { contains: parsed.value, mode: "insensitive" as const } },
                { lemma: { contains: parsed.value, mode: "insensitive" as const } },
                { transliteration: { contains: parsed.value, mode: "insensitive" as const } },
                { shortDefinition: { contains: parsed.value, mode: "insensitive" as const } },
                { extendedDefinition: { contains: parsed.value, mode: "insensitive" as const } },
              ],
            };

  const entries = await prisma.lexiconEntry.findMany({
    where: {
      ...where,
      ...(options?.language ? { language: options.language } : {}),
    },
    take: Math.min(limit * 4, 200),
    orderBy: { strongNumber: "asc" },
  });

  const results = entries
    .map((e) => ({ ...mapEntry(e), score: scoreEntry(e, parsed.value, parsed.mode) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { query, mode: parsed.mode, count: results.length, results };
}

export async function getStrongDetail(
  prisma: PrismaClient,
  numberInput: string
): Promise<StrongDetailResult | null> {
  const strongNumber = normalizeStrongNumber(numberInput);
  if (!strongNumber) return null;

  const lexicon = await prisma.lexiconEntry.findFirst({ where: { strongNumber } });
  if (!lexicon) return null;

  const lemmaPrefix = lexicon.lemma.slice(0, Math.min(3, lexicon.lemma.length));
  const related = await prisma.lexiconEntry.findMany({
    where: {
      language: lexicon.language,
      id: { not: lexicon.id },
      OR: [
        { transliteration: { startsWith: (lexicon.transliteration ?? "").slice(0, 3), mode: "insensitive" } },
        { lemma: { startsWith: lemmaPrefix } },
        { semanticDomain: lexicon.semanticDomain ?? undefined },
      ],
    },
    take: 8,
  });

  const [occurrenceCount, tokens] = await Promise.all([
    prisma.originalToken.count({ where: { strongNumber } }),
    prisma.originalToken.findMany({
      where: { strongNumber },
      take: 50,
      orderBy: [{ bookId: "asc" }, { chapter: "asc" }, { verse: "asc" }],
      select: {
        id: true,
        bookId: true,
        chapter: true,
        verse: true,
        surfaceForm: true,
        lemma: true,
        glossPt: true,
        glossEn: true,
      },
    }),
  ]);

  return {
    strongNumber,
    lexicon: { ...mapEntry(lexicon), score: 1 },
    related: related.map((r) => ({ ...mapEntry(r), score: 0.5 })),
    occurrences: occurrenceCount,
    tokens,
  };
}

function mapEntry(entry: {
  id: string;
  strongNumber: string | null;
  language: string;
  lemma: string;
  transliteration: string | null;
  shortDefinition: string;
  extendedDefinition: string | null;
  semanticDomain: string | null;
}): Omit<StrongSearchHit, "score"> {
  return {
    id: entry.id,
    strongNumber: entry.strongNumber ?? "",
    language: entry.language,
    lemma: entry.lemma,
    transliteration: entry.transliteration,
    shortDefinition: entry.shortDefinition,
    extendedDefinition: entry.extendedDefinition,
    semanticDomain: entry.semanticDomain,
  };
}

export async function getStrongStats(prisma: PrismaClient) {
  const [total, greek, hebrew, aramaic] = await Promise.all([
    prisma.lexiconEntry.count(),
    prisma.lexiconEntry.count({ where: { language: "greek" } }),
    prisma.lexiconEntry.count({ where: { language: "hebrew" } }),
    prisma.lexiconEntry.count({ where: { language: "aramaic" } }),
  ]);
  return { total, greek, hebrew, aramaic, indexed: total > 0 };
}
