import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { prisma } from "../plugins/prisma.js";
import {
  getRepoRoot,
  loadJsonManifest,
  loadTheologyChapterContent,
  loadTheologyToc,
  parseSummaMarkdown,
  parseSectionsMarkdown,
  parseTheologyMarkdown,
  writeTheologyChaptersDir,
  writeTheologyTocFile,
  type LibraryManifest,
} from "@mrb/content-importers";

const noteSchema = z.object({
  userId: z.string(),
  libraryBookId: z.string(),
  chapterId: z.string(),
  content: z.string().min(1),
  excerpt: z.string().optional(),
});

function demoEmailForUserId(requestedId: string): string {
  return requestedId === "demo-user"
    ? "demo@move-reino.bible"
    : `${requestedId}@move-reino.local`;
}

async function resolveLibraryUserId(requestedId: string): Promise<string> {
  const existingById = await prisma.user.findUnique({ where: { id: requestedId } });
  if (existingById) return existingById.id;

  const existingByEmail = await prisma.user.findUnique({
    where: { email: demoEmailForUserId(requestedId) },
  });
  if (existingByEmail) return existingByEmail.id;

  const created = await prisma.user.create({
    data: {
      id: requestedId,
      email: demoEmailForUserId(requestedId),
      name: "Usuário Demo",
    },
  });
  return created.id;
}

async function resolveBookSourcePath(
  manifest: LibraryManifest,
  book: LibraryManifest["books"][number]
): Promise<string> {
  if (book.translatedFile) {
    const translatedPath = join(getRepoRoot(), manifest.sourcesDirectory, book.translatedFile);
    if (existsSync(translatedPath)) return translatedPath;
  }
  return join(getRepoRoot(), manifest.sourcesDirectory, book.sourceFile);
}

async function parseBookMarkdown(
  book: LibraryManifest["books"][number],
  raw: string
) {
  const meta = {
    title: book.title,
    author: book.author,
    tradition: book.tradition ?? "Batista",
    language: book.language,
    license: book.license,
    documentType: book.documentType,
  };

  if (book.format === "ccel-summa") {
    return parseSummaMarkdown(raw, meta);
  }
  if (book.format === "sections") {
    return parseSectionsMarkdown(raw, meta);
  }
  return parseTheologyMarkdown(raw, meta);
}

async function ensureBookProcessed(
  manifest: LibraryManifest,
  bookId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const book = manifest.books.find((b) => b.id === bookId);
  if (!book) return { ok: false, error: "Livro não encontrado" };

  const processedDir = join(getRepoRoot(), manifest.processedDirectory);
  const sourcePath = await resolveBookSourcePath(manifest, book);
  const tocPath = join(processedDir, `${bookId}-toc.json`);
  const existing = await loadTheologyToc(processedDir, bookId);

  if (existing && existsSync(tocPath) && existsSync(sourcePath)) {
    const [sourceStat, tocStat] = await Promise.all([stat(sourcePath), stat(tocPath)]);
    if (sourceStat.mtimeMs <= tocStat.mtimeMs) {
      return { ok: true };
    }
  } else if (existing) {
    return { ok: true };
  }
  let raw: string;
  try {
    raw = await readFile(sourcePath, "utf-8");
  } catch {
    return { ok: false, error: `Arquivo fonte não encontrado: ${book.sourceFile}` };
  }

  if (!raw.trim()) {
    return {
      ok: false,
      error:
        "O arquivo fonte está vazio no disco. Salve o documento no editor (Ctrl+S) e tente novamente.",
    };
  }

  const parsed = await parseBookMarkdown(book, raw);

  await writeTheologyTocFile(processedDir, bookId, parsed);
  await writeTheologyChaptersDir(processedDir, bookId, parsed.chapters);
  return { ok: true };
}

