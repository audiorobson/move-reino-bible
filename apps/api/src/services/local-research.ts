import type { PrismaClient } from "@prisma/client";
import { ragEngine, type RagSearchResult } from "@mrb/rag-engine";
import {
  searchStrongLexicon,
  searchLexiconChunks,
  expandPassageSearchQueries,
  type StrongSearchHit,
} from "@mrb/content-importers";
import type { SourceCitation } from "@mrb/shared-types";
import { searchTheologyRagVector } from "./rag-vector-search.js";

export interface LocalResearchResult {
  context: string;
  citations: SourceCitation[];
  sourcesFound: {
    lexicon: number;
    strong: number;
    rag: number;
  };
  localCoverage: "high" | "partial" | "none";
  strongHits: StrongSearchHit[];
}


export async function buildLocalResearchContext(
  prisma: PrismaClient,
  query: string,
  options?: { includeTheologyRag?: boolean; passage?: string; strictLocalOnly?: boolean }
): Promise<LocalResearchResult> {
  const lexiconQueries = expandPassageSearchQueries(options?.passage, query);
  const strongQuery = lexiconQueries.join(" ") || query;

  const [lexiconResults, strongSearch, ragResults] = await Promise.all([
    searchLexiconChunks(prisma, query, { limit: 6, queries: lexiconQueries }),
    searchStrongLexicon(prisma, strongQuery, { limit: 6 }),
    options?.includeTheologyRag !== false
      ? searchTheologyRagVector(prisma, `${options?.passage ?? ""} ${query}`.trim(), { limit: 6 })
      : Promise.resolve([]),
  ]);

  const maxLexiconScore = lexiconResults[0]?.score ?? 0;
  const maxStrongScore = strongSearch.results[0]?.score ?? 0;
  const relevantLocal =
    maxLexiconScore >= 0.5 ||
    maxStrongScore >= 0.85 ||
    (maxLexiconScore >= 0.35 && lexiconResults.some((r) => /gn 1 1/i.test(r.chunk.text)));

  const sections: string[] = [];
  const allRagResults: RagSearchResult[] = [];

  if (lexiconResults.length > 0) {
    sections.push("=== LÉXICO LOCAL (HALOT e afins) ===");
    for (const r of lexiconResults) {
      sections.push(`[${r.document.title} | score ${r.score.toFixed(2)}]\n${r.chunk.text.slice(0, 1400)}`);
      allRagResults.push(r);
    }
  }

  if (strongSearch.results.length > 0) {
    sections.push("=== STRONG'S LOCAL ===");
    for (const s of strongSearch.results) {
      sections.push(
        `[${s.strongNumber} | ${s.language} | ${s.transliteration ?? s.lemma}]\n${s.shortDefinition}${s.extendedDefinition ? `\n${s.extendedDefinition.slice(0, 500)}` : ""}`
      );
    }
  }

  if (ragResults.length > 0) {
    sections.push("=== RAG TEOLÓGICO LOCAL ===");
    sections.push(ragEngine.buildContext(ragResults));
    allRagResults.push(...ragResults);
  }

  const totalSources = lexiconResults.length + strongSearch.results.length + ragResults.length;
  const localCoverage: LocalResearchResult["localCoverage"] = relevantLocal
    ? totalSources >= 3
      ? "high"
      : "partial"
    : totalSources > 0
      ? "partial"
      : "none";

  const strongCitations: SourceCitation[] = strongSearch.results.map((s) => ({
    documentId: s.id,
    title: `Strong's ${s.strongNumber}`,
    author: "Léxico local",
    excerpt: `${s.lemma} — ${s.shortDefinition}`.slice(0, 300),
    confidence: s.score,
  }));

  const ragCitations = ragEngine.toCitations(allRagResults);

  const strictLocalOnly = options?.strictLocalOnly ?? false;

  let context = sections.length
    ? `--- FONTES LOCAIS RECUPERADAS (dados indexados no software) ---\n\n${sections.join("\n\n---\n\n")}`
    : "(Nenhuma fonte local relevante encontrada para esta consulta nos arquivos indexados.)";

  if (strictLocalOnly && !relevantLocal) {
    context +=
      "\n\n[INSTRUÇÃO — MODO SOMENTE RAG] As fontes acima NÃO são suficientes. NÃO use conhecimento geral do modelo. Informe que não encontrou nos arquivos locais e sugira reformular com lema hebraico ou número Strong.";
  } else if (!strictLocalOnly && !relevantLocal) {
    context +=
      "\n\n[NOTA] Cobertura local limitada ou irrelevante para esta pergunta. Complemente com conhecimento do modelo, indicando claramente o que não estava nas fontes locais.";
  } else if (!strictLocalOnly && localCoverage === "partial") {
    context +=
      "\n\n[NOTA] Cobertura local parcial. Use as fontes acima como base e complemente com conhecimento do modelo onde necessário, citando o que é local vs. complemento.";
  }

  return {
    context,
    citations: [...strongCitations, ...ragCitations],
    sourcesFound: {
      lexicon: lexiconResults.length,
      strong: strongSearch.results.length,
      rag: ragResults.length,
    },
    localCoverage,
    strongHits: strongSearch.results,
  };
}
