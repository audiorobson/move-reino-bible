import type { FastifyInstance } from "fastify";
import { prisma } from "../plugins/prisma.js";
import type { BibleChapterDto } from "@mrb/shared-types";

export async function bibleRoutes(app: FastifyInstance) {
  app.get("/versions", async () => {
    return prisma.bibleVersion.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        abbreviation: true,
        language: true,
        isPublicDomain: true,
        attributionRequired: true,
      },
    });
  });

  app.get("/books", async () => {
    const books = await prisma.bibleBook.findMany({
      orderBy: { canonOrder: "asc" },
      include: { _count: { select: { chapters: true } } },
    });
    return books.map((b) => ({
      id: b.id,
      osisId: b.osisId,
      namePt: b.namePt,
      nameEn: b.nameEn,
      testament: b.testament,
      canonOrder: b.canonOrder,
      chapterCount: b._count.chapters,
    }));
  });

  app.get<{ Params: { bookOsisId: string; chapter: string }; Querystring: { version?: string } }>(
    "/chapter/:bookOsisId/:chapter",
    async (req, reply) => {
      const chapterNum = parseInt(req.params.chapter, 10);
      const versionAbbr = req.query.version ?? "BLIVRE";

      const book = await prisma.bibleBook.findUnique({ where: { osisId: req.params.bookOsisId } });
      if (!book) return reply.status(404).send({ error: "Livro não encontrado" });

      const version = await prisma.bibleVersion.findFirst({
        where: { abbreviation: versionAbbr },
      });
      if (!version) return reply.status(404).send({ error: "Versão não encontrada" });

      const verses = await prisma.bibleVerse.findMany({
        where: { versionId: version.id, bookId: book.id, chapter: chapterNum },
        orderBy: { verse: "asc" },
      });

      const result: BibleChapterDto = {
        bookId: book.id,
        bookOsisId: book.osisId,
        bookName: book.namePt,
        chapter: chapterNum,
        verses: verses.map((v) => ({
          id: v.id,
          bookId: v.bookId,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
          versionId: v.versionId,
          versionAbbreviation: version.abbreviation,
        })),
      };

      return result;
    }
  );

  app.get<{ Params: { bookOsisId: string; chapter: string; verse: string } }>(
    "/verse/:bookOsisId/:chapter/:verse",
    async (req, reply) => {
      const book = await prisma.bibleBook.findUnique({ where: { osisId: req.params.bookOsisId } });
      if (!book) return reply.status(404).send({ error: "Livro não encontrado" });

      const version = await prisma.bibleVersion.findFirst({ where: { abbreviation: "DEMO" } });
      if (!version) return reply.status(404).send({ error: "Versão não encontrada" });

      const verse = await prisma.bibleVerse.findFirst({
        where: {
          versionId: version.id,
          bookId: book.id,
          chapter: parseInt(req.params.chapter, 10),
          verse: parseInt(req.params.verse, 10),
        },
      });

      if (!verse) return reply.status(404).send({ error: "Versículo não encontrado" });
      return verse;
    }
  );

  app.get<{ Querystring: { v1?: string; v2?: string; versions?: string; book: string; chapter: string } }>(
    "/parallel",
    async (req) => {
      const { v1, v2, versions, book: bookOsisId, chapter } = req.query;
      const chapterNum = parseInt(chapter, 10);

      const abbrs = versions
        ? versions.split(",").map((v) => v.trim()).filter(Boolean).slice(0, 4)
        : [v1, v2].filter((v): v is string => Boolean(v));

      if (abbrs.length === 0) return { columns: [] };

      const book = await prisma.bibleBook.findUnique({ where: { osisId: bookOsisId } });
      if (!book) return { columns: [] };

      const versionList = await prisma.bibleVersion.findMany({
        where: { abbreviation: { in: abbrs } },
      });

      const versionMap = new Map(versionList.map((v) => [v.abbreviation, v]));
      const ordered = abbrs
        .map((abbr) => versionMap.get(abbr))
        .filter((v): v is NonNullable<typeof v> => Boolean(v));

      const columns = await Promise.all(
        ordered.map(async (version) => {
          const verses = await prisma.bibleVerse.findMany({
            where: { versionId: version.id, bookId: book.id, chapter: chapterNum },
            orderBy: { verse: "asc" },
          });
          return {
            version: { id: version.id, abbreviation: version.abbreviation, name: version.name },
            verses,
          };
        })
      );

      return { book: book.namePt, chapter: chapterNum, columns };
    }
  );
}