export async function libraryRoutes(app: FastifyInstance) {
  app.get("/books", async () => {
    const manifest = await loadJsonManifest<LibraryManifest>("data/library/manifest.json");
    return manifest.books
      .filter((b) => b.enabled)
      .map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        author: b.author,
        tradition: b.tradition,
        language: b.language,
        documentType: b.documentType,
        description: b.description,
      }));
  });

  app.get("/books/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const manifest = await loadJsonManifest<LibraryManifest>("data/library/manifest.json");
    const book = manifest.books.find((b) => b.id === id && b.enabled);
    if (!book) return reply.status(404).send({ error: "Livro não encontrado" });

    const ready = await ensureBookProcessed(manifest, id);
    if (!ready.ok) return reply.status(503).send({ error: ready.error });

    const processedDir = join(getRepoRoot(), manifest.processedDirectory);
    const toc = await loadTheologyToc(processedDir, id);

    return {
      ...book,
      chapterCount: toc?.chapterCount ?? 0,
      volumes: toc?.volumes ?? [],
      ready: true,
    };
  });

  app.get("/books/:id/toc", async (req, reply) => {
    const { id } = req.params as { id: string };
    const manifest = await loadJsonManifest<LibraryManifest>("data/library/manifest.json");
    const book = manifest.books.find((b) => b.id === id && b.enabled);
    if (!book) return reply.status(404).send({ error: "Livro não encontrado" });

    const ready = await ensureBookProcessed(manifest, id);
    if (!ready.ok) return reply.status(503).send({ error: ready.error });

    const processedDir = join(getRepoRoot(), manifest.processedDirectory);
    const toc = await loadTheologyToc(processedDir, id);
    if (!toc) return reply.status(503).send({ error: "Índice ainda não processado" });

    return toc;
  });

  app.get("/books/:id/chapters/:chapterId", async (req, reply) => {
    const { id, chapterId } = req.params as { id: string; chapterId: string };
    const manifest = await loadJsonManifest<LibraryManifest>("data/library/manifest.json");
    const book = manifest.books.find((b) => b.id === id && b.enabled);
    if (!book) return reply.status(404).send({ error: "Livro não encontrado" });

    const ready = await ensureBookProcessed(manifest, id);
    if (!ready.ok) return reply.status(503).send({ error: ready.error });

    const processedDir = join(getRepoRoot(), manifest.processedDirectory);
    const content = await loadTheologyChapterContent(processedDir, id, chapterId);
    if (!content) return reply.status(404).send({ error: "Capítulo não encontrado" });

    const toc = await loadTheologyToc(processedDir, id);
    const chapterMeta = toc?.chapters.find((c) => c.id === chapterId);

    return {
      bookId: id,
      chapterId,
      title: chapterMeta?.title ?? chapterId,
      bookLabel: chapterMeta?.bookLabel,
      chapterNumber: chapterMeta?.chapterNumber,
      content,
    };
  });

  app.get("/notes", async (req) => {
    const userId = (req.query as { userId?: string }).userId;
    if (!userId) return [];
    const resolved = await resolveLibraryUserId(userId);
    return prisma.libraryNote.findMany({
      where: { userId: resolved },
      orderBy: { updatedAt: "desc" },
    });
  });

  app.post("/notes", async (req, reply) => {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const userId = await resolveLibraryUserId(parsed.data.userId);
    return prisma.libraryNote.upsert({
      where: {
        userId_libraryBookId_chapterId: {
          userId,
          libraryBookId: parsed.data.libraryBookId,
          chapterId: parsed.data.chapterId,
        },
      },
      update: {
        content: parsed.data.content,
        excerpt: parsed.data.excerpt,
      },
      create: {
        userId,
        libraryBookId: parsed.data.libraryBookId,
        chapterId: parsed.data.chapterId,
        content: parsed.data.content,
        excerpt: parsed.data.excerpt,
      },
    });
  });

  app.delete("/notes/:id", async (req, reply) => {
    try {
      await prisma.libraryNote.delete({ where: { id: (req.params as { id: string }).id } });
      return { ok: true };
    } catch {
      return reply.status(404).send({ error: "Nota não encontrada" });
    }
  });

  app.get("/favorites", async (req) => {
    const userId = (req.query as { userId?: string }).userId;
    if (!userId) return [];
    const resolved = await resolveLibraryUserId(userId);
    return prisma.libraryFavorite.findMany({
      where: { userId: resolved },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post("/favorites", async (req, reply) => {
    const body = req.body as {
      userId: string;
      libraryBookId: string;
      chapterId: string;
      chapterTitle?: string;
    };
    if (!body.userId || !body.libraryBookId || !body.chapterId) {
      return reply.status(400).send({ error: "userId, libraryBookId e chapterId são obrigatórios" });
    }
    const userId = await resolveLibraryUserId(body.userId);
    return prisma.libraryFavorite.upsert({
      where: {
        userId_libraryBookId_chapterId: {
          userId,
          libraryBookId: body.libraryBookId,
          chapterId: body.chapterId,
        },
      },
      update: { chapterTitle: body.chapterTitle },
      create: {
        userId,
        libraryBookId: body.libraryBookId,
        chapterId: body.chapterId,
        chapterTitle: body.chapterTitle,
      },
    });
  });

  app.delete("/favorites", async (req, reply) => {
    const q = req.query as { userId?: string; libraryBookId?: string; chapterId?: string };
    if (!q.userId || !q.libraryBookId || !q.chapterId) {
      return reply.status(400).send({ error: "Parâmetros obrigatórios ausentes" });
    }
    const userId = await resolveLibraryUserId(q.userId);
    try {
      await prisma.libraryFavorite.delete({
        where: {
          userId_libraryBookId_chapterId: {
            userId,
            libraryBookId: q.libraryBookId,
            chapterId: q.chapterId,
          },
        },
      });
      return { ok: true };
    } catch {
      return reply.status(404).send({ error: "Favorito não encontrado" });
    }
  });
}
