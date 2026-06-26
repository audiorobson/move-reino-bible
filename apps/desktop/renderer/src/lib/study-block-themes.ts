import type { StudyBlockType } from "@mrb/shared-types";

export interface StudyBlockDef {
  type: StudyBlockType;
  label: string;
  shortLabel: string;
  placeholder: string;
  cssClass: string;
  accent: string;
  bg: string;
  border: string;
}

export const STUDY_BLOCK_DEFS: StudyBlockDef[] = [
  {
    type: "bible_text",
    label: "Texto bíblico",
    shortLabel: "Versículo",
    placeholder: "",
    cssClass: "bible_text",
    accent: "#D1A058",
    bg: "rgba(209, 160, 88, 0.12)",
    border: "rgba(209, 160, 88, 0.55)",
  },
  {
    type: "observation",
    label: "Observação",
    shortLabel: "Observação",
    placeholder: "O que você observa no texto?",
    cssClass: "observation",
    accent: "#4DA3FF",
    bg: "rgba(77, 163, 255, 0.1)",
    border: "rgba(77, 163, 255, 0.45)",
  },
  {
    type: "interpretation",
    label: "Interpretação",
    shortLabel: "Interpretação",
    placeholder: "O que o texto significa?",
    cssClass: "interpretation",
    accent: "#9B7EDE",
    bg: "rgba(155, 126, 222, 0.12)",
    border: "rgba(155, 126, 222, 0.45)",
  },
  {
    type: "application",
    label: "Aplicação",
    shortLabel: "Aplicação",
    placeholder: "Como aplicar na vida hoje?",
    cssClass: "application",
    accent: "#3CB371",
    bg: "rgba(60, 179, 113, 0.12)",
    border: "rgba(60, 179, 113, 0.45)",
  },
  {
    type: "question",
    label: "Pergunta",
    shortLabel: "Pergunta",
    placeholder: "Que perguntas o texto levanta?",
    cssClass: "question",
    accent: "#E8A838",
    bg: "rgba(232, 168, 56, 0.12)",
    border: "rgba(232, 168, 56, 0.45)",
  },
];

export const STUDY_BLOCK_DEF_MAP = Object.fromEntries(
  STUDY_BLOCK_DEFS.map((d) => [d.type, d])
) as Record<string, StudyBlockDef>;

export function getStudyBlockDef(type: string): StudyBlockDef {
  return (
    STUDY_BLOCK_DEF_MAP[type] ?? {
      type: type as StudyBlockType,
      label: type,
      shortLabel: type,
      placeholder: "Escreva aqui...",
      cssClass: type,
      accent: "#888",
      bg: "rgba(255,255,255,0.05)",
      border: "rgba(255,255,255,0.15)",
    }
  );
}
