import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchInput, LoadingState, ErrorState, Button, Badge, Card, EmptyState } from "@mrb/ui-kit";
import { api, type StrongSearchHit, type MorphologySearchHit } from "../lib/api";
import { useAppStore } from "../store/appStore";
import { VerseDropZone } from "../components/VerseDropZone";
import { useBibleBooks } from "../hooks/useBibleBooks";
import {
  detectWordSearchKind,
  resolveSearchScopes,
  type WordSearchScope,
} from "../lib/word-search";

const SEARCH_SCOPES: Array<{ id: WordSearchScope; label: string; hint: string }> = [
  { id: "auto", label: "Automático", hint: "Detecta PT, EN, Strong ou morfologia" },
  { id: "bible_pt", label: "Bíblia PT", hint: "Bíblia Livre (português)" },
  { id: "bible_en", label: "Bíblia EN", hint: "King James (inglês)" },
  { id: "strong", label: "Strong", hint: "Número, lema ou definição" },
  { id: "morphology", label: "Morfologia", hint: "Código grego/hebraico (ex.: V-PAI-3S, HR/Ncfsa)" },
];

function StrongHitCard({
  hit,
  onSelect,
}: {
  hit: StrongSearchHit;
  onSelect: (number: string) => void;
}) {
  return (
    <button type="button" className="word-search-strong-hit" onClick={() => onSelect(hit.strongNumber)}>
      <div className="word-search-strong-hit__head">
        <Badge variant="gold">{hit.strongNumber}</Badge>
        <Badge variant="blue">{hit.language}</Badge>
      </div>
      <span className="word-search-strong-hit__lemma">{hit.lemma}</span>
      {hit.transliteration && <span className="word-search-strong-hit__translit">{hit.transliteration}</span>}
      <p className="word-search-strong-hit__def">{hit.shortDefinition}</p>
    </button>
  );
}

function MorphHitCard({
  hit,
  bookName,
  onOpen,
}: {
  hit: MorphologySearchHit;
  bookName: string;
  onOpen: () => void;
}) {
  return (
    <button type="button" className="word-search-morph-hit" onClick={onOpen}>
      <div className="word-search-morph-hit__head">
        <Badge variant="gold">{hit.morphologyCode ?? "—"}</Badge>
        <Badge variant="blue">{hit.testament}</Badge>
        {hit.strongNumber && <Badge variant="rag">{hit.strongNumber}</Badge>}
      </div>
      <strong className="word-search-morph-hit__ref">
        {bookName} {hit.chapter}:{hit.verse}
      </strong>
      <span className="word-search-morph-hit__surface">{hit.surfaceForm}</span>
      {(hit.glossPt ?? hit.glossEn) && (
        <p className="word-search-morph-hit__gloss">{hit.glossPt ?? hit.glossEn}</p>
      )}
      {hit.morphologyExpanded && hit.morphologyExpanded !== hit.morphologyCode && (
        <p className="word-search-morph-hit__expanded">{hit.morphologyExpanded}</p>
      )}
    </button>
  );
}

