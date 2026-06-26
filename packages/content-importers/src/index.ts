import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import type { PrismaClient } from "@prisma/client";
import { ChunkingService } from "@mrb/rag-engine";
import {
  isCcelTheologyFormat,
  parseTheologyMarkdown,
  writeTheologyChaptersDir,
  writeTheologyTocFile,
  type TheologyTocFile,
} from "./theology-md.js";
import { isCcelSummaFormat, isNormalizedSummaFormat, parseSummaMarkdown } from "./summa-md.js";
import { parseSectionsMarkdown } from "./confession-md.js";
import { parseStrongsMarkdown, type StrongsMdEntry } from "./strongs-md.js";
import { isSbbStrongsFormat, parseSbbStrongsMarkdown } from "./sbb-strongs-md.js";
import { isKjvStrongsFormat, parseKjvStrongsMarkdown } from "./kjv-strongs-md.js";

export interface RagManifest {
  version: string;
  sourcesDirectory: string;
  processedDirectory?: string;
  chunkDefaults?: { maxChars: number; overlapChars: number };
  sources: Array<{
    type: string;
    file: string;
    enabled: boolean;
    slug?: string;
    format?: string;
    title?: string;
    author?: string;
    tradition?: string;
    language?: string;
    license?: string;
    documentType?: string;
    reliabilityLevel?: string;
  }>;
}

export interface LibraryManifest {
  version: string;
  description?: string;
  sourcesDirectory: string;
  processedDirectory: string;
  books: Array<{
    id: string;
    enabled: boolean;
    title: string;
    subtitle?: string;
    author: string;
    tradition?: string;
    language: string;
    license: string;
    documentType: string;
    format: string;
    sourceFile: string;
    translatedFile?: string;
    description?: string;
    ragImport?: boolean;
  }>;
}

export interface StrongsManifest {
  version: string;
  sourcesDirectory: string;
  sources: Array<{ type: string; file: string; enabled: boolean; description?: string }>;
}

let cachedRepoRoot: string | undefined;

export function getRepoRoot(): string {
  if (cachedRepoRoot) return cachedRepoRoot;

  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, "pnpm-workspace.yaml")) && existsSync(join(dir, "data"))) {
      cachedRepoRoot = dir;
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  cachedRepoRoot = process.cwd();
  return cachedRepoRoot;
}

export async function loadJsonManifest<T>(relativePath: string): Promise<T> {
  const raw = await readFile(join(getRepoRoot(), relativePath), "utf-8");
  return JSON.parse(raw) as T;
}

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

export async function persistStrongsEntries(
  prisma: PrismaClient,
  entries: StrongsMdEntry[],
  source = "strongs-md"
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  const BATCH = 200;

  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);
    for (const e of batch) {
      const existing = await prisma.lexiconEntry.findFirst({
        where: { strongNumber: e.strongNumber },
      });

      const data = {
        language: e.language,
        strongNumber: e.strongNumber,
        lemma: e.lemma,
        transliteration: e.transliteration?.replace(/^[''´`]+|[''´`]+$/g, "") ?? e.transliteration,
        pronunciation: e.pronunciation,
        shortDefinition: e.shortDefinition,
        extendedDefinition: e.extendedDefinition,
        semanticDomain: e.semanticDomain,
        source,
        license: "LICENSE_OK_PUBLIC_DOMAIN",
      };

      if (existing) {
        await prisma.lexiconEntry.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.lexiconEntry.create({ data });
        created++;
      }
    }
  }

  return { created, updated };
}

export async function importStrongsFromFile(
  prisma: PrismaClient,
  filePath: string
): Promise<{ entries: number; created: number; updated: number }> {
  const raw = await readFile(filePath, "utf-8");
  const entries = isKjvStrongsFormat(raw)
    ? parseKjvStrongsMarkdown(raw)
    : isSbbStrongsFormat(raw)
      ? parseSbbStrongsMarkdown(raw)
      : parseStrongsMarkdown(raw);
  if (entries.length === 0) {
    throw new Error(`Nenhuma entrada Strong válida em ${filePath}`);
  }
  const result = await persistStrongsEntries(prisma, entries);
  return { entries: entries.length, ...result };
}

