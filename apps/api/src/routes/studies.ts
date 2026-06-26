import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../plugins/prisma.js";

function asInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

const noteSchema = z.object({
  userId: z.string(),
  bookId: z.string(),
  chapter: z.number(),
  verse: z.number(),
  content: z.string().min(1),
});

const blockSchema = z.object({
  type: z.string().min(1),
  content: z.record(z.unknown()),
  linkedVerses: z.array(z.unknown()).optional(),
  linkedSources: z.array(z.unknown()).optional(),
  aiGenerated: z.boolean().optional(),
  order: z.number().int().optional(),
});

function demoEmailForUserId(requestedId: string): string {
  return requestedId === "demo-user"
    ? "demo@move-reino.bible"
    : `${requestedId}@move-reino.local`;
}

async function findStudyUserId(requestedId: string): Promise<string | null> {
  const existingById = await prisma.user.findUnique({ where: { id: requestedId } });
  if (existingById) return existingById.id;

  const existingByEmail = await prisma.user.findUnique({
    where: { email: demoEmailForUserId(requestedId) },
  });
  return existingByEmail?.id ?? null;
}

async function resolveStudyUserId(requestedId: string): Promise<string> {
  const found = await findStudyUserId(requestedId);
  if (found) return found;

  const created = await prisma.user.create({
    data: {
      id: requestedId,
      email: demoEmailForUserId(requestedId),
      name: "Usuário Demo",
    },
  });
  return created.id;
}

