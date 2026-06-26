import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { LoadingState, ErrorState, Badge } from "@mrb/ui-kit";
import { api } from "../lib/api";
import { SelectableVerseCard } from "../components/SelectableVerseCard";
import { OriginalParallelVerse } from "../components/OriginalParallelVerse";
import { useChapterOriginal } from "../hooks/useChapterOriginal";
import { useVersificationAlignment } from "../hooks/useVersificationAlignment";
import { originalDatasetLabel, originalScriptLabel } from "../lib/original-language";
import type { OriginalTokenDto } from "@mrb/shared-types";

interface ParallelChapterViewProps {
  book: string;
  chapter: number;
  versions: string[];
  bookName: string;
  compact?: boolean;
  showGreekColumn?: boolean;
}

export function ParallelChapterView({
  book,
  chapter,
  versions,
  bookName,
  compact,
  showGreekColumn = false,
}: ParallelChapterViewProps) {
  const uniqueVersions = [...new Set(versions.filter(Boolean))];
  const { hasChapterData, tokensByVerse, originalLanguage } = useChapterOriginal(
    book,
    chapter,
    showGreekColumn
  );
  const alignHebrew = showGreekColumn && originalLanguage === "hebrew";
  const { hasDifferences, verseMap } = useVersificationAlignment(
    book,
    chapter,
    alignHebrew,
    "english",
    "hebrew"
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["parallel", book, chapter, ...uniqueVersions],
    queryFn: () => api.getParallel(book, chapter, uniqueVersions),
    enabled: uniqueVersions.length > 0,
  });

  if (isLoading) return <LoadingState message="Carregando comparação..." />;
  if (error) return <ErrorState message={error.message} />;
  if (!data?.columns.length) return <ErrorState message="Nenhuma versão encontrada para comparar" />;

  const maxVerse = Math.max(...data.columns.flatMap((c) => c.verses.map((v) => v.verse)), 0);
  const originalActive = showGreekColumn && hasChapterData;
  const colCount = data.columns.length + (originalActive ? 1 : 0);
  const script = originalLanguage ?? "greek";
  const scriptLabel = originalScriptLabel(script);
  const datasetLabel = originalDatasetLabel(script);

  const getVerseTokens = (englishVerse: number): OriginalTokenDto[] => {
    const raw = tokensByVerse as Record<string, OriginalTokenDto[]>;
    const lookupVerse =
      alignHebrew && verseMap.has(englishVerse) ? verseMap.get(englishVerse)! : englishVerse;
    return raw[String(lookupVerse)] ?? raw[lookupVerse] ?? [];
  };

  return (
    <>
      {originalActive && hasDifferences && (
        <p className="bible-reader__step-hint bible-reader__step-hint--versification">
          Versificação hebraica diferente — versículos alinhados automaticamente (STEP TVTMS)
        </p>
      )}
      <div
        className={`parallel-main-grid ${compact ? "parallel-main-grid--compact" : ""}`}
        style={{ "--parallel-cols": String(colCount) } as CSSProperties}
      >
        {originalActive && (
        <section
          className={`parallel-main-column parallel-main-column--original parallel-main-column--${script} mrb-scroll`}
        >
          <header className="parallel-main-column__head">
            <span className="parallel-main-column__abbr">{script === "hebrew" ? "HE" : "GR"}</span>
            <span className="parallel-main-column__name">
              {scriptLabel} · STEPBible {datasetLabel}
            </span>
            <span className="parallel-main-column__license-badge">
              <Badge variant="gold">CC BY 4.0</Badge>
            </span>
          </header>
          <div className="parallel-main-column__verses">
            {Array.from({ length: maxVerse }, (_, i) => i + 1).map((verseNum) => {
              const tokens = getVerseTokens(verseNum);
              if (!tokens.length) return null;
              return (
                <OriginalParallelVerse
                  key={`original-${verseNum}`}
                  verseNumber={verseNum}
                  tokens={tokens}
                  script={script}
                />
              );
            })}
          </div>
        </section>
      )}

      {data.columns.map((col) => {
        const colVerseMap = new Map(col.verses.map((v) => [v.verse, v.text]));
        return (
          <section key={col.version.abbreviation} className="parallel-main-column mrb-scroll">
            <header className="parallel-main-column__head">
              <span className="parallel-main-column__abbr">{col.version.abbreviation}</span>
              <span className="parallel-main-column__name">{col.version.name}</span>
            </header>
            <div className="parallel-main-column__verses">
              {Array.from({ length: maxVerse }, (_, i) => i + 1).map((verseNum) => {
                const text = colVerseMap.get(verseNum);
                if (!text) return null;
                return (
                  <SelectableVerseCard
                    key={`${col.version.abbreviation}-${verseNum}`}
                    verseNumber={verseNum}
                    text={text}
                    bookOsisId={book}
                    bookName={bookName}
                    chapter={chapter}
                    version={col.version.abbreviation}
                    hasOriginalData={originalActive && getVerseTokens(verseNum).length > 0}
                    verseTokens={getVerseTokens(verseNum)}
                    originalLanguage={script}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
      </div>
    </>
  );
}