export async function importRagFromFile(
  prisma: PrismaClient,
  filePath: string,
  meta?: Record<string, string>
): Promise<{ documentId: string; chunks: number }> {
  const raw = await readFile(filePath, "utf-8");
  if (meta?.format === "sections") {
    return importSectionsRagFromFile(prisma, filePath, meta);
  }
  if (meta?.format === "ccel-summa" || isCcelSummaFormat(raw) || isNormalizedSummaFormat(raw)) {
    return importTheologyRagFromFile(prisma, filePath, { ...meta, format: "ccel-summa" });
  }
  if (isCcelTheologyFormat(raw)) {
    return importTheologyRagFromFile(prisma, filePath, meta);
  }

  const { meta: fm, body } = parseMarkdownFrontmatter(raw);
  const merged = { ...fm, ...meta };

  const title = merged.title ?? filePath.split(/[/\\]/).pop()?.replace(/\.md$/i, "") ?? "Documento";
  const doc = await prisma.ragDocument.create({
    data: {
      title,
      author: merged.author,
      tradition: merged.tradition,
      language: merged.language ?? "pt-BR",
      license: merged.license ?? "LICENSE_UNKNOWN",
      documentType: merged.documentType ?? "article",
      reliabilityLevel: merged.reliabilityLevel ?? "medium",
      importedBy: "import-rag",
    },
  });

  const chunking = new ChunkingService();
  const chunks = chunking.chunkText(body);
  if (chunks.length > 0) {
    await prisma.ragChunk.createMany({
      data: chunks.map((text, i) => ({
        documentId: doc.id,
        chunkOrder: i,
        chunkText: text,
        doctrineTags: [],
      })),
    });
  }

  return { documentId: doc.id, chunks: chunks.length };
}

