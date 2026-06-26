import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../plugins/prisma.js";
import {
  bibleSearchEngine,
  MeilisearchBibleClient,
  type BibleIndexDocument,
} from "@mrb/search-engine";
import {
  searchStrongLexicon,
  getStrongDetail,
  getStrongStats,
  normalizeStrongNumber,
  type StrongSearchMode,
} from "@mrb/content-importers";
import { parseReference } from "@mrb/bible-core";
import type { SearchMode } from "@mrb/shared-types";

const searchSchema = z.object({
  query: z.string().min(1),
  mode: z.string().default("phrase"),
  version: z.string().optional(),
  limit: z.coerce.number().max(100).default(50),
});

const strongSearchSchema = z.object({
  q: z.string().min(1),
  mode: z
    .enum(["number", "lemma", "transliteration", "definition", "all"])
    .optional(),
  language: z.enum(["greek", "hebrew", "aramaic"]).optional(),
  limit: z.coerce.number().max(100).default(40),
});

let meiliClient: MeilisearchBibleClient | null = null;

function getMeilisearch(): MeilisearchBibleClient | null {
  if (meiliClient) return meiliClient;
  const url = process.env.MEILISEARCH_URL;
  if (!url) return null;
  meiliClient = new MeilisearchBibleClient({
    url,
    apiKey: process.env.MEILISEARCH_API_KEY,
  });
  return meiliClient;
}

function toSearchResult(doc: BibleIndexDocument, score = 1) {
  return {
    verse: {
      id: doc.id,
      bookId: doc.bookId,
      bookOsisId: doc.bookOsisId,
      bookName: doc.bookNamePt,
      chapter: doc.chapter,
      verse: doc.verse,
      text: doc.text,
      versionId: doc.versionId,
      normalizedText: doc.normalizedText,
    },
    bookName: doc.bookNamePt,
    score,
    highlight: doc.text,
  };
}

export async function searchRoutes(app: FastifyInstance) {
  app.get("/verses", async (req, reply) => {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const { query, mode, version, limit } = parsed.data;
    const versionAbbr = version ?? "BLIVRE";
    const meili = getMeilisearch();

    if (meili && (await meili.health())) {
      if (mode === "reference") {
        const ref = parseReference(query);
        if (!ref) return { query, mode, count: 0, results: [], engine: "meilisearch" };

        const filter = [
          `versionAbbr = "${versionAbbr}"`,
          `bookOsisId = "${ref.bookOsisId}"`,
          `chapter = ${ref.chapter}`,
        ];
        if (ref.verseStart !== undefined) {
          const end = ref.verseEnd ?? ref.verseStart;
          filter.push(`verse >= ${ref.verseStart}`, `verse <= ${end}`);
        }

        const hits = await meili.search("", {
          limit,
          filter: filter.join(" AND "),
        });
        const results = hits.map((h) => toSearchResult(h));
        return { query, mode, count: results.length, results, engine: "meilisearch" };
      }

      const hits = await meili.search(query, { limit, versionAbbr });
      const results = hits.map((h, i) => toSearchResult(h, 1 - i * 0.001));
      return { query, mode, count: results.length, results, engine: "meilisearch" };
    }

    const bibleVersion = await prisma.bibleVersion.findFirst({
      where: { abbreviation: versionAbbr },
    });
    if (!bibleVersion) return reply.status(404).send({ error: "Versão não encontrada" });

    const verses = await prisma.bibleVerse.findMany({
      where: { versionId: bibleVersion.id },
      take: 5000,
    });

    const books = await prisma.bibleBook.findMany();
    const bookMap = new Map(books.map((b) => [b.id, b]));

    const searchable = verses.map((v) => {
      const book = bookMap.get(v.bookId);
      return {
        id: v.id,
        bookId: v.bookId,
        bookOsisId: book?.osisId ?? "",
        bookName: book?.namePt ?? "",
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        versionId: v.versionId,
        normalizedText: v.normalizedText,
      };
    });

    const results = bibleSearchEngine.search(searchable, {
      query,
      mode: mode as SearchMode,
      limit,
    });

    return { query, mode, count: results.length, results, engine: "memory" };
  });

  app.get("/index/status", async () => {
    const meili = getMeilisearch();
    if (!meili || !(await meili.health())) {
      return { indexed: false, engine: null };
    }
    try {
      const stats = await meili.getStats();
      return { indexed: stats.numberOfDocuments > 0, engine: "meilisearch", ...stats };
    } catch {
      return { indexed: false, engine: "meilisearch", numberOfDocuments: 0 };
    }
  });

  app.get("/strongs/stats", async () => getStrongStats(prisma));

  app.get("/strongs", async (req, reply) => {
    const parsed = strongSearchSchema.safeParse(req.query);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const { q, mode, language, limit } = parsed.data;
    return searchStrongLexicon(prisma, q, {
      mode: mode as StrongSearchMode | undefined,
      language,
      limit,
    });
  });

  app.get<{ Params: { number: string } }>("/strong/:number", async (req, reply) => {
    const detail = await getStrongDetail(prisma, req.params.number);
    if (!detail) return reply.status(404).send({ error: "Entrada Strong não encontrada" });
    return detail;
  });

  app.get<{ Params: { number: string } }>("/lexicon/:number", async (req, reply) => {
    const strongNumber = normalizeStrongNumber(req.params.number);
    if (!strongNumber) return reply.status(400).send({ error: "Número Strong inválido" });
    const entry = await prisma.lexiconEntry.findFirst({
      where: { strongNumber },
      orderBy: { createdAt: "desc" },
    });
    if (!entry) return reply.status(404).send({ error: "Entrada não encontrada" });
    return entry;
  });
}
