import type { PrismaClient } from "@prisma/client";
import { RAG_DEFAULTS } from "@mrb/config";
import {
  ragEngine,
  generateEmbedding,
  vectorToPgLiteral,
  type RagSearchFilters,
  type RagSearchResult,
} from "@mrb/rag-engine";

export interface RagVectorSearchOptions extends RagSearchFilters {
  limit?: number;
  apiKey?: string;
  documentType?: string;
  tradition?: string;
}

interface VectorRow {
  id: string;
  chunkText: string;
  chunkOrder: number;
  documentId: string;
  citation: string | null;
  score: number;
  docTitle: string;
  docAuthor: string | null;
  docTradition: string | null;
  docDenomination: string | null;
  docLanguage: string;
  docLicense: string;
  docDocumentType: string;
  docReliabilityLevel: string;
}

export async function countEmbeddedChunks(prisma: PrismaClient): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM "RagChunk" WHERE embedding IS NOT NULL
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function searchTheologyRagVector(
  prisma: PrismaClient,
  query: string,
  options?: RagVectorSearchOptions
): Promise<RagSearchResult[]> {
  const limit = options?.limit ?? RAG_DEFAULTS.maxChunksPerQuery;
  const embedded = await countEmbeddedChunks(prisma);

  if (embedded === 0) {
    return searchTheologyRagKeyword(prisma, query, limit, options);
  }

  const queryVec = await generateEmbedding(query, { apiKey: options?.apiKey });
  const vecLiteral = vectorToPgLiteral(queryVec);
  const minScore = options?.minScore ?? 0.25;

  const traditionFilter = options?.tradition
    ? prisma.$queryRawUnsafe<VectorRow[]>(
        `SELECT c.id, c."chunkText", c."chunkOrder", c."documentId", c.citation,
                1 - (c.embedding <=> $1::vector) AS score,
                d.title AS "docTitle", d.author AS "docAuthor", d.tradition AS "docTradition",
                d.denomination AS "docDenomination", d.language AS "docLanguage",
                d.license AS "docLicense", d."documentType" AS "docDocumentType",
                d."reliabilityLevel" AS "docReliabilityLevel"
         FROM "RagChunk" c
         JOIN "RagDocument" d ON d.id = c."documentId"
         WHERE c.embedding IS NOT NULL
           AND d."documentType" != 'lexicon'
           AND d.tradition = $3
         ORDER BY c.embedding <=> $1::vector
         LIMIT $2`,
        vecLiteral,
        limit * 2,
        options.tradition
      )
    : prisma.$queryRawUnsafe<VectorRow[]>(
        `SELECT c.id, c."chunkText", c."chunkOrder", c."documentId", c.citation,
                1 - (c.embedding <=> $1::vector) AS score,
                d.title AS "docTitle", d.author AS "docAuthor", d.tradition AS "docTradition",
                d.denomination AS "docDenomination", d.language AS "docLanguage",
                d.license AS "docLicense", d."documentType" AS "docDocumentType",
                d."reliabilityLevel" AS "docReliabilityLevel"
         FROM "RagChunk" c
         JOIN "RagDocument" d ON d.id = c."documentId"
         WHERE c.embedding IS NOT NULL
           AND d."documentType" != 'lexicon'
         ORDER BY c.embedding <=> $1::vector
         LIMIT $2`,
        vecLiteral,
        limit * 2
      );

  const rows = await traditionFilter;

  return rows
    .filter((r) => Number(r.score) >= minScore)
    .slice(0, limit)
    .map((r) => ({
      chunk: {
        id: r.id,
        documentId: r.documentId,
        text: ragEngine.sanitizeRetrievedContent(r.chunkText),
        order: r.chunkOrder,
        citation: r.citation ?? undefined,
      },
      document: {
        id: r.documentId,
        title: r.docTitle,
        author: r.docAuthor ?? undefined,
        tradition: r.docTradition ?? undefined,
        denomination: r.docDenomination ?? undefined,
        language: r.docLanguage,
        license: r.docLicense,
        documentType: r.docDocumentType,
        reliabilityLevel: r.docReliabilityLevel,
      },
      score: Number(r.score),
    }));
}

function scoreRagChunk(text: string, query: string): number {
  const q = query.toLowerCase().trim();
  const textL = text.toLowerCase();
  const terms = q.split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return 0;
  let hits = 0;
  for (const term of terms) {
    if (textL.includes(term)) hits++;
  }
  return hits / terms.length;
}

async function searchTheologyRagKeyword(
  prisma: PrismaClient,
  query: string,
  limit: number,
  options?: RagVectorSearchOptions
): Promise<RagSearchResult[]> {
  const docs = await prisma.ragDocument.findMany({
    where: {
      documentType: { not: "lexicon" },
      ...(options?.tradition ? { tradition: options.tradition } : {}),
    },
    take: 30,
  });
  if (!docs.length) return [];

  const docMap = new Map(docs.map((d) => [d.id, d]));
  const chunks = await prisma.ragChunk.findMany({
    where: { documentId: { in: docs.map((d) => d.id) } },
    take: 800,
  });

  return chunks
    .map((chunk) => {
      const doc = docMap.get(chunk.documentId)!;
      return {
        chunk: {
          id: chunk.id,
          documentId: chunk.documentId,
          text: ragEngine.sanitizeRetrievedContent(chunk.chunkText),
          order: chunk.chunkOrder,
          citation: chunk.citation ?? undefined,
        },
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
        score: scoreRagChunk(chunk.chunkText, query),
      };
    })
    .filter((r) => r.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
