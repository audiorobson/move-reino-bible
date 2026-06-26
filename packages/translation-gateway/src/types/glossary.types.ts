export type GlossaryConfidence = "high" | "medium" | "low";

export type GlossaryEntry = {
  source: string;
  target: string;
  category: string;
  confidence: GlossaryConfidence;
  note?: string;
};

export type GlossaryPair = "en-ptbr" | "fr-ptbr" | "es-ptbr";

export const GLOSSARY_VERSION = "theological-v1";
