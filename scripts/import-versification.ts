#!/usr/bin/env tsx
/**
 * Importador TVTMS (STEPBible versification)
 * pnpm import:versification
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { parseTvtmsPairwiseMappings, importVersificationPairs } from "@mrb/versification-engine";
import { ensureStepContentLicense } from "@mrb/content-importers";

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

const TVTMS_FILE = join(
  "data/raw/stepbible",
  "Versification",
  "TVTMS - Translators Versification Traditions with Methodology for Standardisation for Eng+Heb+Lat+Grk+Others - STEPBible.org CC BY.txt"
);

async function main() {
  const filePath = join(process.cwd(), TVTMS_FILE);
  console.log("📖 Importação TVTMS — versificação English ↔ Hebrew/Greek\n");

  await ensureStepContentLicense(prisma);

  const pairs = await parseTvtmsPairwiseMappings(filePath);
  console.log(`   ${pairs.length} pares parseados`);

  const result = await importVersificationPairs(prisma, pairs);
  console.log(`✅ ${result.created} mapeamentos importados (${result.skipped} ignorados)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
