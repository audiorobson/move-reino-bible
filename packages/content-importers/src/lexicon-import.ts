import type { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import { ChunkingService } from "@mrb/rag-engine";
import { chunkLexiconMarkdown } from "./lexicon-chunker.js";
import {
  expandPassageSearchQueries,
  isLexiconNoiseChunk,
  parseBibleReference,
} from "./passage-lexicon-query.js";

function parseMarkdownFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1]!.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: match[2]!.trim() };
}

export interface LexiconManifest {
  version: string;
  sourcesDirectory: string;
  indexDirectory?: string;
  sources: Array<{
    type: string;
    file: string;
    enabled: boolean;
    title?: string;
    author?: string;
    language?: string;
    license?: string;
    documentType?: string;
    reliabilityLevel?: string;
    description?: string;
  }>;
}

export interface LexiconImportMeta {
  title: string;
  author?: string;
  language?: string;
  license: string;
  documentType?: string;
  reliabilityLevel?: string;
  sourceKey: string;
}

export async function importLexiconFromFile(
  prisma: PrismaClient,
  filePath: string,
  meta: LexiconImportMeta
): Promise<{ documentId: string; chunks: number; created: boolean }> {
  const raw = await readFile(filePath, "utf-8");
  const { meta: fm, body } = parseMarkdownFrontmatter(raw);
  const content = body || raw;

  const existing = await prisma.ragDocument.findFirst({
    where: { importedBy: meta.sourceKey },
  });

  if (existing) {
    await prisma.ragChunk.deleteMany({ where: { documentId: existing.id } });
    await prisma.ragDocument.update({
      where: { id: existing.id },
      data: {
        title: meta.title,
        author: meta.author ?? fm.author,
        language: meta.language ?? fm.language ?? "en",
        license: meta.license,
        documentType: meta.documentType ?? "lexicon",
        reliabilityLevel: meta.reliabilityLevel ?? "high",
      },
    });

    const chunks = chunkLexiconMarkdown(content);
    if (chunks.length === 0) {
      const fallback = new ChunkingService().chunkText(content);
      await persistChunks(prisma, existing.id, fallback);
      return { documentId: existing.id, chunks: fallback.length, created: false };
    }

    await persistChunks(prisma, existing.id, chunks);
    return { documentId: existing.id, chunks: chunks.length, created: false };
  }

  const doc = await prisma.ragDocument.create({
    data: {
      title: meta.title,
      author: meta.author ?? fm.author ?? "Koehler & Baumgartner",
      language: meta.language ?? fm.language ?? "en",
      license: meta.license,
      documentType: meta.documentType ?? "lexicon",
      reliabilityLevel: meta.reliabilityLevel ?? "high",
      importedBy: meta.sourceKey,
    },
  });

  const chunks = chunkLexiconMarkdown(content);
  const texts = chunks.length > 0 ? chunks : new ChunkingService().chunkText(content);
  await persistChunks(prisma, doc.id, texts);

  return { documentId: doc.id, chunks: texts.length, created: true };
}

async function persistChunks(prisma: PrismaClient, documentId: string, texts: string[]) {
  if (!texts.length) return;
  await prisma.ragChunk.createMany({
    data: texts.map((text, i) => ({
      documentId,
      chunkOrder: i,
      chunkText: text,
      doctrineTags: ["lexicon", "hebrew", "aramaic"],
    })),
  });
}

export function scoreLexiconChunk(text: string, query: string): number {
  if (isLexiconNoiseChunk(text)) return 0;

  const q = query.trim();
  if (!q) return 0;

  const textL = text.toLowerCase();
  let score = 0;

  const ref = parseBibleReference(q);
  if (ref?.verse !== undefined) {
    const book = ref.book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const halotRefRe = new RegExp(
      `(?:^|[\\s,(;])${book}\\s+${ref.chapter}\\s+${ref.verse}(?=\\s|,|\\)|;|\\.|$)`,
      "i"
    );
    if (halotRefRe.test(text)) score = Math.max(score, 0.98);
    const halotChRe = new RegExp(`(?:^|[\\s,(])${book}\\s+${ref.chapter}(?:\\s|,|\\)|;|\\.|:)`, "i");
    if (halotChRe.test(text)) score = Math.max(score, 0.6);
  }

  const terms = q.split(/\s+/).filter((t) => t.length > 2 || /^[HhG]\d+$/.test(t));
  if (terms.length) {
    let hits = 0;
    for (const term of terms) {
      const t = term.toLowerCase();
      if (t.length <= 3 && !/^[hg]\d+$/i.test(term)) continue;
      if (textL.includes(t)) hits += 1;
    }
    if (hits > 0) score = Math.max(score, hits / terms.length);
  }

  if (/^gn\s+\d+\s+\d+$/i.test(q) && score < 0.5) return 0;

  return score;
}

export async function searchLexiconChunks(
  prisma: PrismaClient,
  query: string,
  options?: { limit?: number; queries?: string[] }
) {
  const limit = options?.limit ?? 6;
  const searchQueries = options?.queries?.length
    ? options.queries
    : expandPassageSearchQueries(undefined, query);

  const merged = new Map<string, Awaited<ReturnType<typeof searchLexiconChunksSingle>>[0]>();

  for (const q of searchQueries) {
    const hits = await searchLexiconChunksSingle(prisma, q, limit * 2);
    for (const hit of hits) {
      const prev = merged.get(hit.chunk.id);
      if (!prev || hit.score > prev.score) merged.set(hit.chunk.id, hit);
    }
  }

  return [...merged.values()]
    .filter((r) => r.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function searchLexiconChunksSingle(
  prisma: PrismaClient,
  query: string,
  take: number
) {
  const docs = await prisma.ragDocument.findMany({
    where: { documentType: "lexicon" },
    select: { id: true, title: true, author: true, language: true, license: true, documentType: true, reliabilityLevel: true, tradition: true, denomination: true },
  });

  if (!docs.length) return [];

  const docMap = new Map(docs.map((d) => [d.id, d]));
  const chunks = await prisma.ragChunk.findMany({
    where: { documentId: { in: docs.map((d) => d.id) } },
    take: 2000,
    orderBy: { chunkOrder: "asc" },
  });

  return chunks
    .map((chunk) => ({
      chunk: {
        id: chunk.id,
        documentId: chunk.documentId,
        text: chunk.chunkText,
        order: chunk.chunkOrder,
      },
      document: {
        id: docMap.get(chunk.documentId)!.id,
        title: docMap.get(chunk.documentId)!.title,
        author: docMap.get(chunk.documentId)!.author ?? undefined,
        tradition: docMap.get(chunk.documentId)!.tradition ?? undefined,
        denomination: docMap.get(chunk.documentId)!.denomination ?? undefined,
        language: docMap.get(chunk.documentId)!.language,
        license: docMap.get(chunk.documentId)!.license,
        documentType: docMap.get(chunk.documentId)!.documentType,
        reliabilityLevel: docMap.get(chunk.documentId)!.reliabilityLevel,
      },
      score: scoreLexiconChunk(chunk.chunkText, query),
    }))
    .filter((r) => r.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, take);
}
