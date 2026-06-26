import { createReadStream } from "fs";
import { createInterface } from "readline";
import type { Prisma, PrismaClient } from "@prisma/client";
import { join } from "path";
import { parseTagntLine, tagntLineMatchesFilter, type StepTagntToken, type TagntFilter } from "./tagnt-parser.js";
import { parseTahotLine, tahotLineMatchesFilter, type StepTahotToken, type TahotFilter } from "./tahot-parser.js";
import { parseTbesgLine } from "./tbesg-parser.js";
import { parseTbeshLine } from "./tbesh-parser.js";
import { expandMorphology, loadGreekMorphologyMap } from "./tegmc-parser.js";
import { getRepoRoot } from "./index.js";

export const STEP_DATA_ROOT = "data/raw/stepbible";
export const STEP_LICENSE = "CC BY 4.0 — STEPBible.org / Tyndale House Cambridge";

export interface StepImportResult {
  tokens: number;
  created: number;
  skipped: number;
  bookOsisId?: string;
  chapter?: number;
}

export interface TbesgImportResult {
  entries: number;
  created: number;
  updated: number;
}

export interface TbeshImportResult {
  entries: number;
  created: number;
  updated: number;
}

async function streamTahotFile(
  filePath: string,
  onToken: (token: StepTahotToken) => void | Promise<void>,
  filter?: TahotFilter
): Promise<number> {
  const rl = createInterface({ input: createReadStream(filePath, { encoding: "utf-8" }), crlfDelay: Infinity });
  let count = 0;

  for await (const line of rl) {
    const token = parseTahotLine(line);
    if (!token || !tahotLineMatchesFilter(token, filter)) continue;
    await onToken(token);
    count++;
  }

  return count;
}

async function streamTagntFile(
  filePath: string,
  onToken: (token: StepTagntToken) => void | Promise<void>,
  filter?: TagntFilter
): Promise<number> {
  const rl = createInterface({ input: createReadStream(filePath, { encoding: "utf-8" }), crlfDelay: Infinity });
  let count = 0;

  for await (const line of rl) {
    const token = parseTagntLine(line);
    if (!token || !tagntLineMatchesFilter(token, filter)) continue;
    await onToken(token);
    count++;
  }

  return count;
}

export async function importTagntFromFile(
  prisma: PrismaClient,
  filePath: string,
  options?: {
    filter?: TagntFilter;
    morphMap?: Map<string, string>;
    clearScope?: TagntFilter;
  }
): Promise<StepImportResult> {
  const filter = options?.filter;
  const morphMap = options?.morphMap;
  const clear = options?.clearScope ?? filter;

  if (clear?.bookOsisId) {
    await prisma.originalToken.deleteMany({
      where: {
        sourceDataset: "TAGNT",
        bookId: clear.bookOsisId,
        ...(clear.chapter != null ? { chapter: clear.chapter } : {}),
        ...(clear.verse != null ? { verse: clear.verse } : {}),
      },
    });
  }

  const batch: Prisma.OriginalTokenCreateManyInput[] = [];
  let created = 0;
  const BATCH = 500;

  const flush = async () => {
    if (batch.length === 0) return;
    const result = await prisma.originalToken.createMany({ data: [...batch] });
    created += result.count;
    batch.length = 0;
  };

  const total = await streamTagntFile(filePath, async (t) => {
    batch.push({
      testament: "NT",
      sourceText: "TAGNT",
      sourceDataset: "TAGNT",
      bookId: t.bookOsisId,
      chapter: t.chapter,
      verse: t.verse,
      tokenOrder: t.tokenOrder,
      surfaceForm: t.surfaceForm,
      lemma: t.lemma,
      strongNumber: t.strongNumber,
      extendedStrong: t.extendedStrong,
      morphologyCode: t.morphologyCode,
      morphologyExpanded: expandMorphology(t.morphologyCode, morphMap ?? new Map()),
      transliteration: t.transliteration,
      glossEn: t.glossEn ?? t.dictionaryGloss,
      glossPt: t.glossPt,
    });
    if (batch.length >= BATCH) await flush();
  }, filter);

  await flush();

  return {
    tokens: total,
    created,
    skipped: total - created,
    bookOsisId: filter?.bookOsisId,
    chapter: filter?.chapter,
  };
}

