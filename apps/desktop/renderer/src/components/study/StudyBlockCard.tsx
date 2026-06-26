import { useState, useEffect } from "react";
import { Trash2, MessageSquare, StickyNote } from "lucide-react";
import { Badge, Button } from "@mrb/ui-kit";
import type { StudyBlockRecord } from "../../lib/api";
import { blockTypeLabel } from "../../lib/study-utils";
import { getStudyBlockDef } from "../../lib/study-block-themes";
import type { VerseContext } from "../../lib/verse-context";

interface StudyBlockCardProps {
  block: StudyBlockRecord;
  onDelete: () => void;
  onSaveText: (text: string) => void;
  onAddNote?: (type: "observation" | "interpretation") => void;
  linkedVerse?: VerseContext | null;
}

const TEXT_TYPES = new Set(["observation", "interpretation", "application", "question"]);

export function StudyBlockCard({
  block,
  onDelete,
  onSaveText,
  onAddNote,
}: StudyBlockCardProps) {
  const initialText = String(block.content.text ?? "");
  const [text, setText] = useState(initialText);
  const isTextBlock = TEXT_TYPES.has(block.type);
  const def = getStudyBlockDef(block.type);

  useEffect(() => {
    setText(String(block.content.text ?? ""));
  }, [block.id, block.content.text]);

  return (
    <article
      className={`study-float-block study-float-block--${def.cssClass}`}
      style={
        {
          "--study-accent": def.accent,
          "--study-bg": def.bg,
          "--study-border": def.border,
        } as React.CSSProperties
      }
    >
      <header className="study-float-block__head">
        <span className="study-float-block__type-label">{blockTypeLabel(block.type)}</span>
        <div className="study-float-block__actions">
          {block.type === "bible_text" && onAddNote && (
            <>
              <Button variant="ghost" title="Adicionar nota" onClick={() => onAddNote("observation")}>
                <StickyNote size={14} />
              </Button>
              <Button variant="ghost" title="Adicionar comentário" onClick={() => onAddNote("interpretation")}>
                <MessageSquare size={14} />
              </Button>
            </>
          )}
          <Button variant="ghost" title="Remover bloco" onClick={onDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </header>

      {block.type === "bible_text" && (
        <div className="study-float-block__verse">
          <strong>{String(block.content.reference ?? "")}</strong>
          {block.content.version ? (
            <Badge variant="blue">{String(block.content.version)}</Badge>
          ) : null}
          <p>"{String(block.content.text ?? "")}"</p>
        </div>
      )}

      {block.type === "theological_citation" && (
        <div className="study-float-block__citation">
          <strong>{String(block.content.title ?? "")}</strong>
          <p>{String(block.content.excerpt ?? "")}</p>
        </div>
      )}

      {isTextBlock && (
        <textarea
          className="study-float-block__textarea mrb-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            if (text !== initialText) onSaveText(text);
          }}
          placeholder={def.placeholder || "Escreva aqui..."}
          rows={3}
        />
      )}

      {!isTextBlock && block.type !== "bible_text" && block.type !== "theological_citation" && (
        <p className="study-float-block__text">{String(block.content.text ?? JSON.stringify(block.content))}</p>
      )}
    </article>
  );
}
