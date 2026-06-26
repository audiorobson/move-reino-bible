import type { OriginalTokenDto } from "@mrb/shared-types";
import { resolveTokenGlossPt } from "@mrb/shared-types";

export type OriginalScript = "greek" | "hebrew";

const OT_BOOKS = new Set([
  "Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth",
  "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth",
  "Job", "Ps", "Prov", "Eccl", "Song",
  "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah",
  "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal",
]);

export function detectOriginalScript(
  tokens: OriginalTokenDto[],
  bookOsisId?: string
): OriginalScript {
  const sn = tokens[0]?.strongNumber;
  if (sn?.startsWith("H")) return "hebrew";
  if (sn?.startsWith("G")) return "greek";
  if (tokens[0]?.testament === "OT") return "hebrew";
  if (tokens[0]?.testament === "NT") return "greek";
  if (bookOsisId && OT_BOOKS.has(bookOsisId)) return "hebrew";
  return "greek";
}

export function originalScriptLabel(script: OriginalScript): string {
  return script === "hebrew" ? "Hebraico" : "Grego";
}

export function originalScriptClass(script: OriginalScript): string {
  return script === "hebrew" ? "hebrew hebrew-text" : "greek greek-text";
}

export function originalDatasetLabel(script: OriginalScript): string {
  return script === "hebrew" ? "TAHOT" : "TAGNT";
}

export function tokenGlossEn(token: OriginalTokenDto): string | undefined {
  return token.glossEn?.trim() || undefined;
}

export function tokenGlossPt(token: OriginalTokenDto): string | undefined {
  return resolveTokenGlossPt(token.glossEn, token.glossPt);
}

/** Gloss inglês do léxico STEP — referência primária */
export function tokenGloss(token: OriginalTokenDto): string {
  return tokenGlossEn(token) ?? tokenGlossPt(token) ?? token.lemma ?? "—";
}

/** Linha inglesa completa do versículo (glosses STEP em ordem) */
export function buildVerseEnglishLine(tokens: OriginalTokenDto[]): string {
  return tokens
    .map((t) => tokenGlossEn(t) ?? tokenGlossPt(t))
    .filter((g): g is string => Boolean(g?.trim()))
    .join(" ");
}

/** Linha portuguesa completa do versículo (glosses PT em ordem) */
export function buildVersePortugueseLine(tokens: OriginalTokenDto[]): string {
  return tokens
    .map((t) => tokenGlossPt(t))
    .filter((g): g is string => Boolean(g?.trim()))
    .join(" ");
}

/** Formato STEPBible: נִיחֹחַ (ni.cho.ach) soothing (H5207) */
export function formatTokenStudyLine(token: OriginalTokenDto): string {
  const glossEn = tokenGlossEn(token);
  let line = token.surfaceForm;
  if (token.transliteration) line += ` (${token.transliteration})`;
  if (glossEn) line += ` ${glossEn}`;
  else if (token.glossPt) line += ` ${token.glossPt}`;
  else if (token.lemma) line += ` ${token.lemma}`;
  if (token.strongNumber) line += ` (${token.strongNumber})`;
  return line;
}
