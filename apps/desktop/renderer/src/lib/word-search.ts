export type WordSearchKind = "strong" | "bible" | "reference" | "morphology";

const STRONG_NUMBER_RE = /^([gh])?\s*\d{1,5}$/i;
const REFERENCE_RE = /^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i;
const MORPH_HEBREW_RE = /^[A-Z]{1,3}\/[\w]+/i;
const MORPH_GREEK_RE = /^[NVADRPCEIT][\w-]{0,22}$/i;

export function isMorphologySearchQuery(query: string): boolean {
  const q = query.trim();
  if (!q || q.length < 2) return false;
  if (STRONG_NUMBER_RE.test(q.replace(/\s/g, ""))) return false;
  if (REFERENCE_RE.test(q)) return false;
  if (MORPH_HEBREW_RE.test(q)) return true;
  if (MORPH_GREEK_RE.test(q)) return true;
  return /^(noun|verb|adj|part|prep|conj|pron|art|adv|interj)/i.test(q);
}

export function detectWordSearchKind(query: string): WordSearchKind {
  const q = query.trim();
  if (!q) return "bible";
  if (STRONG_NUMBER_RE.test(q.replace(/\s/g, ""))) return "strong";
  if (REFERENCE_RE.test(q)) return "reference";
  if (isMorphologySearchQuery(q)) return "morphology";
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

export type WordSearchScope = "auto" | "bible_pt" | "bible_en" | "strong" | "morphology";

export function resolveSearchScopes(
  query: string,
  scope: WordSearchScope
): {
  biblePt: boolean;
  bibleEn: boolean;
  strong: boolean;
  morphology: boolean;
  bibleMode: string;
} {
  const kind = detectWordSearchKind(query);

  if (scope === "bible_pt") {
    return { biblePt: true, bibleEn: false, strong: false, morphology: false, bibleMode: kind === "reference" ? "reference" : "phrase" };
  }
  if (scope === "bible_en") {
    return { biblePt: false, bibleEn: true, strong: false, morphology: false, bibleMode: kind === "reference" ? "reference" : "phrase" };
  }
  if (scope === "strong") {
    return { biblePt: false, bibleEn: false, strong: true, morphology: false, bibleMode: "phrase" };
  }
  if (scope === "morphology") {
    return { biblePt: false, bibleEn: false, strong: false, morphology: true, bibleMode: "phrase" };
  }

  if (kind === "strong") {
    return { biblePt: false, bibleEn: false, strong: true, morphology: false, bibleMode: "phrase" };
  }
  if (kind === "morphology") {
    return { biblePt: false, bibleEn: false, strong: false, morphology: true, bibleMode: "phrase" };
  }
  if (kind === "reference") {
    return { biblePt: true, bibleEn: false, strong: false, morphology: false, bibleMode: "reference" };
  }

  return {
    biblePt: true,
    bibleEn: isLikelyEnglishQuery(query) || !isLikelyPortugueseQuery(query),
    strong: true,
    morphology: false,
    bibleMode: "phrase",
  };
}
