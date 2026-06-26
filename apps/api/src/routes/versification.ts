import type { FastifyInstance } from "fastify";
import { prisma } from "../plugins/prisma.js";
import {
  convertVerseRef,
  getChapterVersificationProfile,
  getVersificationStats,
} from "@mrb/versification-engine";

export async function versificationRoutes(app: FastifyInstance) {
  app.get("/status", async () => getVersificationStats(prisma));

  app.get("/convert/:book/:chapter/:verse", async (req, reply) => {
    const { book, chapter, verse } = req.params as { book: string; chapter: string; verse: string };
    const q = req.query as { from?: string; to?: string };
    const ch = parseInt(chapter, 10);
    const vs = parseInt(verse, 10);
    const from = (q.from ?? "english") as "english" | "hebrew" | "greek";
    const to = (q.to ?? "hebrew") as "english" | "hebrew" | "greek";

    if (Number.isNaN(ch) || Number.isNaN(vs)) {
      return reply.status(400).send({ error: "Capítulo e versículo inválidos" });
    }

    return convertVerseRef(prisma, { bookOsisId: book, chapter: ch, verse: vs, from, to });
  });

  app.get("/chapter/:book/:chapter", async (req, reply) => {
    const { book, chapter } = req.params as { book: string; chapter: string };
    const q = req.query as { from?: string; to?: string };
    const ch = parseInt(chapter, 10);
    const from = (q.from ?? "english") as "english" | "hebrew" | "greek";
    const to = (q.to ?? "hebrew") as "english" | "hebrew" | "greek";

    if (Number.isNaN(ch)) return reply.status(400).send({ error: "Capítulo inválido" });

    return getChapterVersificationProfile(prisma, book, ch, from, to);
  });
}
