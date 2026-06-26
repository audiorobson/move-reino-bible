import type { StudyBlockType } from "@mrb/shared-types";
import { BookOpen, Eye, Lightbulb, MessageSquare, HelpCircle, Target } from "lucide-react";
import { STUDY_BLOCK_DEFS } from "../../lib/study-block-themes";

const BLOCK_ICONS: Partial<Record<StudyBlockType, typeof BookOpen>> = {
  bible_text: BookOpen,
  observation: Eye,
  interpretation: MessageSquare,
  application: Target,
  question: HelpCircle,
};

interface StudyBlockToolbarProps {
  onAddBlock: (type: StudyBlockType) => void;
  onAddVerseFromQueue?: () => void;
  hasPendingVerses?: boolean;
  busy?: boolean;
}

export function StudyBlockToolbar({
  onAddBlock,
  onAddVerseFromQueue,
  hasPendingVerses,
  busy,
}: StudyBlockToolbarProps) {
  return (
    <div className="study-block-toolbar">
      <span className="study-block-toolbar__label">
        <Lightbulb size={14} /> Adicionar bloco
      </span>
      <div className="study-block-toolbar__buttons">
        {STUDY_BLOCK_DEFS.map((def) => {
          const Icon = BLOCK_ICONS[def.type] ?? MessageSquare;
          const isVerse = def.type === "bible_text";

          return (
            <button
              key={def.type}
              type="button"
              className={`study-block-toolbar__btn study-block-toolbar__btn--${def.cssClass}`}
              style={
                {
                  "--study-accent": def.accent,
                  "--study-bg": def.bg,
                  "--study-border": def.border,
                } as React.CSSProperties
              }
              disabled={busy || (isVerse && !hasPendingVerses && !onAddVerseFromQueue)}
              title={
                isVerse
                  ? hasPendingVerses
                    ? "Inserir versículos da fila"
                    : "Selecione versículos no Leitor"
                  : `Adicionar ${def.label}`
              }
              onClick={() => {
                if (isVerse && onAddVerseFromQueue) {
                  onAddVerseFromQueue();
                  return;
                }
                if (!isVerse) onAddBlock(def.type);
              }}
            >
              <Icon size={14} />
              {def.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
