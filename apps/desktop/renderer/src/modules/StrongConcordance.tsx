import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchInput, Button, Card, LoadingState, Badge, EmptyState } from "@mrb/ui-kit";
import { api, type StrongSearchHit, type StrongSearchMode } from "../lib/api";
import { detectWordSearchKind } from "../lib/word-search";
import { useAppStore } from "../store/appStore";
import { usePanelLayout } from "../lib/panel-context";
import { VerseDropZone } from "../components/VerseDropZone";
import { useBibleBooks } from "../hooks/useBibleBooks";

const SEARCH_MODES: Array<{ id: StrongSearchMode; label: string; placeholder: string }> = [
  { id: "all", label: "Tudo", placeholder: "Número, lema, transliteração ou definição..." },
  { id: "number", label: "Número", placeholder: "Ex: G3056, H430, 3056..." },
  { id: "lemma", label: "Lema", placeholder: "Ex: λόγος, אב, logos..." },
  { id: "transliteration", label: "Transliteração", placeholder: "Ex: logos, abad, agape..." },
  { id: "definition", label: "Definição", placeholder: "Ex: palavra, amor, pai..." },
];

function languageBadgeVariant(lang: string): "blue" | "gold" | "rag" {
  if (lang === "greek") return "blue";
  if (lang === "hebrew") return "gold";
  return "rag";
}

function lemmaClass(lang: string): string {
  if (lang === "greek") return "greek greek-text";
  if (lang === "hebrew" || lang === "aramaic") return "hebrew hebrew-text";
  return "";
}

function StrongResultItem({
  hit,
  active,
  onSelect,
}: {
  hit: StrongSearchHit;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`strong-result-item${active ? " strong-result-item--active" : ""}`}
      onClick={onSelect}
    >
      <div className="strong-result-item__head">
        <Badge variant="gold">{hit.strongNumber}</Badge>
        <Badge variant={languageBadgeVariant(hit.language)}>{hit.language}</Badge>
      </div>
      <span className={`strong-result-item__lemma ${lemmaClass(hit.language)}`}>{hit.lemma}</span>
      {hit.transliteration && (
        <span className="strong-result-item__translit">{hit.transliteration}</span>
      )}
      <p className="strong-result-item__def">{hit.shortDefinition}</p>
    </button>
  );
}

