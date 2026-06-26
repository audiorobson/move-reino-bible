#!/usr/bin/env tsx
/**
 * Gera embeddings pgvector para chunks RAG sem vetor.
 *
 * pnpm embed:rag
 * pnpm embed:rag --limit 500
 * pnpm embed:rag --document-id <cuid>
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { generateEmbeddingsBatch, vectorToPgLiteral } from "@mrb/rag-engine";

function loadEnvFile() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();
const prisma = new PrismaClient();

async function ensureVectorIndex() {
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS rag_chunk_embedding_idx
    ON "RagChunk" USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)
  `).catch(() => {
    /* índice opcional — falha se poucos vetores */
  });
}

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const docIdx = args.indexOf("--document-id");
  const limit = limitIdx !== -1 ? Number(args[limitIdx + 1]) : undefined;
  const documentId = docIdx !== -1 ? args[docIdx + 1] : undefined;

  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  console.log(`🔢 Move Reino Bible — Embeddings RAG (${hasOpenAi ? "OpenAI" : "hash local"})\n`);

  const whereClause = documentId
    ? `AND c."documentId" = '${documentId}'`
    : "";

  const pending = await prisma.$queryRawUnsafe<Array<{ id: string; chunkText: string }>>(
    `SELECT c.id, c."chunkText"
     FROM "RagChunk" c
     WHERE c.embedding IS NULL ${whereClause}
     ORDER BY c."createdAt" ASC
     ${limit ? `LIMIT ${limit}` : ""}`
  );

  if (!pending.length) {
    console.log("✅ Todos os chunks já possuem embedding.");
    return;
  }

  console.log(`📦 ${pending.length} chunks pendentes...`);

  const BATCH = 32;
  let done = 0;

  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const embeddings = await generateEmbeddingsBatch(
      batch.map((c) => c.chunkText),
      { batchSize: BATCH, delayMs: hasOpenAi ? 200 : 0 }
    );

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j]!;
      const vec = embeddings[j]!;
      const literal = vectorToPgLiteral(vec);
      await prisma.$executeRawUnsafe(
        `UPDATE "RagChunk" SET embedding = $1::vector WHERE id = $2`,
        literal,
        chunk.id
      );
      done++;
    }

    if (done % 64 === 0 || done === pending.length) {
      console.log(`   ✅ ${done}/${pending.length}`);
    }
  }

  await ensureVectorIndex();
  console.log(`\n✅ Embeddings gerados: ${done}`);
}

main()
  .catch((err) => {
    console.error("Erro:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
