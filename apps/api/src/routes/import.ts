import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../plugins/prisma.js";
import {
  importAllFromManifest,
  importFromJsonFile,
  importHelloaoById,
  parseJsonFlat,
  validateImport,
  persistBibleImport,
  loadManifest,
} from "@mrb/bible-importers";

const helloaoBodySchema = z.object({
  helloaoId: z.string().min(1),
});

const fileBodySchema = z.object({
  filePath: z.string().min(1),
});

const allBodySchema = z.object({
  helloaoOnly: z.array(z.string()).optional(),
  skipHelloao: z.boolean().optional(),
});

const inlineJsonSchema = z.object({
  data: z.string().min(2),
});

export async function importRoutes(app: FastifyInstance) {
  app.get("/sources", async () => {
    const manifest = await loadManifest();
    return {
      manifestVersion: manifest.version,
      localDirectory: manifest.localDirectory,
      sources: manifest.sources,
    };
  });

  app.post("/bible/json", async (req, reply) => {
    const parsed = inlineJsonSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    try {
      const data = parseJsonFlat(parsed.data.data);
      const validation = validateImport(data);
      if (validation.versesImported === 0) {
        return reply.status(400).send({ error: "Validação falhou", validation });
      }
      const persist = await persistBibleImport(prisma, data);
      return { success: true, validation, persist };
    } catch (err) {
      return reply.status(400).send({ error: String(err) });
    }
  });

  app.post("/bible/file", async (req, reply) => {
    const parsed = fileBodySchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    try {
      const result = await importFromJsonFile(prisma, parsed.data.filePath);
      return { success: true, ...result };
    } catch (err) {
      return reply.status(400).send({ error: String(err) });
    }
  });

  app.post("/bible/helloao", async (req, reply) => {
    const parsed = helloaoBodySchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    try {
      const result = await importHelloaoById(prisma, parsed.data.helloaoId);
      return { success: true, ...result };
    } catch (err) {
      return reply.status(500).send({ error: String(err) });
    }
  });

  app.post("/bible/all", async (req, reply) => {
    const parsed = allBodySchema.safeParse(req.body ?? {});
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    try {
      const results = await importAllFromManifest(prisma, undefined, {
        helloaoOnly: parsed.data.helloaoOnly,
        skipHelloao: parsed.data.skipHelloao,
      });
      return { success: true, imported: results.length, results };
    } catch (err) {
      return reply.status(500).send({ error: String(err) });
    }
  });

  /** @deprecated Use /bible/json */
  app.post("/bible", async (req, reply) => {
    const body = req.body as { format?: string; data?: string };
    if (!body.data) return reply.status(400).send({ error: "Campo data obrigatório" });
    try {
      const data = parseJsonFlat(body.data);
      const validation = validateImport(data);
      const persist = await persistBibleImport(prisma, data);
      return { success: true, validation, persist };
    } catch (err) {
      return reply.status(400).send({ error: String(err) });
    }
  });
}