async function importSectionsRagFromFile(
  prisma: PrismaClient,
  filePath: string,
  meta?: Record<string, string> & { slug?: string; processedDirectory?: string }
): Promise<{ documentId: string; chunks: number; chapters: number; bookId?: string }> {
  const raw = await readFile(filePath, "utf-8");
  const parsed = parseSectionsMarkdown(raw, meta);
  const title = parsed.meta.title ?? "Confissão";
  const bookId = meta?.slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const processedDir = join(getRepoRoot(), meta?.processedDirectory ?? "data/rag/processed");

  await writeTheologyTocFile(processedDir, bookId, parsed);
  await writeTheologyChaptersDir(processedDir, bookId, parsed.chapters);

  const existing = await prisma.ragDocument.findFirst({
    where: { title, importedBy: "import-rag" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    await prisma.ragChunk.deleteMany({ where: { documentId: existing.id } });
    await prisma.ragDocument.delete({ where: { id: existing.id } });
  }

  const doc = await prisma.ragDocument.create({
    data: {
      title,
      author: parsed.meta.author,
      tradition: parsed.meta.tradition,
      denomination: parsed.meta.denomination,
      language: parsed.meta.language ?? "pt-BR",
      license: parsed.meta.license ?? "LICENSE_OK_PUBLIC_DOMAIN",
      documentType: parsed.meta.documentType ?? "confession",
      reliabilityLevel: parsed.meta.reliabilityLevel ?? "high",
      importedBy: "import-rag",
    },
  });

  const chunking = new ChunkingService();
  const ragChunks: Array<{ documentId: string; chunkOrder: number; chunkText: string; doctrineTags: string[]; citation: string }> = [];
  let order = 0;

  for (const ch of parsed.chapters) {
    const prefix = `${ch.title}\n\n`;
    const parts = chunking.chunkText(ch.content);
    for (const part of parts) {
      ragChunks.push({
        documentId: doc.id,
        chunkOrder: order++,
        chunkText: prefix + part,
        doctrineTags: [ch.title],
        citation: ch.title,
      });
    }
  }

  if (ragChunks.length > 0) {
    const BATCH = 100;
    for (let i = 0; i < ragChunks.length; i += BATCH) {
      await prisma.ragChunk.createMany({ data: ragChunks.slice(i, i + BATCH) });
    }
  }

  return { documentId: doc.id, chunks: ragChunks.length, chapters: parsed.chapters.length, bookId };
}

export async function importTheologyRagFromFile(
  prisma: PrismaClient,
  filePath: string,
  meta?: Record<string, string> & { slug?: string; processedDirectory?: string }
): Promise<{ documentId: string; chunks: number; chapters: number; bookId?: string }> {
  const raw = await readFile(filePath, "utf-8");
  if (!raw.trim()) {
    throw new Error(
      `Arquivo vazio: ${filePath}. Salve o documento no editor (Ctrl+S) antes de importar.`
    );
  }

  const parsed =
    meta?.format === "ccel-summa" || isCcelSummaFormat(raw) || isNormalizedSummaFormat(raw)
      ? parseSummaMarkdown(raw, meta)
      : parseTheologyMarkdown(raw, meta);
  const title = parsed.meta.title ?? "Teologia Sistemática";
  const bookId = meta?.slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const processedDir = join(
    getRepoRoot(),
    meta?.processedDirectory ?? "data/rag/processed"
  );

  await writeTheologyTocFile(processedDir, bookId, parsed);
  await writeTheologyChaptersDir(processedDir, bookId, parsed.chapters);

  const existing = await prisma.ragDocument.findFirst({
    where: { title, importedBy: "import-rag" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    await prisma.ragChunk.deleteMany({ where: { documentId: existing.id } });
    await prisma.ragDocument.delete({ where: { id: existing.id } });
  }

  const doc = await prisma.ragDocument.create({
    data: {
      title,
      author: parsed.meta.author,
      tradition: parsed.meta.tradition,
      language: parsed.meta.language ?? "pt-BR",
      license: parsed.meta.license ?? "LICENSE_OK_PUBLIC_DOMAIN",
      documentType: parsed.meta.documentType ?? "systematic_theology",
      reliabilityLevel: parsed.meta.reliabilityLevel ?? "high",
      importedBy: "import-rag",
    },
  });

  const chunking = new ChunkingService();
  const ragChunks: Array<{ documentId: string; chunkOrder: number; chunkText: string; doctrineTags: string[] }> = [];
  let order = 0;

  for (const ch of parsed.chapters) {
    const prefix = `${ch.bookLabel} — Capítulo ${ch.chapterNumber}: ${ch.title}\n\n`;
    const parts = chunking.chunkText(ch.content);
    for (const part of parts) {
      ragChunks.push({
        documentId: doc.id,
        chunkOrder: order++,
        chunkText: prefix + part,
        doctrineTags: [ch.bookLabel, `cap-${ch.chapterNumber}`],
      });
    }
  }

  if (ragChunks.length > 0) {
    const BATCH = 100;
    for (let i = 0; i < ragChunks.length; i += BATCH) {
      await prisma.ragChunk.createMany({ data: ragChunks.slice(i, i + BATCH) });
    }
  }

  return {
    documentId: doc.id,
    chunks: ragChunks.length,
    chapters: parsed.chapters.length,
    bookId,
  };
}

export async function loadTheologyToc(
  processedDir: string,
  bookId: string
): Promise<TheologyTocFile | null> {
  try {
    const raw = await readFile(join(processedDir, `${bookId}-toc.json`), "utf-8");
    return JSON.parse(raw) as TheologyTocFile;
  } catch {
    return null;
  }
}

export async function loadTheologyChapterContent(
  processedDir: string,
  bookId: string,
  chapterId: string
): Promise<string | null> {
  try {
    return await readFile(join(processedDir, bookId, "chapters", `${chapterId}.md`), "utf-8");
  } catch {
    return null;
  }
}

export { parseSectionsMarkdown } from "./confession-md.js";
export {
  isCcelSummaFormat,
  isNormalizedSummaFormat,
  parseSummaMarkdown,
} from "./summa-md.js";
export {
  isCcelTheologyFormat,
  parseTheologyMarkdown,
  normalizeTheologyFile,
  writeTheologyTocFile,
  writeTheologyChaptersDir,
  type TheologyChapter,
  type TheologyVolume,
  type TheologyParsedDocument,
  type TheologyTocFile,
} from "./theology-md.js";
export { parseStrongsMarkdown, type StrongsMdEntry };
export { parseSbbStrongsMarkdown, isSbbStrongsFormat } from "./sbb-strongs-md.js";
export {
  parseKjvStrongsMarkdown,
  isKjvStrongsFormat,
  exportKjvStrongsToMarkdown,
  exportKjvStrongsToSbbMarkdown,
} from "./kjv-strongs-md.js";
export {
  searchStrongLexicon,
  getStrongDetail,
  getStrongStats,
  normalizeStrongNumber,
  parseStrongQuery,
  type StrongSearchHit,
  type StrongSearchMode,
  type StrongDetailResult,
} from "./strong-search.js";
export {
  importLexiconFromFile,
  searchLexiconChunks,
  scoreLexiconChunk,
  type LexiconManifest,
  type LexiconImportMeta,
} from "./lexicon-import.js";
export { chunkLexiconMarkdown, extractLexiconLemmaHints } from "./lexicon-chunker.js";
export {
  expandPassageSearchQueries,
  parseBibleReference,
  isLexiconNoiseChunk,
} from "./passage-lexicon-query.js";
export { stepBookToOsis, STEP_TO_OSIS } from "./step-book-map.js";
export {
  parseTagntLine,
  tagntLineMatchesFilter,
  type StepTagntToken,
  type TagntFilter,
} from "./tagnt-parser.js";
export { parseTbesgLine, type TbesgEntry } from "./tbesg-parser.js";
export { parseTahotLine, tahotLineMatchesFilter, type StepTahotToken, type TahotFilter } from "./tahot-parser.js";
export { parseTbeshLine, type TbeshEntry } from "./tbesh-parser.js";
export { loadGreekMorphologyMap, expandMorphology } from "./tegmc-parser.js";
export {
  importTagntFromFile,
  importTahotFromFile,
  importTbesgFromFile,
  importTbeshFromFile,
  ensureStepContentLicense,
  resolveStepDataPath,
  STEP_DATA_ROOT,
  STEP_LICENSE,
  type StepImportResult,
  type TbesgImportResult,
  type TbeshImportResult,
} from "./step-import.js";
export {
  getVerseOriginalTokens,
  getOriginalTokenStats,
  getStrongOccurrences,
  getChapterOriginalAvailability,
  getChapterOriginalTokens,
  type ChapterTokensByVerse,
} from "./original-language.js";
export {
  searchMorphology,
  isMorphologyQuery,
  type MorphologySearchHit,
  type MorphologySearchResult,
} from "./morphology-search.js";
