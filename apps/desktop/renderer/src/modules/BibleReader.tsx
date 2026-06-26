import { useQuery } from "@tanstack/react-query";
import { LoadingState, ErrorState, Button } from "@mrb/ui-kit";
import { useAppStore } from "../store/appStore";
import { api } from "../lib/api";
import { BibleToolbar } from "../components/BibleToolbar";
import { ParallelChapterView } from "../components/ParallelChapterView";
import { SelectableVerseCard } from "../components/SelectableVerseCard";
import { VerseSelectionBar } from "../components/VerseSelectionBar";
import { useBibleBooks } from "../hooks/useBibleBooks";
import { useChapterOriginal } from "../hooks/useChapterOriginal";
import { originalScriptLabel } from "../lib/original-language";
import type { OriginalTokenDto } from "@mrb/shared-types";

export function BibleReader() {
  const {
    currentBook,
    currentChapter,
    currentVersion,
    compareMode,
    parallelVersions,
    parallelColumnCount,
    setLocation,
    preferences,
    showInterlinearLayer,
    showGreekParallelColumn,
  } = useAppStore();

  const { data: books = [] } = useBibleBooks();
  const maxChapter = books.find((b) => b.osisId === currentBook)?.chapterCount ?? 999;
  const bookName = books.find((b) => b.osisId === currentBook)?.namePt ?? currentBook;

  const { data, isLoading, error } = useQuery({
    queryKey: ["chapter", currentBook, currentChapter, currentVersion],
    queryFn: () => api.getChapter(currentBook, currentChapter, currentVersion),
    enabled: !compareMode,
  });

  const activeParallel = parallelVersions.slice(0, parallelColumnCount);
  const { hasChapterData, hasVerseData, tokensByVerse, originalLanguage } = useChapterOriginal(
    currentBook,
    currentChapter,
    true
  );
  const scriptLabel = originalLanguage ? originalScriptLabel(originalLanguage) : "original";

  const getVerseTokens = (verse: number): OriginalTokenDto[] => {
    const raw = tokensByVerse as Record<string, OriginalTokenDto[]>;
    return raw[String(verse)] ?? raw[verse] ?? [];
  };

  return (
    <div className="bible-reader">
      <div className="bible-header">
        <h2>
          {compareMode ? "Comparação" : data?.bookName ?? bookName} {currentChapter}
        </h2>
        <BibleToolbar hasOriginalData={hasChapterData} />
      </div>

      {hasChapterData && !compareMode && (
        <p className="bible-reader__step-hint">
          Texto {scriptLabel.toLowerCase()} STEP disponível — clique no <strong>número dourado</strong> do versículo
          {showInterlinearLayer ? " · interlinear ativo (clique nas palavras originais)" : ""}
        </p>
      )}

      {hasChapterData && compareMode && showGreekParallelColumn && (
        <p className="bible-reader__step-hint">
          Coluna {scriptLabel.toLowerCase()} STEP ativa — compare traduções com o texto original lado a lado
        </p>
      )}

      <VerseSelectionBar />

      {compareMode ? (
        <ParallelChapterView
          book={currentBook}
          chapter={currentChapter}
          versions={activeParallel}
          bookName={bookName}
          showGreekColumn={showGreekParallelColumn}
        />
      ) : isLoading ? (
        <LoadingState message="Carregando capítulo..." />
      ) : error ? (
        <ErrorState message={`Erro ao carregar: ${error.message}. Verifique se a API está rodando.`} />
      ) : !data ? (
        <ErrorState message="Capítulo não encontrado" />
      ) : (
        <div
          className="bible-reader__verses"
          style={{ fontSize: preferences.bibleFontSize, lineHeight: preferences.bibleLineHeight }}
        >
          {data.verses.map((v) => (
            <SelectableVerseCard
              key={v.id}
              verseNumber={v.verse}
              text={v.text}
              bookOsisId={currentBook}
              bookName={data.bookName ?? bookName}
              chapter={currentChapter}
              version={currentVersion}
              hasOriginalData={hasVerseData(v.verse)}
              verseTokens={getVerseTokens(v.verse)}
              showInterlinear={showInterlinearLayer}
              originalLanguage={originalLanguage}
            />
          ))}
        </div>
      )}

      <div className="chapter-nav">
        <Button onClick={() => setLocation(currentBook, Math.max(1, currentChapter - 1))} disabled={currentChapter <= 1}>
          ← Capítulo anterior
        </Button>
        <Button
          onClick={() => setLocation(currentBook, currentChapter + 1)}
          disabled={currentChapter >= maxChapter}
        >
          Próximo capítulo →
        </Button>
      </div>
    </div>
  );
}
