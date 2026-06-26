import type { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { BibleIndexDocument } from "./meilisearch.js";
import { MeilisearchBibleClient } from "./meilisearch.js";

export interface BibleJsonIndexExport {
  version: {
    id: string;
    abbreviation: string;
    name: string;
    language: string;
  };
  indexedAt: string;
  documentCount: number;
  documents: BibleIndexDocument[];
}

export interface IndexBiblesOptions {
  versions?: string[];
  skipDemo?: boolean;
  exportJsonDir?: string;
  meilisearch?: MeilisearchBibleClient;
  clearMeilisearch?: boolean;
  onProgress?: (msg: string) => void;
}

export interface IndexBiblesResult {
  versions: Array<{
    abbreviation: string;
    documents: number;
    jsonPath?: string;
  }>;
  meilisearchTotal?: number;
  meilisearchStats?: { numberOfDocuments: number };
}

const BATCH_SIZE = 5000;

export async function buildIndexDocuments(
  prisma: PrismaClient,
  versionAbbr: string
): Promise<BibleIndexDocument[]> {
  const version = await prisma.bibleVersion.findFirst({
    where: { abbreviation: versionAbbr },
  });
  if (!version) {
    throw new Error(`Versão '${versionAbbr}' não encontrada`);
  }

  const books = await prisma.bibleBook.findMany();
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const documents: BibleIndexDocument[] = [];
  let cursor: string | undefined;

  for (;;) {
    const verses = await prisma.bibleVerse.findMany({
      where: { versionId: version.id },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
    });
    if (verses.length === 0) break;

    for (const v of verses) {
      const book = bookMap.get(v.bookId);
      if (!book) continue;
      documents.push({
        id: v.id,
        versionId: version.id,
        versionAbbr: version.abbreviation,
        versionName: version.name,
        language: version.language,
        bookId: v.bookId,
        bookOsisId: book.osisId,
        bookNamePt: book.namePt,
        bookNameEn: book.nameEn,
        testament: book.testament,
        bookOrder: book.canonOrder,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        normalizedText: v.normalizedText,
        reference: `${book.namePt} ${v.chapter}:${v.verse}`,
      });
    }

    cursor = verses[verses.length - 1]!.id;
    if (verses.length < BATCH_SIZE) break;
  }

  return documents;
}

export async function exportVersionJsonIndex(
  documents: BibleIndexDocument[],
  version: { id: string; abbreviation: string; name: string; language: string },
  exportDir: string
): Promise<string> {
  await mkdir(exportDir, { recursive: true });
  const payload: BibleJsonIndexExport = {
    version: {
      id: version.id,
      abbreviation: version.abbreviation,
      name: version.name,
      language: version.language,
    },
    indexedAt: new Date().toISOString(),
    documentCount: documents.length,
    documents,
  };
  const filePath = join(exportDir, `${version.abbreviation.toLowerCase()}.json`);
  await writeFile(filePath, JSON.stringify(payload, null, 0), "utf-8");
  return filePath;
}

export async function indexBiblesFromDatabase(
  prisma: PrismaClient,
  options: IndexBiblesOptions = {}
): Promise<IndexBiblesResult> {
  const log = options.onProgress ?? (() => {});
  const skipDemo = options.skipDemo ?? true;
  const exportDir = options.exportJsonDir ?? join(process.cwd(), "data", "bibles", "index");

  let versions = await prisma.bibleVersion.findMany({
    orderBy: { abbreviation: "asc" },
  });

  if (options.versions?.length) {
    const wanted = new Set(options.versions.map((v) => v.toUpperCase()));
    versions = versions.filter((v) => wanted.has(v.abbreviation.toUpperCase()));
  } else if (skipDemo) {
    versions = versions.filter((v) => v.abbreviation !== "DEMO");
  }

  if (versions.length === 0) {
    throw new Error("Nenhuma versão bíblica para indexar");
  }

  const result: IndexBiblesResult = { versions: [] };
  const allDocuments: BibleIndexDocument[] = [];

  for (const version of versions) {
    log(`📖 Montando índice: ${version.abbreviation} (${version.name})...`);
    const documents = await buildIndexDocuments(prisma, version.abbreviation);
    allDocuments.push(...documents);

    log(`💾 Exportando JSON: ${version.abbreviation} (${documents.length} versículos)...`);
    const jsonPath = await exportVersionJsonIndex(documents, version, exportDir);

    result.versions.push({
      abbreviation: version.abbreviation,
      documents: documents.length,
      jsonPath,
    });
    log(`✅ ${version.abbreviation}: ${documents.length} versículos → ${jsonPath}`);
  }

  const manifestPath = join(exportDir, "manifest.json");
  await writeFile(
    manifestPath,
    JSON.stringify(
      {
        indexedAt: new Date().toISOString(),
        versions: result.versions.map((v) => ({
          abbreviation: v.abbreviation,
          documents: v.documents,
          file: `${v.abbreviation.toLowerCase()}.json`,
        })),
        totalDocuments: allDocuments.length,
      },
      null,
      2
    ),
    "utf-8"
  );
  log(`📋 Manifest: ${manifestPath}`);

  if (options.meilisearch) {
    log("\n🔍 Indexando no Meilisearch...");
    const healthy = await options.meilisearch.health();
    if (!healthy) {
      throw new Error("Meilisearch indisponível — verifique MEILISEARCH_URL");
    }

    await options.meilisearch.ensureIndex();
    if (options.clearMeilisearch) {
      log("🗑️  Limpando índice Meilisearch...");
      await options.meilisearch.clearIndex();
    }

    const indexed = await options.meilisearch.addDocuments(allDocuments);
    result.meilisearchTotal = indexed;
    result.meilisearchStats = await options.meilisearch.getStats();
    log(`✅ Meilisearch: ${indexed} documentos indexados`);
  }

  return result;
}
