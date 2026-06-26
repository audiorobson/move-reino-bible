import type { GlossaryEntry } from "../types/glossary.types.js";

export const THEOLOGICAL_GLOSSARY_EN_PTBR: GlossaryEntry[] = [
  { source: "justification", target: "justificação", category: "soteriologia", confidence: "high" },
  { source: "sanctification", target: "santificação", category: "soteriologia", confidence: "high" },
  { source: "regeneration", target: "regeneração", category: "soteriologia", confidence: "high" },
  { source: "atonement", target: "expiação", category: "cristologia", confidence: "high" },
  { source: "propitiation", target: "propiciação", category: "cristologia", confidence: "high" },
  { source: "covenant", target: "aliança", category: "teologia bíblica", confidence: "high" },
  {
    source: "righteousness",
    target: "justiça",
    category: "soteriologia",
    confidence: "medium",
    note: "Pode significar justiça, retidão ou status justo conforme contexto.",
  },
  { source: "imputation", target: "imputação", category: "soteriologia", confidence: "high" },
  { source: "election", target: "eleição", category: "soteriologia", confidence: "high" },
  { source: "predestination", target: "predestinação", category: "soteriologia", confidence: "high" },
  { source: "original sin", target: "pecado original", category: "hamartiologia", confidence: "high" },
  { source: "Lord's Supper", target: "Ceia do Senhor", category: "eclesiologia", confidence: "high" },
  { source: "means of grace", target: "meios de graça", category: "eclesiologia", confidence: "high" },
];
