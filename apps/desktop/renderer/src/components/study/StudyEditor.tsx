import { EmptyState, LoadingState } from "@mrb/ui-kit";
import type { StudySessionRecord } from "../../lib/api";
import { verseLinkedRef } from "../../lib/study-utils";
import type { VerseContext } from "../../lib/verse-context";
import { StudyBlockCard } from "./StudyBlockCard";

interface StudyEditorProps {
  study: StudySessionRecord | undefined;
  loading: boolean;
  onDeleteBlock: (id: string) => void;
  onSaveBlockText: (blockId: string, text: string) => void;
  onAddNoteAfterVerse: (
    verseBlock: StudySessionRecord["blocks"][number],
    type: "observation" | "interpretation"
  ) => void;
}

export function StudyEditor({
  study,
  loading,
  onDeleteBlock,
  onSaveBlockText,
  onAddNoteAfterVerse,
}: StudyEditorProps) {
  if (loading) return <LoadingState message="Carregando estudo..." />;

  if (!study) {
    return (
      <EmptyState
        title="Preparando estudo..."
        description="Selecione versículos no Leitor e envie para cá"
      />
    );
  }

  if (study.blocks.length === 0) {
    return (
      <EmptyState
        title="Estudo vazio"
        description="Clique em Estudo na barra do versículo ou arraste versículos para esta janela"
      />
    );
  }

  const sorted = [...study.blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="study-float-editor mrb-scroll">
      {sorted.map((block) => (
        <StudyBlockCard
          key={block.id}
          block={block}
          onDelete={() => onDeleteBlock(block.id)}
          onSaveText={(text) => onSaveBlockText(block.id, text)}
          onAddNote={
            block.type === "bible_text"
              ? (type) => onAddNoteAfterVerse(block, type)
              : undefined
          }
        />
      ))}
    </div>
  );
}

export function verseContextFromBlock(
  block: StudySessionRecord["blocks"][number]
): VerseContext | null {
  if (block.type !== "bible_text") return null;
  const c = block.content;
  return {
    verse: Number(c.verse),
    bookOsisId: String(c.bookOsisId ?? ""),
    bookName: String(c.reference ?? "").split(" ")[0] ?? "",
    chapter: Number(c.chapter),
    version: String(c.version ?? ""),
    text: String(c.text ?? ""),
    reference: String(c.reference ?? ""),
  };
}

export function linkedVersesFromBlock(block: StudySessionRecord["blocks"][number]) {
  if (block.linkedVerses) return block.linkedVerses as unknown[];
  const ctx = verseContextFromBlock(block);
  return ctx ? verseLinkedRef(ctx) : undefined;
}
