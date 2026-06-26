import type { TheologyTradition, TheologyComparisonEntry } from "@mrb/shared-types";

export interface TraditionMeta {
  id: TheologyTradition;
  labelPt: string;
  labelEn: string;
  accentColor: string;
  description: string;
}

export const THEOLOGY_TRADITIONS: TraditionMeta[] = [
  { id: "reformed", labelPt: "Reformada", labelEn: "Reformed", accentColor: "#1D4ED8", description: "Tradição reformada/calvinista" },
  { id: "catholic", labelPt: "Católica", labelEn: "Catholic", accentColor: "#B91C1C", description: "Tradição católica romana" },
  { id: "methodist", labelPt: "Metodista", labelEn: "Methodist", accentColor: "#DC2626", description: "Tradição metodista/wesleyana" },
  { id: "pentecostal", labelPt: "Pentecostal", labelEn: "Pentecostal", accentColor: "#EA580C", description: "Tradição pentecostal/carismática" },
  { id: "baptist", labelPt: "Batista", labelEn: "Baptist", accentColor: "#2563EB", description: "Tradição batista" },
  { id: "lutheran", labelPt: "Luterana", labelEn: "Lutheran", accentColor: "#7C3AED", description: "Tradição luterana" },
  { id: "orthodox", labelPt: "Ortodoxa", labelEn: "Orthodox", accentColor: "#7C2D12", description: "Tradição ortodoxa oriental" },
  { id: "patristic", labelPt: "Patrística", labelEn: "Patristic", accentColor: "#A16207", description: "Pais da Igreja" },
  { id: "arminian", labelPt: "Arminiana", labelEn: "Arminian", accentColor: "#059669", description: "Tradição arminiana/remonstrante" },
  { id: "other", labelPt: "Outra", labelEn: "Other", accentColor: "#6B7280", description: "Outras tradições" },
];

export const DOCTRINE_TAGS = [
  "graça", "salvação", "justificação", "santificação", "eleição", "predestinação",
  "Trindade", "Cristologia", "Pneumatologia", "Escatologia", "Eclesiologia",
  "Sacramentos", "autoridade das Escrituras", "livre arbítrio", "perseverança",
] as const;

export function getTraditionMeta(id: TheologyTradition): TraditionMeta | undefined {
  return THEOLOGY_TRADITIONS.find((t) => t.id === id);
}

export function buildComparisonTemplate(passage: string): TheologyComparisonEntry[] {
  return THEOLOGY_TRADITIONS.slice(0, 4).map((t) => ({
    tradition: t.id,
    thesis: `Interpretação ${t.labelPt} de ${passage}`,
    sources: [],
    arguments: [],
    strengths: [],
    debatablePoints: [],
  }));
}