function StrongDetailPanel({ number }: { number: string }) {
  const { setLocation, setActiveModule } = useAppStore();
  const { data: books = [] } = useBibleBooks();

  const bookName = (osisId: string) => books.find((b) => b.osisId === osisId)?.namePt ?? osisId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["strong-detail", number],
    queryFn: () => api.getStrong(number),
    enabled: number.length > 0,
  });

  if (isLoading) return <LoadingState message="Carregando entrada..." />;
  if (error) {
    return (
      <p style={{ color: "var(--danger)", fontSize: 13 }}>
        {error instanceof Error ? error.message : "Erro ao carregar"}
      </p>
    );
  }
  if (!data?.lexicon) {
    return (
      <Card>
        <p style={{ color: "var(--text-muted)" }}>Entrada não encontrada para {number}.</p>
      </Card>
    );
  }

  const lexicon = data.lexicon;
  const lang = lexicon.language;

  return (
    <div className="strong-detail">
      <Card className="lexicon-panel">
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <Badge variant="gold">Strong {lexicon.strongNumber}</Badge>
          <Badge variant={languageBadgeVariant(lang)}>{lang}</Badge>
          {data.occurrences > 0 && <Badge variant="rag">{data.occurrences} ocorrências</Badge>}
        </div>

        <div className="lexicon-panel__grid">
          <span className="lexicon-panel__label">Lema</span>
          <span className={lemmaClass(lang)}>{lexicon.lemma}</span>

          {lexicon.transliteration && (
            <>
              <span className="lexicon-panel__label">Transliteração</span>
              <span>{lexicon.transliteration}</span>
            </>
          )}

          <span className="lexicon-panel__label">Definição</span>
          <span>{lexicon.shortDefinition}</span>

          {lexicon.extendedDefinition && (
            <>
              <span className="lexicon-panel__label">Definição estendida</span>
              <span>{lexicon.extendedDefinition}</span>
            </>
          )}

          {lexicon.semanticDomain && (
            <>
              <span className="lexicon-panel__label">Domínio</span>
              <span>{lexicon.semanticDomain}</span>
            </>
          )}
        </div>
      </Card>

      {data.related.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-secondary)" }}>
            Entradas relacionadas
          </h4>
          <div className="strong-related-list">
            {data.related.map((r) => (
              <span key={r.id} className="strong-related-chip">
                <strong>{r.strongNumber}</strong> {r.transliteration ?? r.lemma}
              </span>
            ))}
          </div>
        </Card>
      )}

      {data.tokens.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-secondary)" }}>
            Ocorrências no texto original (STEP)
            {data.occurrences > data.tokens.length && (
              <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                {" "}
                — exibindo {data.tokens.length} de {data.occurrences}
              </span>
            )}
          </h4>
          <ul className="strong-token-list">
            {data.tokens.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="strong-token-list__link"
                  onClick={() => {
                    setLocation(t.bookId, t.chapter);
                    setActiveModule("bible");
                  }}
                  title="Abrir no Leitor"
                >
                  {bookName(t.bookId)} {t.chapter}:{t.verse}
                </button>
                {" — "}
                <span className="greek">{t.surfaceForm}</span>
                {(t.glossPt ?? t.glossEn) ? ` (${t.glossPt ?? t.glossEn})` : ""}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function StrongConcordance() {
  const { isSidePanel } = usePanelLayout();
  const {
    strongVerseRef,
    selectedVerseContext,
    selectedStrongNumber,
    selectedOriginalToken,
    dispatchVerseToModule,
    wordSearchQuery,
    wordSearchSubmitted,
    setWordSearchQuery,
  } = useAppStore();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [mode, setMode] = useState<StrongSearchMode>("all");
  const [selectedNumber, setSelectedNumber] = useState("");
  const activeRef = strongVerseRef ?? selectedVerseContext?.reference ?? "";

  const lookupNumber =
    selectedStrongNumber ?? selectedOriginalToken?.strongNumber?.toUpperCase() ?? null;

  useEffect(() => {
    if (!lookupNumber) return;
    setQuery(lookupNumber);
    setSubmitted(lookupNumber);
    setSelectedNumber(lookupNumber);
    setMode("number");
    setWordSearchQuery(lookupNumber);
  }, [lookupNumber, setWordSearchQuery]);

  useEffect(() => {
    if (lookupNumber || !wordSearchSubmitted) return;
    if (detectWordSearchKind(wordSearchSubmitted) !== "strong") return;
    setQuery(wordSearchSubmitted);
    setSubmitted(wordSearchSubmitted);
    setMode("all");
  }, [wordSearchSubmitted, lookupNumber]);

  const { data: stats } = useQuery({
    queryKey: ["strong-stats"],
    queryFn: () => api.getStrongStats(),
    staleTime: 60_000,
  });

  const { data: searchData, isLoading, error } = useQuery({
    queryKey: ["strong-search", submitted, mode],
    queryFn: () => api.searchStrongs(submitted, { mode, limit: 50 }),
    enabled: submitted.length > 0,
  });

  useEffect(() => {
    const first = searchData?.results[0];
    if (!first) return;

    if (lookupNumber && searchData.results.some((r) => r.strongNumber === lookupNumber)) {
      setSelectedNumber(lookupNumber);
      return;
    }

    if (selectedNumber && searchData.results.some((r) => r.strongNumber === selectedNumber)) {
      return;
    }

    setSelectedNumber(first.strongNumber);
  }, [searchData, selectedNumber, lookupNumber]);

  const activeMode = SEARCH_MODES.find((m) => m.id === mode) ?? SEARCH_MODES[0]!;

  function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmitted(trimmed);
    setWordSearchQuery(trimmed);
    const numMatch = trimmed.match(/^([gh])?(\d+)$/i);
    if (numMatch) {
      const num = `${(numMatch[1] ?? "G").toUpperCase()}${numMatch[2]}`;
      setSelectedNumber(num);
      setMode("number");
    } else {
      setMode("all");
    }
  }

  function selectHit(hit: StrongSearchHit) {
    setSelectedNumber(hit.strongNumber);
  }

  return (
    <div className={`strong-concordance ${isSidePanel ? "strong-concordance--panel" : ""}`}>
      {!isSidePanel && (
        <div className="bible-header">
          <h2>Strong & Concordância</h2>
          <p>
            Pesquisa no léxico Strong importado
            {stats?.indexed
              ? ` — ${stats.total.toLocaleString("pt-BR")} entradas (${stats.hebrew} heb. / ${stats.greek} gr.)`
              : " — importe com pnpm import:strongs --all"}
          </p>
        </div>
      )}

      {isSidePanel && stats?.indexed && (
        <p className="strong-concordance__panel-meta">
          {stats.total.toLocaleString("pt-BR")} entradas · {stats.hebrew} heb. / {stats.greek} gr.
        </p>
      )}

      <VerseDropZone
        label="Arraste versículo para contexto Strong"
        onDrop={(ctx) => dispatchVerseToModule("strong", ctx)}
        compact
      >
        {activeRef && (
          <p className="verse-drop-zone__context">
            Passagem: <strong>{activeRef}</strong>
          </p>
        )}
      </VerseDropZone>

      <div className="strong-search-bar">
        <div className="strong-mode-tabs">
          {SEARCH_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`strong-mode-tab${mode === m.id ? " strong-mode-tab--active" : ""}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={activeMode.placeholder}
            onSubmit={runSearch}
          />
          <Button variant="primary" onClick={runSearch}>
            Buscar
          </Button>
        </div>
      </div>

      {isLoading && <LoadingState message="Pesquisando léxico..." />}
      {error && (
        <p style={{ color: "var(--danger)", fontSize: 13 }}>
          {error instanceof Error ? error.message : "Erro na busca"}
        </p>
      )}

      {searchData && searchData.count === 0 && (
        <Card>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Nenhum resultado para &quot;{searchData.query}&quot;.
            {stats && !stats.indexed && (
              <>
                {" "}
                Execute: <code>pnpm import:strongs --all</code>
              </>
            )}
          </p>
        </Card>
      )}

      {searchData && searchData.count > 0 && (
        <div className="strong-layout">
          <aside className="strong-results">
            <p className="strong-results__meta">
              {searchData.count} resultado(s)
              {selectedNumber && (
                <>
                  {" "}
                  · <strong>{selectedNumber}</strong>
                </>
              )}
            </p>
            <div className="strong-results__list">
              {searchData.results.map((hit) => (
                <StrongResultItem
                  key={hit.id}
                  hit={hit}
                  active={hit.strongNumber === selectedNumber}
                  onSelect={() => selectHit(hit)}
                />
              ))}
            </div>
          </aside>

          <section className="strong-detail-pane">
            {selectedNumber ? (
              <StrongDetailPanel number={selectedNumber} />
            ) : (
              <p className="strong-detail-pane__hint">Selecione uma entrada na lista acima.</p>
            )}
          </section>
        </div>
      )}

      {searchData && searchData.count === 0 && selectedNumber && (
        <div style={{ marginTop: 16 }}>
          <StrongDetailPanel number={selectedNumber} />
        </div>
      )}

      {!submitted && !selectedNumber && (
        <EmptyState
          title="Busque no léxico Strong"
          description="Digite número (G3056, H430), palavra em português/inglês, lema grego/hebraico ou transliteração."
        />
      )}
    </div>
  );
}