export async function studyRoutes(app: FastifyInstance) {
  app.get("/", async (req) => {
    const userId = (req.query as { userId?: string }).userId;
    if (!userId) return [];
    const resolvedUserId = await findStudyUserId(userId);
    if (!resolvedUserId) return [];
    return prisma.studySession.findMany({
      where: { userId: resolvedUserId },
      include: { blocks: { orderBy: { order: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
  });

  app.get("/notes", async (req) => {
    const userId = (req.query as { userId?: string }).userId;
    if (!userId) return [];
    const resolvedUserId = await findStudyUserId(userId);
    if (!resolvedUserId) return [];
    return prisma.userNote.findMany({ where: { userId: resolvedUserId }, orderBy: { updatedAt: "desc" } });
  });

  app.post("/notes", async (req, reply) => {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const userId = await resolveStudyUserId(parsed.data.userId);
    const existing = await prisma.userNote.findFirst({
      where: {
        userId,
        bookId: parsed.data.bookId,
        chapter: parsed.data.chapter,
        verse: parsed.data.verse,
      },
    });
    if (existing) {
      return prisma.userNote.update({
        where: { id: existing.id },
        data: { content: parsed.data.content },
      });
    }
    return prisma.userNote.create({
      data: {
        userId,
        bookId: parsed.data.bookId,
        chapter: parsed.data.chapter,
        verse: parsed.data.verse,
        content: parsed.data.content,
      },
    });
  });

  app.get("/favorites", async (req) => {
    const userId = (req.query as { userId?: string }).userId;
    if (!userId) return [];
    const resolvedUserId = await findStudyUserId(userId);
    if (!resolvedUserId) return [];
    return prisma.userFavorite.findMany({ where: { userId: resolvedUserId } });
  });

  app.post("/favorites", async (req, reply) => {
    const body = req.body as { userId: string; bookId: string; chapter: number; verse: number };
    if (!body.userId) return reply.status(400).send({ error: "userId obrigatório" });
    const userId = await resolveStudyUserId(body.userId);
    return prisma.userFavorite.upsert({
      where: {
        userId_bookId_chapter_verse: {
          userId,
          bookId: body.bookId,
          chapter: body.chapter,
          verse: body.verse,
        },
      },
      update: {},
      create: {
        userId,
        bookId: body.bookId,
        chapter: body.chapter,
        verse: body.verse,
      },
    });
  });

  app.delete("/favorites", async (req, reply) => {
    const q = req.query as {
      userId?: string;
      bookId?: string;
      chapter?: string;
      verse?: string;
    };
    if (!q.userId || !q.bookId || !q.chapter || !q.verse) {
      return reply.status(400).send({ error: "userId, bookId, chapter e verse são obrigatórios" });
    }
    const userId = await resolveStudyUserId(q.userId);
    try {
      await prisma.userFavorite.delete({
        where: {
          userId_bookId_chapter_verse: {
            userId,
            bookId: q.bookId,
            chapter: Number(q.chapter),
            verse: Number(q.verse),
          },
        },
      });
      return { ok: true };
    } catch {
      return reply.status(404).send({ error: "Favorito não encontrado" });
    }
  });

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const session = await prisma.studySession.findUnique({
      where: { id: req.params.id },
      include: { blocks: { orderBy: { order: "asc" } } },
    });
    if (!session) return reply.status(404).send({ error: "Estudo não encontrado" });
    return session;
  });

  app.post("/", async (req, reply) => {
    const body = req.body as {
      userId: string;
      title: string;
      description?: string;
      passageRange?: string;
      tags?: string[];
    };
    if (!body.userId || !body.title) {
      return reply.status(400).send({ error: "userId e title são obrigatórios" });
    }
    try {
      const userId = await resolveStudyUserId(body.userId);
      return await prisma.studySession.create({
        data: {
          userId,
          title: body.title,
          description: body.description,
          passageRange: body.passageRange,
          tags: body.tags ?? [],
        },
        include: { blocks: true },
      });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({
        error: "Não foi possível criar o estudo. Verifique se a API e o banco estão ativos.",
      });
    }
  });

  app.patch<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const body = req.body as {
      title?: string;
      description?: string;
      passageRange?: string;
      tags?: string[];
    };
    try {
      return await prisma.studySession.update({
        where: { id: req.params.id },
        data: body,
        include: { blocks: { orderBy: { order: "asc" } } },
      });
    } catch {
      return reply.status(404).send({ error: "Estudo não encontrado" });
    }
  });

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    try {
      await prisma.studySession.delete({ where: { id: req.params.id } });
      return { ok: true };
    } catch {
      return reply.status(404).send({ error: "Estudo não encontrado" });
    }
  });

  app.post<{ Params: { id: string } }>("/:id/blocks", async (req, reply) => {
    const parsed = blockSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const session = await prisma.studySession.findUnique({ where: { id: req.params.id } });
    if (!session) return reply.status(404).send({ error: "Estudo não encontrado" });

    const maxOrder = await prisma.studyBlock.aggregate({
      where: { sessionId: session.id },
      _max: { order: true },
    });

    const block = await prisma.studyBlock.create({
      data: {
        sessionId: session.id,
        type: parsed.data.type,
        content: asInputJson(parsed.data.content),
        linkedVerses: parsed.data.linkedVerses
          ? asInputJson(parsed.data.linkedVerses)
          : undefined,
        linkedSources: parsed.data.linkedSources
          ? asInputJson(parsed.data.linkedSources)
          : undefined,
        aiGenerated: parsed.data.aiGenerated ?? false,
        order: parsed.data.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    });

    await prisma.studySession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return block;
  });

  app.patch<{ Params: { id: string; blockId: string } }>(
    "/:id/blocks/:blockId",
    async (req, reply) => {
      const parsed = blockSchema.partial().safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

      try {
        return await prisma.studyBlock.update({
          where: { id: req.params.blockId },
          data: {
            type: parsed.data.type,
            content: parsed.data.content !== undefined ? asInputJson(parsed.data.content) : undefined,
            linkedVerses:
              parsed.data.linkedVerses !== undefined
                ? asInputJson(parsed.data.linkedVerses)
                : undefined,
            linkedSources:
              parsed.data.linkedSources !== undefined
                ? asInputJson(parsed.data.linkedSources)
                : undefined,
            order: parsed.data.order,
          },
        });
      } catch {
        return reply.status(404).send({ error: "Bloco não encontrado" });
      }
    }
  );

  app.delete<{ Params: { id: string; blockId: string } }>(
    "/:id/blocks/:blockId",
    async (req, reply) => {
      try {
        await prisma.studyBlock.delete({ where: { id: req.params.blockId } });
        return { ok: true };
      } catch {
        return reply.status(404).send({ error: "Bloco não encontrado" });
      }
    }
  );
}