export async function importTbesgFromFile(
  prisma: PrismaClient,
  filePath: string,
  options?: { limit?: number }
): Promise<TbesgImportResult> {
  const rl = createInterface({ input: createReadStream(filePath, { encoding: "utf-8" }), crlfDelay: Infinity });
  let entries = 0;
  let created = 0;
  let updated = 0;
  const limit = options?.limit;

  for await (const line of rl) {
    if (limit != null && entries >= limit) break;
    const entry = parseTbesgLine(line);
    if (!entry) continue;
    entries++;

    const strongNumber = entry.eStrong;
    const existing = await prisma.lexiconEntry.findFirst({ where: { strongNumber } });

    const data = {
      language: "greek",
      strongNumber,
      lemma: entry.lemma,
      transliteration: entry.transliteration,
      shortDefinition: entry.gloss || entry.lemma,
      extendedDefinition: entry.definition.slice(0, 8000) || undefined,
      semanticDomain: entry.morphology || undefined,
      source: "TBESG-STEPBible",
      license: STEP_LICENSE,
    };

    if (existing) {
      await prisma.lexiconEntry.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.lexiconEntry.create({ data });
      created++;
    }
  }

  return { entries, created, updated };
}

export async function importTahotFromFile(
  prisma: PrismaClient,
  filePath: string,
  options?: {
    filter?: TahotFilter;
    morphMap?: Map<string, string>;
    clearScope?: TahotFilter;
  }
): Promise<StepImportResult> {
  const filter = options?.filter;
  const morphMap = options?.morphMap;
  const clear = options?.clearScope ?? filter;

  if (clear?.bookOsisId) {
    await prisma.originalToken.deleteMany({
      where: {
        sourceDataset: "TAHOT",
        bookId: clear.bookOsisId,
        ...(clear.chapter != null ? { chapter: clear.chapter } : {}),
        ...(clear.verse != null ? { verse: clear.verse } : {}),
      },
    });
  }

  const batch: Prisma.OriginalTokenCreateManyInput[] = [];
  let created = 0;
  const BATCH = 500;

  const flush = async () => {
    if (batch.length === 0) return;
    const result = await prisma.originalToken.createMany({ data: [...batch] });
    created += result.count;
    batch.length = 0;
  };

  const total = await streamTahotFile(filePath, async (t) => {
    batch.push({
      testament: "OT",
      sourceText: "TAHOT",
      sourceDataset: "TAHOT",
      bookId: t.bookOsisId,
      chapter: t.chapter,
      verse: t.verse,
      tokenOrder: t.tokenOrder,
      surfaceForm: t.surfaceForm,
      lemma: t.lemma,
      strongNumber: t.strongNumber,
      extendedStrong: t.extendedStrong,
      morphologyCode: t.morphologyCode,
      morphologyExpanded: expandMorphology(t.morphologyCode, morphMap ?? new Map()),
      transliteration: t.transliteration,
      glossEn: t.glossEn,
      glossPt: t.glossPt,
    });
    if (batch.length >= BATCH) await flush();
  }, filter);

  await flush();

  return {
    tokens: total,
    created,
    skipped: total - created,
    bookOsisId: filter?.bookOsisId,
    chapter: filter?.chapter,
  };
}

export async function importTbeshFromFile(
  prisma: PrismaClient,
  filePath: string,
  options?: { limit?: number }
): Promise<TbeshImportResult> {
  const rl = createInterface({ input: createReadStream(filePath, { encoding: "utf-8" }), crlfDelay: Infinity });
  let entries = 0;
  let created = 0;
  let updated = 0;
  const limit = options?.limit;

  for await (const line of rl) {
    if (limit != null && entries >= limit) break;
    const entry = parseTbeshLine(line);
    if (!entry) continue;
    entries++;

    const strongNumber = entry.eStrong;
    const existing = await prisma.lexiconEntry.findFirst({ where: { strongNumber } });

    const data = {
      language: "hebrew",
      strongNumber,
      lemma: entry.lemma,
      transliteration: entry.transliteration,
      shortDefinition: entry.gloss || entry.lemma,
      extendedDefinition: entry.definition.slice(0, 8000) || undefined,
      semanticDomain: entry.morphology || undefined,
      source: "TBESH-STEPBible",
      license: STEP_LICENSE,
    };

    if (existing) {
      await prisma.lexiconEntry.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.lexiconEntry.create({ data });
      created++;
    }
  }

  return { entries, created, updated };
}

export async function ensureStepContentLicense(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.contentLicense.findFirst({
    where: { workName: "STEPBible-Data" },
  });
  if (existing) return;

  await prisma.contentLicense.create({
    data: {
      workName: "STEPBible-Data",
      author: "STEPBible.org / Tyndale House Cambridge",
      origin: "github.com/STEPBible/STEPBible-Data",
      sourceUrl: "https://github.com/STEPBible/STEPBible-Data",
      licenseType: "CC BY 4.0",
      commercialAllowed: true,
      redistributionAllowed: false,
      localStorageAllowed: true,
      attributionRequired: true,
      status: "LICENSE_OK_CC_BY",
      notes: "Dados locais via fork audiorobson/STEPBible-Data. Atribuição obrigatória na UI.",
    },
  });
}

export function resolveStepDataPath(relativePath: string): string {
  return join(getRepoRoot(), STEP_DATA_ROOT, relativePath);
}
