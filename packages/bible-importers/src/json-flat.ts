import { z } from "zod";
import { normalizeText } from "@mrb/bible-core";
import type { LicenseStatus } from "@mrb/shared-types";
import { normalizeBookOsisId } from "./book-map.js";
import type { ImportValidationResult, StandardBibleImport } from "./types.js";

export const jsonVerseSchema = z.object({
  book: z.string(),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive(),
  text: z.string().min(1),
});

export const jsonBibleSchema = z.object({
  version: z.object({
    name: z.string(),
    abbreviation: z.string(),
    language: z.string(),
    licenseType: z.string() as z.ZodType<LicenseStatus>,
    licenseUrl: z.string().optional(),
    sourceUrl: z.string().optional(),
    copyrightStatus: z.string().optional(),
    isPublicDomain: z.boolean().optional().default(false),
    isCommercialAllowed: z.boolean().optional().default(true),
    attributionRequired: z.boolean().optional().default(false),
    notes: z.string().optional(),
  }),
  verses: z.array(jsonVerseSchema),
});

export type JsonBibleFile = z.infer<typeof jsonBibleSchema>;

export function parseJsonFlat(input: string | Buffer): StandardBibleImport {
  const raw = typeof input === "string" ? input : input.toString("utf-8");
  const parsed = jsonBibleSchema.parse(JSON.parse(raw) as unknown);

  return {
    version: {
      ...parsed.version,
      copyrightStatus: parsed.version.copyrightStatus ?? parsed.version.licenseType,
    },
    verses: parsed.verses.map((v) => ({
      bookOsisId: normalizeBookOsisId(v.book),
      chapter: v.chapter,
      verse: v.verse,
      text: v.text.trim(),
    })),
  };
}

export function validateImport(data: StandardBibleImport): ImportValidationResult {
  const errors: string[] = [];
  let skipped = 0;

  for (const v of data.verses) {
    if (!v.text.trim()) {
      errors.push(`Versículo vazio: ${v.bookOsisId} ${v.chapter}:${v.verse}`);
      skipped++;
      continue;
    }
    if (!normalizeText(v.text)) {
      errors.push(`Texto inválido: ${v.bookOsisId} ${v.chapter}:${v.verse}`);
      skipped++;
    }
  }

  return {
    versionAbbreviation: data.version.abbreviation,
    versesImported: data.verses.length - skipped,
    versesSkipped: skipped,
    errors,
  };
}
