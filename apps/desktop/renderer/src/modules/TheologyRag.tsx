import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Badge, LoadingState, EmptyState, RagSourceCard, SearchInput, Button } from "@mrb/ui-kit";
import { api, type RagSearchResult } from "../lib/api";
import { useAppStore } from "../store/appStore";
import { VerseDropZone } from "../components/VerseDropZone";

export function TheologyRag() {
  const { ragVerseQuery, selectedVerseContext, dispatchVerseToModule } = useAppStore();
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (ragVerseQuery) setQuery(ragVerseQuery);
  }, [ragVerseQuery]);

  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ["rag-documents"],
    queryFn: () => api.getRagDocuments(),
  });

  const { data: status } = useQuery({
    queryKey: ["rag-status"],
    queryFn: () => api.getRagStatus(),
  });

  const runSearch = useCallback(() => {
    const q = query.trim();
    if (q.length < 2) return;
    setActiveQuery(q);
    void queryClient.invalidateQueries({ queryKey: ["rag-search", q] });
  }, [query, queryClient]);

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching,
  } = useQuery({
    queryKey: ["rag-search", activeQuery, selectedVerseContext?.reference],
    queryFn: () =>
      api.searchRag(activeQuery, {
        passage: selectedVerseContext?.reference,
      }),
    enabled: activeQuery.length >= 2,
  });

  const results = searchData?.results ?? [];

  return (
    <div>
      <div className="bible-header">
        <h2>Teologia RAG</h2>
        <p>Consulte confissões e teologia sistemática com citações rastreáveis</p>
      </div>

      {status && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
          {status.documents} documentos · {status.chunks} chunks
          {status.vectorSearchReady ? " · busca vetorial ativa" : " · busca por palavras-chave"}
        </p>
      )}

      <VerseDropZone
        label="Arraste versículo para consulta RAG"
        hint="Gera uma pergunta contextualizada automaticamente"
        onDrop={(ctx) => dispatchVerseToModule("theology-rag", ctx)}
        compact
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Pergunta teológica sobre a passagem..."
          onSubmit={runSearch}
        />
        <Button variant="primary" onClick={runSearch} disabled={query.trim().length < 2}>
          Consultar
        </Button>
      </div>

      {selectedVerseContext && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          Versículo de contexto: {selectedVerseContext.reference}
        </p>
      )}

      {(searchLoading || isFetching) && activeQuery && (
        <LoadingState message="Buscando nas fontes teológicas..." />
      )}

      {!searchLoading && activeQuery && results.length === 0 && (
        <EmptyState
          title="Nenhum trecho encontrado"
          description="Tente reformular a pergunta ou importe mais obras com pnpm import:rag --all"
        />
      )}

      {results.map((r: RagSearchResult) => (
        <RagSourceCard
          key={r.chunkId}
          title={r.title}
          author={r.author}
          tradition={r.tradition}
          excerpt={r.citation ? `${r.citation}\n\n${r.excerpt}` : r.excerpt}
          confidence={r.score}
        />
      ))}

      {docsLoading && <LoadingState />}
      {!activeQuery && !docsLoading && (!docs || docs.length === 0) && (
        <EmptyState title="Biblioteca vazia" description="Importe documentos com pnpm import:rag --all" />
      )}

      {!activeQuery && docs && docs.length > 0 && (
        <>
          <h3 style={{ marginTop: 24, marginBottom: 8, fontSize: 15 }}>Documentos indexados</h3>
          {docs.map((doc) => (
            <Card key={doc.id} style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{doc.title}</strong>
                <Badge variant="rag">{doc._count?.chunks ?? 0} chunks</Badge>
              </div>
              {doc.author && <p style={{ margin: "4px 0", color: "var(--mrb-text-muted)" }}>{doc.author}</p>}
              {doc.tradition && <Badge variant="gold">{doc.tradition}</Badge>}
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
