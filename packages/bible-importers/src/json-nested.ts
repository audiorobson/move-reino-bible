import { z } from "zod";
import type { LicenseStatus } from "@mrb/shared-types";
import type { BibleVersionMeta, StandardBibleImport } from "./types.js";

/** Abreviações em português (formato comum em JSONs locais) → OSIS */
export const PT_ABBREV_TO_OSIS: Record<string, string> = {
  Gn: "Gen",
  "Êx": "Exod",
  Ex: "Exod",
  Lv: "Lev",
  Nm: "Num",
  Dt: "Deut",
  Js: "Josh",
  Jz: "Judg",
  Rt: "Ruth",
  "1Sm": "1Sam",
  "2Sm": "2Sam",
  "1Rs": "1Kgs",
  "2Rs": "2Kgs",
  "1Cr": "1Chr",
  "2Cr": "2Chr",
  Ed: "Ezra",
  Ne: "Neh",
  Et: "Esth",
  "Jó": "Job",
  JO: "Job",
  Sl: "Ps",
  Pv: "Prov",
  Ec: "Eccl",
  Ct: "Song",
  Is: "Isa",
  Jr: "Jer",
  Lm: "Lam",
  Ez: "Ezek",
  Dn: "Dan",
  Os: "Hos",
  Jl: "Joel",
  Am: "Amos",
  Ob: "Obad",
  Jn: "Jonah",
  Mq: "Mic",
  Na: "Nah",
  Hc: "Hab",
  Sf: "Zeph",
  Ag: "Hag",
  Zc: "Zech",
  Ml: "Mal",
  Mt: "Matt",
  Mc: "Mark",
  Lc: "Luke",
  Jo: "John",
  At: "Acts",
  Rm: "Rom",
  "1Co": "1Cor",
  "2Co": "2Cor",
  Gl: "Gal",
  Ef: "Eph",
  Fp: "Phil",
  Cl: "Col",
  "1Ts": "1Thess",
  "2Ts": "2Thess",
  "1Tm": "1Tim",
  "2Tm": "2Tim",
  Tt: "Titus",
  Fm: "Phlm",
  Hb: "Heb",
  Tg: "Jas",
  "1Pe": "1Pet",
  "2Pe": "2Pet",
  "1Jo": "1John",
  "2Jo": "2John",
  "3Jo": "3John",
  Jd: "Jude",
  Ap: "Rev",
};

const nestedBookSchema = z.object({
  abbrev: z.string(),
  name: z.string().optional(),
  chapters: z.array(z.array(z.string())),
});

const nestedBibleSchema = z.array(nestedBookSchema);

export function ptAbbrevToOsis(abbrev: string): string {
  const key = abbrev.trim();
  const mapped = PT_ABBREV_TO_OSIS[key] ?? PT_ABBREV_TO_OSIS[key.replace(/ê/gi, "Ê")];
  if (mapped) return mapped;
  throw new Error(`Abreviação de livro desconhecida: "${abbrev}"`);
}

export function isNestedBibleFormat(parsed: unknown): boolean {
  return (
    Array.isArray(parsed) &&
    parsed.length > 0 &&
    typeof parsed[0] === "object" &&
    parsed[0] !== null &&
    "chapters" in parsed[0] &&
    Array.isArray((parsed[0] as { chapters: unknown }).chapters)
  );
}

export function parseJsonNested(
  input: string | Buffer,
  version: BibleVersionMeta
): StandardBibleImport {
  const raw = typeof input === "string" ? input : input.toString("utf-8");
  const parsed = nestedBibleSchema.parse(JSON.parse(raw) as unknown);

  const verses: StandardBibleImport["verses"] = [];

  for (const book of parsed) {
    const bookOsisId = ptAbbrevToOsis(book.abbrev);
    book.chapters.forEach((chapterVerses, chapterIndex) => {
      const chapter = chapterIndex + 1;
      chapterVerses.forEach((text, verseIndex) => {
        const trimmed = text?.trim();
        if (!trimmed) return;
        verses.push({
          bookOsisId,
          chapter,
          verse: verseIndex + 1,
          text: trimmed,
        });
      });
    });
  }

  return { version, verses };
}

export function versionFromFilename(
  filePath: string,
  overrides?: Partial<BibleVersionMeta>
): BibleVersionMeta {
  const base = filePath.replace(/\\/g, "/").split("/").pop()?.replace(/\.json$/i, "") ?? "LOCAL";
  const abbreviation = overrides?.abbreviation ?? base.toUpperCase();

  return {
    name: overrides?.name ?? abbreviation,
    abbreviation,
    language: overrides?.language ?? "pt-BR",
    licenseType: (overrides?.licenseType ?? "LICENSE_RESTRICTED_PERSONAL_USE") as LicenseStatus,
    licenseUrl: overrides?.licenseUrl,
    sourceUrl: overrides?.sourceUrl ?? `data/bibles/local/${base}.json`,
    isPublicDomain: overrides?.isPublicDomain ?? false,
    isCommercialAllowed: overrides?.isCommercialAllowed ?? false,
    attributionRequired: overrides?.attributionRequired ?? true,
    notes: overrides?.notes ?? "Importado de arquivo local — uso pessoal",
    copyrightStatus: overrides?.copyrightStatus,
  };
}
