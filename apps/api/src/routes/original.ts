import type { FastifyInstance } from "fastify";
import { prisma } from "../plugins/prisma.js";
import {
  getVerseOriginalTokens,
  getOriginalTokenStats,
  getStrongOccurrences,
  getChapterOriginalAvailability,
  getChapterOriginalTokens,
} from "@mrb/content-importers";

export async function originalRoutes(app: FastifyInstance) {
  app.get("/status", async () => getOriginalTokenStats(prisma));

  app.get("/chapter/:book/:chapter/availability", async (req, reply) => {
    const { book, chapter } = req.params as { book: string; chapter: string };
    const ch = parseInt(chapter, 10);
    if (Number.isNaN(ch)) return reply.status(400).send({ error: "Capítulo inválido" });
    return getChapterOriginalAvailability(prisma, book, ch);
  });

  app.get("/chapter/:book/:chapter/tokens", async (req, reply) => {
    const { book, chapter } = req.params as { book: string; chapter: string };
    const ch = parseInt(chapter, 10);
    if (Number.isNaN(ch)) return reply.status(400).send({ error: "Capítulo inválido" });
    const byVerse = await getChapterOriginalTokens(prisma, book, ch);
    return {
      book,
      chapter: ch,
      verses: byVerse,
      source: Object.keys(byVerse).length > 0 ? "STEPBible TAGNT" : null,
      attribution: "Dados STEPBible.org (CC BY 4.0)",
    };
  });

  app.get("/verse/:book/:chapter/:verse/tokens", async (req, reply) => {
    const { book, chapter, verse } = req.params as {
      book: string;
      chapter: string;
      verse: string;
    };
    const ch = parseInt(chapter, 10);
    const vs = parseInt(verse, 10);
    if (Number.isNaN(ch) || Number.isNaN(vs)) {
      return reply.status(400).send({ error: "Capítulo e versículo inválidos" });
    }

    const tokens = await getVerseOriginalTokens(prisma, book, ch, vs);
    return {
      book,
      chapter: ch,
      verse: vs,
      tokenCount: tokens.length,
      tokens,
      source: tokens.length > 0 ? "STEPBible TAGNT" : null,
      attribution: "Dados STEPBible.org (CC BY 4.0)",
    };
  });

  app.get("/strong/:number/occurrences", async (req) => {
    const { number } = req.params as { number: string };
    const q = req.query as { limit?: string };
    const limit = q.limit ? parseInt(q.limit, 10) : 50;
    const occurrences = await getStrongOccurrences(prisma, number.toUpperCase(), limit);
    return { strongNumber: number.toUpperCase(), count: occurrences.length, occurrences };
  });
}
