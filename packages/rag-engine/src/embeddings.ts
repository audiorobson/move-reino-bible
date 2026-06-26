import { RAG_DEFAULTS } from "@mrb/config";

const EMBEDDING_MODEL = "text-embedding-3-small";

export interface EmbeddingOptions {
  apiKey?: string;
  model?: string;
  dimensions?: number;
}

export async function generateEmbedding(
  text: string,
  options?: EmbeddingOptions
): Promise<number[]> {
  const trimmed = text.trim().slice(0, 8000);
  if (!trimmed) return new Array(RAG_DEFAULTS.embeddingDimensions).fill(0);

  const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return localHashEmbedding(trimmed, RAG_DEFAULTS.embeddingDimensions);
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options?.model ?? EMBEDDING_MODEL,
      input: trimmed,
      dimensions: options?.dimensions ?? RAG_DEFAULTS.embeddingDimensions,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings falhou (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { data: Array<{ embedding: number[] }> };
  return data.data[0]?.embedding ?? localHashEmbedding(trimmed, RAG_DEFAULTS.embeddingDimensions);
}

export async function generateEmbeddingsBatch(
  texts: string[],
  options?: EmbeddingOptions & { batchSize?: number; delayMs?: number }
): Promise<number[][]> {
  const batchSize = options?.batchSize ?? 32;
  const delayMs = options?.delayMs ?? 150;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const slice = texts.slice(i, i + batchSize);
    const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;

    if (apiKey) {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: options?.model ?? EMBEDDING_MODEL,
          input: slice.map((t) => t.trim().slice(0, 8000)),
          dimensions: options?.dimensions ?? RAG_DEFAULTS.embeddingDimensions,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { data: Array<{ index: number; embedding: number[] }> };
        const sorted = [...data.data].sort((a, b) => a.index - b.index);
        for (const item of sorted) {
          results.push(item.embedding);
        }
        if (delayMs > 0) await sleep(delayMs);
        continue;
      }
    }

    for (const text of slice) {
      results.push(localHashEmbedding(text, RAG_DEFAULTS.embeddingDimensions));
    }
  }

  return results;
}

/** Embedding determinístico local quando não há chave OpenAI (busca aproximada). */
export function localHashEmbedding(text: string, dims = RAG_DEFAULTS.embeddingDimensions): number[] {
  const vec = new Array(dims).fill(0);
  const terms = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\W+/)
    .filter((t) => t.length > 2);

  for (const term of terms) {
    let h = 2166136261;
    for (let i = 0; i < term.length; i++) {
      h ^= term.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = Math.abs(h) % dims;
    vec[idx] = (vec[idx] ?? 0) + 1;
    const idx2 = Math.abs(h >> 8) % dims;
    vec[idx2] = (vec[idx2] ?? 0) + 0.5;
  }

  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function vectorToPgLiteral(vec: number[]): string {
  return `[${vec.map((v) => Number(v.toFixed(8))).join(",")}]`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
