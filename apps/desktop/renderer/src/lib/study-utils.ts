import type { StudyBlockRecord, StudySessionRecord } from "./api";
import type { VerseContext } from "./verse-context";

export const DEMO_STUDY_USER = "demo-user";

export function verseToBlockContent(v: VerseContext) {
  return {
    reference: v.reference,
    text: v.text,
    version: v.version,
    bookOsisId: v.bookOsisId,
    chapter: v.chapter,
    verse: v.verse,
  };
}

export function verseLinkedRef(v: VerseContext) {
  return [{ bookOsisId: v.bookOsisId, chapter: v.chapter, verse: v.verse }];
}

export function buildPassageRange(blocks: StudyBlockRecord[]): string {
  const refs = blocks
    .filter((b) => b.type === "bible_text")
    .map((b) => String(b.content.reference ?? ""))
    .filter(Boolean);
  return refs.join("; ");
}

export function defaultStudyTitle(): string {
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR");
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `Estudo — ${date} ${time}`;
}

export function blockTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    bible_text: "Texto bíblico",
    observation: "Observação",
    interpretation: "Interpretação",
    application: "Aplicação",
    question: "Pergunta",
    original_word: "Palavra original",
    theological_citation: "Citação",
    ai_comment: "IA",
    comparison_table: "Comparação",
    thematic_chain: "Cadeia",
  };
  return labels[type] ?? type;
}

export function studyHasUnsavedLocalEdits(
  study: StudySessionRecord | undefined,
  localTexts: Record<string, string>
): boolean {
  if (!study) return Object.keys(localTexts).length > 0;
  for (const block of study.blocks) {
    const local = localTexts[block.id];
    if (local == null) continue;
    const saved = String(block.content.text ?? "");
    if (local !== saved) return true;
  }
  return false;
}
