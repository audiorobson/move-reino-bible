import { useState, useEffect } from "react";
import { GripVertical, Languages } from "lucide-react";
import { VerseCard } from "@mrb/ui-kit";
import { useAppStore } from "../store/appStore";
import {
  buildVerseContext,
  setVerseDragData,
  verseMatches,
  type VerseContext,
} from "../lib/verse-context";
import { VerseVocabularyPopover } from "./VerseVocabularyPopover";
import { VerseInterlinearStrip } from "./VerseInterlinearStrip";
import type { OriginalTokenDto } from "@mrb/shared-types";
import {
  detectOriginalScript,
  originalScriptLabel,
  type OriginalScript,
} from "../lib/original-language";

interface SelectableVerseCardProps {
  verseNumber: number;
  text: string;
  bookOsisId: string;
  bookName: string;
  chapter: number;
  version: string;
  hasOriginalData?: boolean;
  verseTokens?: OriginalTokenDto[];
  showInterlinear?: boolean;
  originalLanguage?: OriginalScript | null;
  hasNote?: boolean;
  isFavorite?: boolean;
}

export function SelectableVerseCard({
  verseNumber,
  text,
  bookOsisId,
  bookName,
  chapter,
  version,
  hasOriginalData = false,
  verseTokens = [],
  showInterlinear = false,
  originalLanguage = null,
  hasNote = false,
  isFavorite = false,
}: SelectableVerseCardProps) {
  const {
    selectedVerseContext,
    selectVerse,
    clearVerseSelection,
    setActiveModule,
    setSelectedOriginalToken,
    originalVocabVerse,
    setOriginalVocabVerse,
  } = useAppStore();

  const [vocabOpen, setVocabOpen] = useState(false);
  const [selectedInterlinearId, setSelectedInterlinearId] = useState<string | null>(null);

  useEffect(() => {
    if (originalVocabVerse === verseNumber) {
      setVocabOpen(true);
      setOriginalVocabVerse(null);
    }
  }, [originalVocabVerse, verseNumber, setOriginalVocabVerse]);

  const ctx: VerseContext = buildVerseContext({
    verse: verseNumber,
    bookOsisId,
    bookName,
    chapter,
    version,
    text,
  });

  const selected = verseMatches(selectedVerseContext, {
    bookOsisId,
    chapter,
    verse: verseNumber,
    version,
  });

  const handleClick = () => {
    if (selected) clearVerseSelection();
    else selectVerse(ctx);
  };

  const reference = `${bookName} ${chapter}:${verseNumber}`;

  const openVocab = () => {
    if (!hasOriginalData) return;
    setVocabOpen((v) => !v);
  };

  const script = originalLanguage ?? detectOriginalScript(verseTokens, bookOsisId);
  const scriptLabel = originalScriptLabel(script);

  return (
    <div
      className={`selectable-verse ${selected ? "selectable-verse--selected" : ""} ${hasOriginalData ? "selectable-verse--has-original" : ""}`}
      draggable
      onDragStart={(e) => {
        setVerseDragData(e, ctx);
        e.currentTarget.classList.add("selectable-verse--dragging");
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove("selectable-verse--dragging");
      }}
    >
      {selected && (
        <span className="selectable-verse__handle" title="Arraste para IA, Estudo, Cadeias...">
          <GripVertical size={14} />
        </span>
      )}

      {hasOriginalData && (
        <span className="selectable-verse__original-badge" title={`Texto ${scriptLabel.toLowerCase()} STEP disponível`}>
          <Languages size={12} />
        </span>
      )}

      <VerseCard
        verseNumber={verseNumber}
        text={text}
        selected={selected}
        highlighted={isFavorite}
        hasNote={hasNote}
        onClick={handleClick}
        onVerseNumberClick={hasOriginalData ? openVocab : undefined}
      />

      {showInterlinear && hasOriginalData && verseTokens.length > 0 && (
        <VerseInterlinearStrip
          tokens={verseTokens}
          compact
          script={script}
          selectedTokenId={selectedInterlinearId}
          onSelectToken={(token) => {
            setSelectedInterlinearId(token.id);
            setSelectedOriginalToken(token);
          }}
        />
      )}

      {vocabOpen && hasOriginalData && (
        <VerseVocabularyPopover
          bookOsisId={bookOsisId}
          bookName={bookName}
          chapter={chapter}
          verse={verseNumber}
          reference={reference}
          prefetchedTokens={verseTokens.length > 0 ? verseTokens : undefined}
          script={script}
          onClose={() => setVocabOpen(false)}
          onSelectToken={(token) => {
            setSelectedOriginalToken(token);
            setActiveModule("originals");
            setVocabOpen(false);
          }}
        />
      )}
    </div>
  );
}
