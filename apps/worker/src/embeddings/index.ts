/** Gera embeddings via OpenAI ou hash local (fallback). */
import {
  generateEmbeddingsBatch,
  localHashEmbedding,
} from "@mrb/rag-engine";

export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  console.log(
    `[worker/embeddings] ${chunks.length} chunks (${hasKey ? "OpenAI" : "hash local"})`
  );
  if (hasKey) {
    return generateEmbeddingsBatch(chunks, { batchSize: 32, delayMs: 200 });
  }
  return chunks.map((c) => localHashEmbedding(c));
}
