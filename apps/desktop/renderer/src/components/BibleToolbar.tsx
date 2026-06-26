import { Columns2, BookOpen, Languages, Layers, FileText } from "lucide-react";
import { Button, Badge } from "@mrb/ui-kit";
import { useAppStore } from "../store/appStore";
import { useBibleVersions } from "../hooks/useBibleVersions";
import { useBibleBooks } from "../hooks/useBibleBooks";

export function BibleToolbar({ hasOriginalData }: { hasOriginalData?: boolean }) {
  const {
    currentBook,
    currentChapter,
    currentVersion,
    compareMode,
    parallelVersions,
    parallelColumnCount,
    setLocation,
    setVersion,
    setCompareMode,
    setParallelVersion,
    setParallelColumnCount,
    showInterlinearLayer,
    toggleInterlinearLayer,
    showGreekParallelColumn,
    toggleGreekParallelColumn,
    studyModeOpen,
    toggleStudyMode,
  } = useAppStore();

  const { data: versions = [], isLoading: versionsLoading } = useBibleVersions();
  const { data: books = [] } = useBibleBooks();

  const columnCount = parallelColumnCount;
  const activeVersions = parallelVersions.slice(0, columnCount);
  const currentBookMeta = books.find((b) => b.osisId === currentBook);
  const maxChapter = currentBookMeta?.chapterCount ?? 150;

  const handleChapterChange = (value: string) => {
    const chapter = Math.min(Math.max(parseInt(value, 10) || 1, 1), maxChapter);
    setLocation(currentBook, chapter);
  };

  return (
    <div className="bible-toolbar">
      <div className="bible-toolbar__row">
        <input
          className="mrb-input bible-toolbar__chapter"
          type="number"
          min={1}
          max={maxChapter}
          value={currentChapter}
          onChange={(e) => handleChapterChange(e.target.value)}
          title={`Capítulo (1–${maxChapter})`}
        />

        {!compareMode && (
          <select
            className="mrb-input bible-toolbar__version"
            value={currentVersion}
            onChange={(e) => setVersion(e.target.value)}
            disabled={versionsLoading}
          >
            {versions.map((v) => (
              <option key={v.abbreviation} value={v.abbreviation}>
                {v.abbreviation} — {v.name}
              </option>
            ))}
          </select>
        )}

        <Button
          variant={compareMode ? "gold" : "secondary"}
          onClick={() => setCompareMode(!compareMode)}
          title="Comparar versões lado a lado"
        >
          <Columns2 size={16} />
          {compareMode ? "Comparando" : "Comparar"}
        </Button>

        <Button
          variant={studyModeOpen ? "gold" : "secondary"}
          onClick={toggleStudyMode}
          title="Abrir janela flutuante de estudo — notas, comentários e exportação"
        >
          <FileText size={16} />
          Modo de Estudo
        </Button>

        {!compareMode && hasOriginalData && (
          <>
            <Button
              variant={showInterlinearLayer ? "gold" : "secondary"}
              onClick={toggleInterlinearLayer}
              title="Mostrar interlinear com palavras clicáveis (pronúncia + Strong)"
            >
              <Layers size={16} />
              Interlinear
            </Button>
            <Badge variant="gold">
              <Languages size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
              STEP
            </Badge>
          </>
        )}
      </div>

      {compareMode && (
        <div className="bible-toolbar__compare">
          <div className="bible-toolbar__compare-head">
            <Badge variant="blue">Modo paralelo</Badge>
            {hasOriginalData && (
              <Button
                variant={showGreekParallelColumn ? "gold" : "secondary"}
                onClick={toggleGreekParallelColumn}
                title="Mostrar coluna com texto original STEP"
              >
                <Languages size={16} />
                Coluna original
              </Button>
            )}
            <div className="bible-toolbar__col-count">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={columnCount === n ? "active" : ""}
                  onClick={() => setParallelColumnCount(n as 2 | 3 | 4)}
                >
                  {n} col
                </button>
              ))}
            </div>
          </div>
          <div className="bible-toolbar__version-row">
            {activeVersions.map((abbr, i) => (
              <select
                key={i}
                className="mrb-input bible-toolbar__parallel-select"
                value={abbr}
                onChange={(e) => setParallelVersion(i, e.target.value)}
                disabled={versionsLoading}
              >
                {versions.map((v) => (
                  <option key={v.abbreviation} value={v.abbreviation}>
                    {v.abbreviation}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      )}

      {!compareMode && (
        <p className="bible-toolbar__hint">
          <BookOpen size={14} />
          Leitura em <strong>{currentVersion}</strong>
          {currentBookMeta && (
            <> · {currentBookMeta.namePt} ({currentChapter}/{maxChapter})</>
          )}
        </p>
      )}
    </div>
  );
}
