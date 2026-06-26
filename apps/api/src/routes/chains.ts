import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../plugins/prisma.js";
import {
  searchTopics,
  getTopicById,
  getChainById,
  getNextChainNode,
  getPrevChainNode,
  getChainStats,
  createUserChain,
  exportChainMarkdown,
} from "@mrb/chain-system";

const searchSchema = z.object({
  q: z.string().min(1),
  source: z.string().optional(),
  limit: z.coerce.number().max(100).default(40),
});

const userChainSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  verses: z.array(
    z.object({
      bookOsisId: z.string(),
      chapter: z.number(),
      verse: z.number(),
      text: z.string().optional(),
      reference: z.string().optional(),
    })
  ),
});

export async function chainRoutes(app: FastifyInstance) {
  app.get("/stats", async () => getChainStats(prisma));

  app.get("/topics/search", async (req, reply) => {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const { q, source, limit } = parsed.data;
    return searchTopics(prisma, q, { sourceKey: source, limit });
  });

  app.get<{ Params: { id: string } }>("/topics/:id", async (req, reply) => {
    const topic = await getTopicById(prisma, req.params.id);
    if (!topic) return reply.status(404).send({ error: "Tópico não encontrado" });
    return topic;
  });

  app.get<{ Params: { id: string } }>("/chains/:id", async (req, reply) => {
    const chain = await getChainById(prisma, req.params.id);
    if (!chain) return reply.status(404).send({ error: "Cadeia não encontrada" });
    return chain;
  });

  app.get<{ Params: { nodeId: string } }>("/nodes/:nodeId/next", async (req) => {
    return { node: await getNextChainNode(prisma, req.params.nodeId) };
  });

  app.get<{ Params: { nodeId: string } }>("/nodes/:nodeId/prev", async (req) => {
    return { node: await getPrevChainNode(prisma, req.params.nodeId) };
  });

  app.post("/user-chains", async (req, reply) => {
    const parsed = userChainSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const chain = await createUserChain(prisma, parsed.data);
    return chain;
  });

  app.get<{ Params: { id: string }; Querystring: { format?: string } }>(
    "/chains/:id/export",
    async (req, reply) => {
      const chain = await getChainById(prisma, req.params.id);
      if (!chain) return reply.status(404).send({ error: "Cadeia não encontrada" });
      const format = req.query.format ?? "markdown";
      if (format === "markdown") {
        return { format, content: exportChainMarkdown(chain) };
      }
      if (format === "json") {
        return { format, content: JSON.stringify(chain, null, 2) };
      }
      return reply.status(400).send({ error: "Formato não suportado" });
    }
  );

  app.get("/sources", async () => prisma.chainSource.findMany({ orderBy: { sourceKey: "asc" } }));
}
