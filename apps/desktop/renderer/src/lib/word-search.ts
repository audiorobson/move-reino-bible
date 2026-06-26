export type WordSearchKind = "strong" | "bible" | "reference";

const STRONG_NUMBER_RE = /^([gh])?\s*\d{1,5}$/i;
const REFERENCE_RE = /^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i;

export function detectWordSearchKind(query: string): WordSearchKind {
  const q = query.trim();
  if (!q) return "bible";
  if (STRONG_NUMBER_RE.test(q.replace(/\s/g, ""))) return "strong";
  if (REFERENCE_RE.test(q)) return "reference";
  return "bible";
}

export function normalizeStrongQuery(query: string): string {
  const compact = query.trim().replace(/\s/g, "");
  const match = compact.match(/^([gh])?(\d{1,5})$/i);
  if (!match) return query.trim();
  const prefix = (match[1] ?? "G").toUpperCase();
  return `${prefix}${match[2]}`;
}

export function isLikelyEnglishQuery(query: string): boolean {
  const q = query.trim();
  if (!q) return false;
  if (/[\u0370-\u03FF\u0590-\u05FF]/.test(q)) return false;
  return /^[a-zA-Z][a-zA-Z\s'-]*$/.test(q);
}

export function isLikelyPortugueseQuery(query: string): boolean {
  const q = query.trim();
  if (!q) return false;
  return /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(q) || !isLikelyEnglishQuery(q);
}

export type WordSearchScope = "auto" | "bible_pt" | "bible_en" | "strong";

export function resolveSearchScopes(
  query: string,
  scope: WordSearchScope
): { biblePt: boolean; bibleEn: boolean; strong: boolean; bibleMode: string } {
  const kind = detectWordSearchKind(query);

  if (scope === "bible_pt") {
    return { biblePt: true, bibleEn: false, strong: false, bibleMode: kind === "reference" ? "reference" : "phrase" };
  }
  if (scope === "bible_en") {
    return { biblePt: false, bibleEn: true, strong: false, bibleMode: kind === "reference" ? "reference" : "phrase" };
  }
  if (scope === "strong") {
    return { biblePt: false, bibleEn: false, strong: true, bibleMode: "phrase" };
  }

  if (kind === "strong") {
    return { biblePt: false, bibleEn: false, strong: true, bibleMode: "phrase" };
  }
  if (kind === "reference") {
    return { biblePt: true, bibleEn: false, strong: false, bibleMode: "reference" };
  }

  return {
    biblePt: true,
    bibleEn: isLikelyEnglishQuery(query) || !isLikelyPortugueseQuery(query),
    strong: true,
    bibleMode: "phrase",
  };
}
