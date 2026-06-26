import { useQuery } from "@tanstack/react-query";
import { Card, Badge, LoadingState, EmptyState, Button } from "@mrb/ui-kit";
import { useAppStore } from "../store/appStore";
import { VerseDropZone } from "../components/VerseDropZone";
import { api } from "../lib/api";
import { InterlinearTokenDetail } from "../components/InterlinearTokenDetail";
import { VerseInterlinearStrip } from "../components/VerseInterlinearStrip";
import {
  detectOriginalScript,
  originalScriptClass,
  originalScriptLabel,
  originalDatasetLabel,
  tokenGlossPt,
} from "../lib/original-language";

export function OriginalLanguages() {
  const {
    selectedVerseContext,
    selectedOriginalToken,
    dispatchVerseToModule,
    setSelectedOriginalToken,
    setActiveModule,
    openStrongLookup,
  } = useAppStore();

  const ctx = selectedVerseContext;
  const ref = ctx?.reference ?? "Selecione um versículo";

  const { data: verseData, isLoading } = useQuery({
    queryKey: ["verse-tokens", ctx?.bookOsisId, ctx?.chapter, ctx?.verse],
    queryFn: () => api.getVerseTokens(ctx!.bookOsisId, ctx!.chapter, ctx!.verse),
    enabled: !!ctx?.bookOsisId && !!ctx?.chapter && !!ctx?.verse,
  });

  const activeToken =
    selectedOriginalToken ??
    verseData?.tokens[0] ??
    null;

  const script = verseData?.tokens.length
    ? detectOriginalScript(verseData.tokens, ctx?.bookOsisId)
    : "greek";
  const scriptLabel = originalScriptLabel(script);
  const dataset = originalDatasetLabel(script);

  return (
    <div>
      <div className="bible-header">
        <h2>Idiomas Originais</h2>
        <p>Análise lexical inspirada no STEPBible — TAGNT / TAHOT (CC BY 4.0)</p>
      </div>

      <VerseDropZone
        label="Arraste versículo para análise original"
        hint="Ou clique no número do versículo no Leitor"
        onDrop={(c) => dispatchVerseToModule("originals", c)}
        compact
      >
        {ctx && (
          <p className="verse-drop-zone__context">
            <strong>{ctx.reference}</strong> — "{ctx.text}"
          </p>
        )}
      </VerseDropZone>

      {!ctx ? (
        <EmptyState
          title="Nenhum versículo selecionado"
          description="Abra o Leitor e clique no número do versículo para ver o vocabulário original."
        />
      ) : isLoading ? (
        <LoadingState message="Carregando texto original..." />
      ) : !verseData?.tokens.length ? (
        <EmptyState
          title="Sem tokens para esta passagem"
          description="Execute: pnpm import:step --sample-gen1 ou --sample-john1"
        />
      ) : (
        <>
          <div className="parallel-grid">
            <Card>
              <Badge variant="gold">{scriptLabel} · STEP {dataset}</Badge>
              {verseData.tokens.length > 0 && (
                <VerseInterlinearStrip
                  tokens={verseData.tokens}
                  script={script}
                  selectedTokenId={activeToken?.id}
                  onSelectToken={setSelectedOriginalToken}
                />
              )}
              <p style={{ color: "var(--mrb-text-muted)", marginTop: 8 }}>
                {ref} — {verseData.source ?? dataset}
              </p>
            </Card>
          </div>

          <div className="verse-vocab-popover__list" style={{ marginTop: 16, marginBottom: 16 }}>
            {verseData.tokens.map((token) => (
              <button
                key={token.id}
                type="button"
                className={`verse-vocab-popover__item ${activeToken?.id === token.id ? "verse-vocab-popover__item--active" : ""}`}
                onClick={() => setSelectedOriginalToken(token)}
              >
                <InterlinearTokenDetail token={token} script={script} compact />
              </button>
            ))}
          </div>

          {activeToken && (
            <Card className="lexicon-panel">
              <h3 style={{ margin: "0 0 12px", color: "var(--mrb-accent)" }}>Palavra selecionada</h3>
              <InterlinearTokenDetail token={activeToken} script={script} />
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px 16px", fontSize: 14, marginTop: 16 }}>
                <span style={{ color: "var(--mrb-text-muted)" }}>Passagem</span>
                <span>{ref}</span>
                {activeToken.lemma && (
                  <>
                    <span style={{ color: "var(--mrb-text-muted)" }}>Lema</span>
                    <span className={originalScriptClass(script)}>{activeToken.lemma}</span>
                  </>
                )}
                {activeToken.morphologyCode && (
                  <>
                    <span style={{ color: "var(--mrb-text-muted)" }}>Morfologia</span>
                    <span>{activeToken.morphologyCode}</span>
                  </>
                )}
                {activeToken.morphologyExpanded && (
                  <>
                    <span style={{ color: "var(--mrb-text-muted)" }}>Gramática (EN)</span>
                    <span style={{ fontSize: 13 }}>{activeToken.morphologyExpanded}</span>
                  </>
                )}
                {activeToken.glossEn && (
                  <>
                    <span style={{ color: "var(--mrb-text-muted)" }}>Gloss léxico (EN)</span>
                    <span style={{ fontStyle: "italic" }}>{activeToken.glossEn}</span>
                  </>
                )}
                {(() => {
                  const pt = tokenGlossPt(activeToken);
                  return pt && pt !== activeToken.glossEn ? (
                    <>
                      <span style={{ color: "var(--mrb-text-muted)" }}>Gloss (PT)</span>
                      <span>{pt}</span>
                    </>
                  ) : null;
                })()}
              </div>
              {activeToken.strongNumber && (
                <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button
                    variant="gold"
                    onClick={() => openStrongLookup(activeToken.strongNumber!)}
                  >
                    Ver Strong {activeToken.strongNumber}
                  </Button>
                  <Button
                    variant="ai"
                    onClick={() => ctx && dispatchVerseToModule("ai", ctx)}
                  >
                    Perguntar à IA
                  </Button>
                </div>
              )}
            </Card>
          )}

          {verseData.attribution && (
            <p className="verse-vocab-popover__attrib">{verseData.attribution}</p>
          )}
        </>
      )}
    </div>
  );
}
