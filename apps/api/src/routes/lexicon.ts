import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../plugins/prisma.js";
import { searchLexiconChunks } from "@mrb/content-importers";

const searchSchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().max(30).default(10),
});

export async function lexiconRoutes(app: FastifyInstance) {
  app.get("/status", async () => {
    const [docs, chunks] = await Promise.all([
      prisma.ragDocument.count({ where: { documentType: "lexicon" } }),
      prisma.ragChunk.count({
        where: { document: { documentType: "lexicon" } },
      }),
    ]);
    return { indexed: docs > 0, documents: docs, chunks };
  });

  app.get("/search", async (req, reply) => {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const { q, limit } = parsed.data;
    const results = await searchLexiconChunks(prisma, q, { limit });
    return {
      query: q,
      count: results.length,
      results: results.map((r) => ({
        score: r.score,
        document: r.document,
        excerpt: r.chunk.text.slice(0, 600),
        chunkOrder: r.chunk.order,
      })),
    };
  });
}
