#!/usr/bin/env tsx
/**
 * Importador STEPBible-Data — Move Reino Bible
 *
 * pnpm import:step --dataset TAGNT --book John --chapter 1
 * pnpm import:step --dataset TBESG --limit 500
 * pnpm import:step --sample-john1
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import {
  importTagntFromFile,
  importTahotFromFile,
  importTbesgFromFile,
  importTbeshFromFile,
  ensureStepContentLicense,
  resolveStepDataPath,
  loadGreekMorphologyMap,
} from "@mrb/content-importers";

function loadEnvFile() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();
const prisma = new PrismaClient();

const TAGNT_FILE = join(
  "Translators Amalgamated OT+NT",
  "TAGNT Mat-Jhn - Translators Amalgamated Greek NT - STEPBible.org CC-BY.txt"
);
const TAGNT_ACT_REV_FILE = join(
  "Translators Amalgamated OT+NT",
  "TAGNT Act-Rev - Translators Amalgamated Greek NT - STEPBible.org CC-BY.txt"
);
const TBESG_FILE = join(
  "Lexicons",
  "TBESG - Translators Brief lexicon of Extended Strongs for Greek - STEPBible.org CC BY.txt"
);
const TEGMC_FILE = join(
  "Morphology codes",
  "TEGMC - Translators Expansion of Greek Morphhology Codes - STEPBible.org CC BY.txt"
);
const TEHMC_FILE = join(
  "Morphology codes",
  "TEHMC - Translators Expansion of Hebrew Morphology Codes - STEPBible.org CC BY.txt"
);
const TAHOT_GEN_DEU_FILE = join(
  "Translators Amalgamated OT+NT",
  "TAHOT Gen-Deu - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt"
);
const TAHOT_JOS_EST_FILE = join(
  "Translators Amalgamated OT+NT",
  "TAHOT Jos-Est - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt"
);
const TAHOT_JOB_SNG_FILE = join(
  "Translators Amalgamated OT+NT",
  "TAHOT Job-Sng - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt"
);
const TAHOT_ISA_MAL_FILE = join(
  "Translators Amalgamated OT+NT",
  "TAHOT Isa-Mal - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt"
);
const TBESH_FILE = join(
  "Lexicons",
  "TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt"
);

const MAT_JHN_BOOKS = ["Matt", "Mark", "Luke", "John"] as const;
const ACT_REV_BOOKS = [
  "Acts",
  "Rom",
  "1Cor",
  "2Cor",
  "Gal",
  "Eph",
  "Phil",
  "Col",
  "1Thess",
  "2Thess",
  "1Tim",
  "2Tim",
  "Titus",
  "Phlm",
  "Heb",
  "Jas",
  "1Pet",
  "2Pet",
  "1John",
  "2John",
  "3John",
  "Jude",
  "Rev",
] as const;

const GEN_DEU_BOOKS = ["Gen", "Exod", "Lev", "Num", "Deut"] as const;
const JOS_EST_BOOKS = [
  "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs",
  "1Chr", "2Chr", "Ezra", "Neh", "Esth",
] as const;
const JOB_SNG_BOOKS = ["Job", "Ps", "Prov", "Eccl", "Song"] as const;
const ISA_MAL_BOOKS = [
  "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah",
  "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal",
] as const;

async function loadMorphMaps() {
  const greek = await loadGreekMorphologyMap(resolveStepDataPath(TEGMC_FILE));
  const hebrew = await loadGreekMorphologyMap(resolveStepDataPath(TEHMC_FILE));
  return new Map([...greek, ...hebrew]);
}

async function importTagntBooks(
  prisma: PrismaClient,
  filePath: string,
  books: readonly string[],
  morphMap: Awaited<ReturnType<typeof loadGreekMorphologyMap>>
) {
  for (const book of books) {
    const result = await importTagntFromFile(prisma, filePath, {
      filter: { bookOsisId: book },
      clearScope: { bookOsisId: book },
      morphMap,
    });
    console.log(`✅ ${book}: ${result.created} tokens`);
  }
}

async function importTahotBooks(
  prisma: PrismaClient,
  filePath: string,
  books: readonly string[],
  morphMap: Map<string, string>
) {
  for (const book of books) {
    const result = await importTahotFromFile(prisma, filePath, {
      filter: { bookOsisId: book },
      clearScope: { bookOsisId: book },
      morphMap,
    });
    console.log(`✅ ${book}: ${result.created} tokens`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  await ensureStepContentLicense(prisma);

  if (args.includes("--sample-gen1")) {
    console.log("📖 Importação amostra: Gênesis 1 (TAHOT) + TBESH (500 entradas)\n");
    const morphMap = await loadMorphMaps();
    const tahot = await importTahotFromFile(prisma, resolveStepDataPath(TAHOT_GEN_DEU_FILE), {
      filter: { bookOsisId: "Gen", chapter: 1 },
      clearScope: { bookOsisId: "Gen", chapter: 1 },
      morphMap,
    });
    console.log(`✅ TAHOT Gênesis 1: ${tahot.created} tokens`);
    const tbesh = await importTbeshFromFile(prisma, resolveStepDataPath(TBESH_FILE), { limit: 500 });
    console.log(`✅ TBESH: ${tbesh.entries} entradas (${tbesh.created} novas, ${tbesh.updated} atualizadas)`);
    return;
  }

  if (args.includes("--gen-deu")) {
    console.log("📖 Importação TAHOT: Gênesis a Deuteronômio\n");
    const morphMap = await loadMorphMaps();
    await importTahotBooks(prisma, resolveStepDataPath(TAHOT_GEN_DEU_FILE), GEN_DEU_BOOKS, morphMap);
    const tbesh = await importTbeshFromFile(prisma, resolveStepDataPath(TBESH_FILE));
    console.log(`✅ TBESH completo: ${tbesh.entries} entradas (${tbesh.created} novas, ${tbesh.updated} atualizadas)`);
    return;
  }

  if (args.includes("--full-ot")) {
    console.log("📖 Importação TAHOT: Antigo Testamento completo\n");
    const morphMap = await loadMorphMaps();
    console.log("— Pentateuco —");
    await importTahotBooks(prisma, resolveStepDataPath(TAHOT_GEN_DEU_FILE), GEN_DEU_BOOKS, morphMap);
    console.log("\n— Históricos —");
    await importTahotBooks(prisma, resolveStepDataPath(TAHOT_JOS_EST_FILE), JOS_EST_BOOKS, morphMap);
    console.log("\n— Poéticos —");
    await importTahotBooks(prisma, resolveStepDataPath(TAHOT_JOB_SNG_FILE), JOB_SNG_BOOKS, morphMap);
    console.log("\n— Profetas —");
    await importTahotBooks(prisma, resolveStepDataPath(TAHOT_ISA_MAL_FILE), ISA_MAL_BOOKS, morphMap);
    const tbesh = await importTbeshFromFile(prisma, resolveStepDataPath(TBESH_FILE));
    console.log(`\n✅ TBESH completo: ${tbesh.entries} entradas (${tbesh.created} novas, ${tbesh.updated} atualizadas)`);
    return;
  }

  if (args.includes("--full-nt")) {
    console.log("📖 Importação TAGNT: Novo Testamento completo (Mat-Rev)\n");
    const morphMap = await loadGreekMorphologyMap(resolveStepDataPath(TEGMC_FILE));
    console.log("— Evangelhos (Mat-Jhn) —");
    await importTagntBooks(prisma, resolveStepDataPath(TAGNT_FILE), MAT_JHN_BOOKS, morphMap);
    console.log("\n— Epístolas e Apocalipse (Act-Rev) —");
    await importTagntBooks(prisma, resolveStepDataPath(TAGNT_ACT_REV_FILE), ACT_REV_BOOKS, morphMap);
    const tbesg = await importTbesgFromFile(prisma, resolveStepDataPath(TBESG_FILE));
    console.log(`\n✅ TBESG completo: ${tbesg.entries} entradas (${tbesg.created} novas, ${tbesg.updated} atualizadas)`);
    return;
  }

  if (args.includes("--act-rev")) {
    console.log("📖 Importação TAGNT: Atos até Apocalipse (arquivo Act-Rev)\n");
    const morphMap = await loadGreekMorphologyMap(resolveStepDataPath(TEGMC_FILE));
    await importTagntBooks(prisma, resolveStepDataPath(TAGNT_ACT_REV_FILE), ACT_REV_BOOKS, morphMap);
    return;
  }

  if (args.includes("--mat-jhn")) {
    console.log("📖 Importação TAGNT: Mateus, Marcos, Lucas e João (arquivo Mat-Jhn)\n");
    const morphMap = await loadGreekMorphologyMap(resolveStepDataPath(TEGMC_FILE));
    await importTagntBooks(prisma, resolveStepDataPath(TAGNT_FILE), MAT_JHN_BOOKS, morphMap);
    const tbesg = await importTbesgFromFile(prisma, resolveStepDataPath(TBESG_FILE));
    console.log(`✅ TBESG completo: ${tbesg.entries} entradas (${tbesg.created} novas, ${tbesg.updated} atualizadas)`);
    return;
  }

  if (args.includes("--sample-john1")) {
    console.log("📖 Importação amostra: João 1 (TAGNT) + TBESG (500 entradas)\n");
    const morphMap = await loadGreekMorphologyMap(resolveStepDataPath(TEGMC_FILE));
    const tagnt = await importTagntFromFile(prisma, resolveStepDataPath(TAGNT_FILE), {
      filter: { bookOsisId: "John", chapter: 1 },
      clearScope: { bookOsisId: "John", chapter: 1 },
      morphMap,
    });
    console.log(`✅ TAGNT João 1: ${tagnt.created} tokens`);
    const tbesg = await importTbesgFromFile(prisma, resolveStepDataPath(TBESG_FILE), {
      limit: 500,
    });
    console.log(`✅ TBESG: ${tbesg.entries} entradas (${tbesg.created} novas, ${tbesg.updated} atualizadas)`);
    return;
  }

  const datasetIdx = args.indexOf("--dataset");
  const dataset = datasetIdx !== -1 ? args[datasetIdx + 1] : undefined;

  if (dataset === "TAGNT") {
    const bookIdx = args.indexOf("--book");
    const chapterIdx = args.indexOf("--chapter");
    const book = bookIdx !== -1 ? args[bookIdx + 1] : undefined;
    const chapter = chapterIdx !== -1 ? parseInt(args[chapterIdx + 1]!, 10) : undefined;
    const morphMap = await loadGreekMorphologyMap(resolveStepDataPath(TEGMC_FILE));
    const filter = book ? { bookOsisId: book, ...(chapter != null && !Number.isNaN(chapter) ? { chapter } : {}) } : undefined;
    const result = await importTagntFromFile(prisma, resolveStepDataPath(TAGNT_FILE), {
      filter,
      clearScope: filter,
      morphMap,
    });
    console.log(`✅ TAGNT: ${result.created} tokens importados`);
    return;
  }

  if (dataset === "TBESG") {
    const limitIdx = args.indexOf("--limit");
    const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1]!, 10) : undefined;
    const result = await importTbesgFromFile(prisma, resolveStepDataPath(TBESG_FILE), {
      limit,
    });
    console.log(`✅ TBESG: ${result.entries} entradas (${result.created} novas, ${result.updated} atualizadas)`);
    return;
  }

  if (dataset === "TAHOT") {
    const bookIdx = args.indexOf("--book");
    const chapterIdx = args.indexOf("--chapter");
    const book = bookIdx !== -1 ? args[bookIdx + 1] : undefined;
    const chapter = chapterIdx !== -1 ? parseInt(args[chapterIdx + 1]!, 10) : undefined;
    const morphMap = await loadMorphMaps();
    const filter = book ? { bookOsisId: book, ...(chapter != null && !Number.isNaN(chapter) ? { chapter } : {}) } : undefined;
    const file =
      book && GEN_DEU_BOOKS.includes(book as (typeof GEN_DEU_BOOKS)[number])
        ? TAHOT_GEN_DEU_FILE
        : book && JOS_EST_BOOKS.includes(book as (typeof JOS_EST_BOOKS)[number])
          ? TAHOT_JOS_EST_FILE
          : book && JOB_SNG_BOOKS.includes(book as (typeof JOB_SNG_BOOKS)[number])
            ? TAHOT_JOB_SNG_FILE
            : TAHOT_ISA_MAL_FILE;
    const result = await importTahotFromFile(prisma, resolveStepDataPath(file), {
      filter,
      clearScope: filter,
      morphMap,
    });
    console.log(`✅ TAHOT: ${result.created} tokens importados`);
    return;
  }

  if (dataset === "TBESH") {
    const limitIdx = args.indexOf("--limit");
    const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1]!, 10) : undefined;
    const result = await importTbeshFromFile(prisma, resolveStepDataPath(TBESH_FILE), { limit });
    console.log(`✅ TBESH: ${result.entries} entradas (${result.created} novas, ${result.updated} atualizadas)`);
    return;
  }

  console.log(`
Uso:
  pnpm import:step --sample-john1
  pnpm import:step --sample-gen1
  pnpm import:step --mat-jhn
  pnpm import:step --act-rev
  pnpm import:step --full-nt
  pnpm import:step --gen-deu
  pnpm import:step --full-ot
  pnpm import:step --dataset TAGNT --book John
  pnpm import:step --dataset TAHOT --book Gen --chapter 1
  pnpm import:step --dataset TBESG --limit 500
  pnpm import:step --dataset TBESH --limit 500
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