export function SearchLab() {
  const {
    setLocation,
    setActiveModule,
    dispatchVerseToModule,
    openStrongLookup,
    wordSearchQuery,
    wordSearchSubmitted,
    setWordSearchQuery,
  } = useAppStore();

  const { data: books = [] } = useBibleBooks();
  const bookName = (osisId: string) => books.find((b) => b.osisId === osisId)?.namePt ?? osisId;

  const [query, setQuery] = useState(wordSearchQuery);
  const [submitted, setSubmitted] = useState(wordSearchSubmitted);
  const [scope, setScope] = useState<WordSearchScope>("auto");

  useEffect(() => {
    setQuery(wordSearchQuery);
    setSubmitted(wordSearchSubmitted);
  }, [wordSearchQuery, wordSearchSubmitted]);

  const scopes = submitted ? resolveSearchScopes(submitted, scope) : null;
  const detectedKind = submitted ? detectWordSearchKind(submitted) : null;

  const biblePtQuery = useQuery({
    queryKey: ["search", "pt", submitted, scopes?.bibleMode],
    queryFn: () => api.search(submitted, scopes!.bibleMode, "BLIVRE"),
    enabled: Boolean(submitted && scopes?.biblePt),
  });

  const bibleEnQuery = useQuery({
    queryKey: ["search", "en", submitted, scopes?.bibleMode],
    queryFn: () => api.search(submitted, scopes!.bibleMode, "KJV"),
    enabled: Boolean(submitted && scopes?.bibleEn),
  });

  const strongQuery = useQuery({
    queryKey: ["search", "strong", submitted, scope],
    queryFn: () => api.searchStrongs(submitted, { mode: "all", limit: 30 }),
    enabled: Boolean(submitted && scopes?.strong),
  });

  const morphologyQuery = useQuery({
    queryKey: ["search", "morphology", submitted, scope],
    queryFn: () => api.searchMorphology(submitted, { limit: 40 }),
    enabled: Boolean(submitted && scopes?.morphology),
  });

  const isLoading =
    biblePtQuery.isLoading || bibleEnQuery.isLoading || strongQuery.isLoading || morphologyQuery.isLoading;
  const error = biblePtQuery.error ?? bibleEnQuery.error ?? strongQuery.error ?? morphologyQuery.error;

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmitted(trimmed);
    setWordSearchQuery(trimmed);
  };

  const openVerse = (bookOsisId: string, chapter: number, verse: number) => {
    setLocation(bookOsisId, chapter);
    setActiveModule("bible");
    void verse;
  };

  const ptResults = biblePtQuery.data?.results ?? [];
  const enResults = bibleEnQuery.data?.results ?? [];
  const strongResults = strongQuery.data?.results ?? [];
  const morphResults = morphologyQuery.data?.results ?? [];
  const totalResults = ptResults.length + enResults.length + strongResults.length + morphResults.length;

  return (
    <div className="word-search-lab">
      <div className="bible-header">
        <h2>Buscar palavra</h2>
        <p>
          Pesquise em português, inglês, Strong (G3056), morfologia (V-PAI-3S, HR/Ncfsa) ou referência (João 3:16)
        </p>
      </div>

      <VerseDropZone
        label="Arraste versículo para buscar"
        hint="Usa o texto do versículo como consulta"
        onDrop={(ctx) => {
          dispatchVerseToModule("search", ctx);
          setQuery(ctx.text);
          setSubmitted(ctx.text);
          setWordSearchQuery(ctx.text);
        }}
        compact
      />

      <div className="word-search-lab__bar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Ex: amor, G3056, V-PAI-3S, HR/Ncfsa, João 3:16..."
          onSubmit={handleSearch}
        />
        <Button variant="primary" onClick={handleSearch}>
          Buscar
        </Button>
      </div>

      <div className="word-search-lab__scopes">
        {SEARCH_SCOPES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`word-search-scope${scope === s.id ? " word-search-scope--active" : ""}`}
            title={s.hint}
            onClick={() => setScope(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {submitted && detectedKind && (
        <p className="word-search-lab__detected">
          Consulta: <strong>{submitted}</strong>
          {detectedKind === "strong" && <Badge variant="gold">Strong</Badge>}
          {detectedKind === "reference" && <Badge variant="blue">Referência</Badge>}
          {detectedKind === "morphology" && <Badge variant="ai">Morfologia</Badge>}
          {detectedKind === "bible" && <Badge variant="rag">Palavra</Badge>}
        </p>
      )}

      {isLoading && <LoadingState message="Pesquisando..." />}
      {error && <ErrorState message={error instanceof Error ? error.message : "Erro na busca"} />}

      {!isLoading && submitted && totalResults === 0 && (
        <EmptyState
          title="Nenhum resultado"
          description={`Não encontramos resultados para "${submitted}". Tente outro termo, modo Strong ou versão da Bíblia.`}
        />
      )}

      {submitted && strongResults.length > 0 && (
        <section className="word-search-section">
          <h3 className="word-search-section__title">
            Strong & Concordância <Badge variant="gold">{strongResults.length}</Badge>
          </h3>
          <div className="word-search-strong-list">
            {strongResults.map((hit) => (
              <StrongHitCard key={hit.id} hit={hit} onSelect={openStrongLookup} />
            ))}
          </div>
        </section>
      )}

      {submitted && morphResults.length > 0 && (
        <section className="word-search-section">
          <h3 className="word-search-section__title">
            Morfologia (STEP) <Badge variant="ai">{morphResults.length}</Badge>
          </h3>
          <div className="word-search-morph-list">
            {morphResults.map((hit) => (
              <MorphHitCard
                key={hit.id}
                hit={hit}
                bookName={bookName(hit.bookId)}
                onOpen={() => openVerse(hit.bookId, hit.chapter, hit.verse)}
              />
            ))}
          </div>
        </section>
      )}

      {submitted && ptResults.length > 0 && (
        <section className="word-search-section">
          <h3 className="word-search-section__title">
            Bíblia em português (BLIVRE) <Badge variant="blue">{ptResults.length}</Badge>
          </h3>
          <div className="search-results">
            {ptResults.map((r, i) => {
              const verse = r.verse as { bookOsisId?: string; bookId: string; chapter: number; verse: number; text: string };
              const book = verse.bookOsisId ?? verse.bookId;
              return (
                <Card
                  key={`pt-${i}`}
                  className="search-result-item"
                  onClick={() => openVerse(book, verse.chapter, verse.verse)}
                >
                  <strong className="search-result-item__ref">
                    {r.bookName} {verse.chapter}:{verse.verse}
                  </strong>
                  <p>{verse.text}</p>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {submitted && enResults.length > 0 && (
        <section className="word-search-section">
          <h3 className="word-search-section__title">
            Bíblia em inglês (KJV) <Badge variant="rag">{enResults.length}</Badge>
          </h3>
          <div className="search-results">
            {enResults.map((r, i) => {
              const verse = r.verse as { bookOsisId?: string; bookId: string; chapter: number; verse: number; text: string };
              const book = verse.bookOsisId ?? verse.bookId;
              return (
                <Card
                  key={`en-${i}`}
                  className="search-result-item"
                  onClick={() => openVerse(book, verse.chapter, verse.verse)}
                >
                  <strong className="search-result-item__ref">
                    {r.bookName} {verse.chapter}:{verse.verse}
                  </strong>
                  <p>{verse.text}</p>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {!submitted && (
        <EmptyState
          title="Pesquisa por palavra"
          description="Digite no campo acima ou use a barra superior. Suporta português, inglês, Strong e referências."
        />
      )}
    </div>
  );
}
