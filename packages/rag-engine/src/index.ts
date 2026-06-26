import { RAG_DEFAULTS } from "@mrb/config";
import type { RagDocumentDto, SourceCitation } from "@mrb/shared-types";

export interface RagChunkInput {
  text: string;
  order: number;
  biblicalRefs?: string[];
  doctrineTags?: string[];
  citation?: string;
}

export interface RagChunkStored extends RagChunkInput {
  id: string;
  documentId: string;
  embedding?: number[];
}

export interface RagSearchFilters {
  tradition?: string;
  documentType?: string;
  biblicalRef?: string;
  minScore?: number;
}

export interface RagSearchResult {
  chunk: RagChunkStored;
  document: RagDocumentDto;
  score: number;
}

export class ChunkingService {
  constructor(
    private chunkSize = RAG_DEFAULTS.chunkSizeTokens,
    private overlap = RAG_DEFAULTS.chunkOverlapTokens
  ) {}

  chunkText(text: string): string[] {
    const words = text.split(/\s+/);
    const approxWordsPerChunk = Math.floor(this.chunkSize * 0.75);
    const overlapWords = Math.floor(this.overlap * 0.75);
    const chunks: string[] = [];

    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + approxWordsPerChunk, words.length);
      chunks.push(words.slice(start, end).join(" "));
      if (end >= words.length) break;
      start = end - overlapWords;
    }

    return chunks.filter((c) => c.trim().length > 0);
  }
}

export class RagEngine {
  private chunking = new ChunkingService();

  createChunks(documentId: string, fullText: string): RagChunkInput[] {
    return this.chunking.chunkText(fullText).map((text, order) => ({
      text,
      order,
      doctrineTags: [],
    }));
  }

  buildContext(results: RagSearchResult[]): string {
    return results
      .map((r, i) => {
        const meta = [
          r.document.title,
          r.document.author,
          r.document.tradition,
        ].filter(Boolean).join(" | ");
        return `[Fonte ${i + 1}: ${meta}]\n${r.chunk.text}`;
      })
      .join("\n\n---\n\n");
  }

  toCitations(results: RagSearchResult[]): SourceCitation[] {
    return results.map((r) => ({
      documentId: r.document.id,
      title: r.document.title,
      author: r.document.author,
      tradition: r.document.tradition,
      excerpt: r.chunk.text.slice(0, 300),
      confidence: r.score,
      citation: r.chunk.citation,
    }));
  }

  sanitizeRetrievedContent(text: string): string {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, "[REMOVIDO]")
      .replace(/system\s*:/gi, "fonte:");
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += (a[i] ?? 0) * (b[i] ?? 0);
      normA += (a[i] ?? 0) ** 2;
      normB += (b[i] ?? 0) ** 2;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  rankBySimilarity(
    queryEmbedding: number[],
    chunks: RagChunkStored[],
    documents: Map<string, RagDocumentDto>,
    filters?: RagSearchFilters
  ): RagSearchResult[] {
    const minScore = filters?.minScore ?? RAG_DEFAULTS.minRelevanceScore;

    return chunks
      .filter((c) => c.embedding && c.embedding.length > 0)
      .map((chunk) => {
        const score = this.cosineSimilarity(queryEmbedding, chunk.embedding!);
        const document = documents.get(chunk.documentId)!;
        return { chunk, document, score };
      })
      .filter((r) => {
        if (r.score < minScore) return false;
        if (filters?.tradition && r.document.tradition !== filters.tradition) return false;
        if (filters?.documentType && r.document.documentType !== filters.documentType) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, RAG_DEFAULTS.maxChunksPerQuery);
  }
}

export const ragEngine = new RagEngine();

export {
  generateEmbedding,
  generateEmbeddingsBatch,
  localHashEmbedding,
  vectorToPgLiteral,
  type EmbeddingOptions,
} from "./embeddings.js";
