export type MorphologyPartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "particle"
  | "article"
  | "adverb"
  | "other";

export function classifyMorphology(code?: string | null): MorphologyPartOfSpeech {
  if (!code) return "other";
  const trimmed = code.trim();
  if (!trimmed) return "other";

  if (trimmed.includes("/")) {
    const prefix = trimmed.split("/")[0]?.toUpperCase() ?? "";
    if (prefix.startsWith("HV")) return "verb";
    if (prefix.startsWith("HR") || prefix.startsWith("HN")) return "noun";
    if (prefix.startsWith("HT") || prefix.startsWith("HP")) return "particle";
    if (prefix.startsWith("HC")) return "conjunction";
    if (prefix.startsWith("HD")) return "adverb";
    return "other";
  }

  const first = trimmed.charAt(0).toUpperCase();
  switch (first) {
    case "N":
      return "noun";
    case "V":
      return "verb";
    case "A":
      return "adjective";
    case "P":
      return "pronoun";
    case "R":
      return "preposition";
    case "C":
      return "conjunction";
    case "I":
      return "particle";
    case "D":
      return "adverb";
    case "T":
      return "article";
    default:
      return "other";
  }
}

export function morphologyColorClass(code?: string | null): string {
  return `morph-badge--${classifyMorphology(code)}`;
}

export function morphologyLabelPt(code?: string | null): string {
  const labels: Record<MorphologyPartOfSpeech, string> = {
    noun: "Substantivo",
    verb: "Verbo",
    adjective: "Adjetivo",
    pronoun: "Pronome",
    preposition: "Preposição",
    conjunction: "Conjunção",
    particle: "Partícula",
    article: "Artigo",
    adverb: "Advérbio",
    other: "Forma",
  };
  return labels[classifyMorphology(code)];
}
