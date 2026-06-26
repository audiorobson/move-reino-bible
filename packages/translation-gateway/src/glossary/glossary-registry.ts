import type { GlossaryEntry, GlossaryPair } from "../types/glossary.types.js";
import { THEOLOGICAL_GLOSSARY_EN_PTBR } from "../glossary/theological-glossary.en-ptbr.js";
import { THEOLOGICAL_GLOSSARY_FR_PTBR } from "../glossary/theological-glossary.fr-ptbr.js";
import { THEOLOGICAL_GLOSSARY_ES_PTBR } from "../glossary/theological-glossary.es-ptbr.js";

const REGISTRY: Record<GlossaryPair, GlossaryEntry[]> = {
  "en-ptbr": THEOLOGICAL_GLOSSARY_EN_PTBR,
  "fr-ptbr": THEOLOGICAL_GLOSSARY_FR_PTBR,
  "es-ptbr": THEOLOGICAL_GLOSSARY_ES_PTBR,
};

export function getGlossaryForPair(pair: GlossaryPair): GlossaryEntry[] {
  return REGISTRY[pair];
}

export function resolveGlossaryPair(sourceLang: string): GlossaryPair {
  const lang = sourceLang.toLowerCase();
  if (lang.startsWith("fr")) return "fr-ptbr";
  if (lang.startsWith("es")) return "es-ptbr";
  return "en-ptbr";
}

export type GlossaryApplyResult = {
  text: string;
  applied: string[];
  warnings: string[];
};

/** Aplica termos de alta confiança ausentes na tradução (pós-processamento leve). */
export function applyTheologicalGlossary(
  sourceText: string,
  translatedText: string,
  pair: GlossaryPair
): GlossaryApplyResult {
  const entries = getGlossaryForPair(pair);
  const applied: string[] = [];
  const warnings: string[] = [];
  let result = translatedText;

  for (const entry of entries) {
    const sourceRe = new RegExp(`\\b${escapeRegExp(entry.source)}\\b`, "i");
    if (!sourceRe.test(sourceText)) continue;

    const targetRe = new RegExp(`\\b${escapeRegExp(entry.target)}\\b`, "i");
    if (targetRe.test(result)) continue;

    if (entry.confidence === "high") {
      const match = sourceText.match(sourceRe);
      if (match) {
        result = result.replace(match[0], entry.target);
        applied.push(`${entry.source} → ${entry.target}`);
      }
    } else if (entry.confidence === "medium") {
      warnings.push(
        `Termo "${entry.source}" detectado; considere "${entry.target}" (${entry.category}).`
      );
    }
  }

  return { text: result, applied, warnings };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
