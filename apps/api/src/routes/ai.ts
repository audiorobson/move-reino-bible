import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { llmGateway, createProviderWithKey, isProviderKeySupported, DEFAULT_MODELS, AI_RESPONSE_MODES, AI_MODE_LABELS, resolveAiMode, isStrictRagMode } from "@mrb/llm-gateway";
import { ragEngine } from "@mrb/rag-engine";
import { prisma } from "../plugins/prisma.js";
import { searchTheologyRagVector, countEmbeddedChunks } from "../services/rag-vector-search.js";
import { buildLocalResearchContext } from "../services/local-research.js";
import type { AiResponseMode } from "@mrb/shared-types";

const aiModeEnum = z.enum(AI_RESPONSE_MODES as [AiResponseMode, ...AiResponseMode[]]);

const chatSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .max(24)
    .optional(),
  mode: aiModeEnum.default("simple"),
  provider: z.string().default("openai"),
  model: z.string().optional(),
  apiKey: z.string().min(8).optional(),
  useRag: z.boolean().default(true),
  localFirst: z.boolean().default(true),
  allowOnline: z.boolean().optional(),
  passage: z.string().optional(),
});

export async function aiRoutes(app: FastifyInstance) {
  app.post("/chat", async (req, reply) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const { message, history, mode, provider, model, apiKey, useRag, localFirst, allowOnline, passage } = parsed.data;
    const resolvedMode = resolveAiMode(mode);
    const strictRagOnly = isStrictRagMode(resolvedMode);
    const effectiveAllowOnline = allowOnline ?? !strictRagOnly;
    let ragContext: string | undefined;
    let citations;

    if (localFirst) {
      const local = await buildLocalResearchContext(prisma, message, {
        includeTheologyRag: useRag,
        passage,
        strictLocalOnly: strictRagOnly,
      });
      ragContext = local.context;
      citations = local.citations;

      if (strictRagOnly && !effectiveAllowOnline && local.localCoverage === "none") {
        ragContext +=
          "\n\n[Instrução] Modo Somente RAG: não há fontes locais relevantes. NÃO complemente com conhecimento geral.";
      }
    } else if (useRag) {
      const docs = await prisma.ragDocument.findMany({ take: 5 });
      if (docs.length > 0) {
        const docMap = new Map(docs.map((d) => [d.id, d]));
        const chunks = await prisma.ragChunk.findMany({
          where: { documentId: { in: docs.map((d) => d.id) } },
          take: 10,
        });
        const stored = chunks.map((c) => ({
          id: c.id,
          documentId: c.documentId,
          text: ragEngine.sanitizeRetrievedContent(c.chunkText),
          order: c.chunkOrder,
        }));
        const results = stored.slice(0, 3).map((chunk) => {
          const doc = docMap.get(chunk.documentId)!;
          return {
            chunk,
            document: {
              id: doc.id,
              title: doc.title,
              author: doc.author ?? undefined,
              tradition: doc.tradition ?? undefined,
              denomination: doc.denomination ?? undefined,
              language: doc.language,
              license: doc.license,
              documentType: doc.documentType,
              reliabilityLevel: doc.reliabilityLevel,
            },
            score: 0.85,
          };
        });
        ragContext = ragEngine.buildContext(results);
        citations = ragEngine.toCitations(results);
      }
    }

    const priorTurns = (history ?? []).slice(-20).map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    }));

    const attachPassage = passage && priorTurns.length === 0;
    const userContent = attachPassage ? `Passagem: ${passage}\n\nPergunta: ${message}` : message;

    const chatInput = {
      model: model ?? DEFAULT_MODELS[provider] ?? "gpt-4o-mini",
      messages: [...priorTurns, { role: "user" as const, content: userContent }],
    };

    try {
      let output;
      if (apiKey && isProviderKeySupported(provider)) {
        const liveProvider = createProviderWithKey(provider, apiKey);
        const messages = llmGateway.buildMessages(
          chatInput.messages,
          resolvedMode,
          ragContext
        );
        output = await liveProvider.chat({
          ...chatInput,
          messages,
        });
      } else if (apiKey) {
        return reply.status(400).send({
          error: `Provedor '${provider}' não suportado com chave. Use OpenAI por enquanto.`,
        });
      } else {
        output = await llmGateway.chat(
          "mock",
          chatInput,
          resolvedMode,
          ragContext
        );
      }

      return { ...llmGateway.attachCitations(output, citations ?? []), mode: resolvedMode };
    } catch (err) {
      return reply.status(500).send({ error: String(err) });
    }
  });

  app.get("/modes", async () => {
    return AI_RESPONSE_MODES.map((id: AiResponseMode) => ({
      id,
      label: AI_MODE_LABELS[id],
    }));
  });
}

export async function ragRoutes(app: FastifyInstance) {
  app.get("/documents", async () => {
    return prisma.ragDocument.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chunks: true } } },
    });
  });

  app.get("/status", async () => {
    const [docs, totalChunks, embeddedChunks] = await Promise.all([
      prisma.ragDocument.count({ where: { documentType: { not: "lexicon" } } }),
      prisma.ragChunk.count({
        where: { document: { documentType: { not: "lexicon" } } },
      }),
      countEmbeddedChunks(prisma),
    ]);
    return {
      documents: docs,
      chunks: totalChunks,
      embeddedChunks,
      vectorSearchReady: embeddedChunks > 0,
    };
  });

  const searchSchema = z.object({
    query: z.string().min(2),
    tradition: z.string().optional(),
    limit: z.number().int().min(1).max(20).optional(),
    apiKey: z.string().min(8).optional(),
  });

  app.post("/search", async (req, reply) => {
    const parsed = searchSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const { query, tradition, limit, apiKey } = parsed.data;
    const results = await searchTheologyRagVector(prisma, query, {
      tradition,
      limit: limit ?? 8,
      apiKey,
    });

    return {
      query,
      count: results.length,
      results: results.map((r) => ({
        chunkId: r.chunk.id,
        documentId: r.document.id,
        title: r.document.title,
        author: r.document.author,
        tradition: r.document.tradition,
        excerpt: r.chunk.text.slice(0, 500),
        citation: r.chunk.citation,
        score: r.score,
      })),
      citations: ragEngine.toCitations(results),
    };
  });

  app.post("/documents", async (req, reply) => {
    const body = req.body as {
      title: string;
      author?: string;
      tradition?: string;
      language: string;
      license: string;
      documentType: string;
      content: string;
    };

    if (!body.title || !body.content || !body.license) {
      return reply.status(400).send({ error: "title, content e license são obrigatórios" });
    }

    const doc = await prisma.ragDocument.create({
      data: {
        title: body.title,
        author: body.author,
        tradition: body.tradition,
        language: body.language ?? "pt-BR",
        license: body.license,
        documentType: body.documentType ?? "comentario",
        reliabilityLevel: "media",
      },
    });

    const chunks = ragEngine.createChunks(doc.id, body.content);
    await prisma.ragChunk.createMany({
      data: chunks.map((c) => ({
        documentId: doc.id,
        chunkText: c.text,
        chunkOrder: c.order,
        doctrineTags: c.doctrineTags ?? [],
      })),
    });

    return { document: doc, chunksCreated: chunks.length };
  });
}
