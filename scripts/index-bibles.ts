#!/usr/bin/env tsx
/**
 * Indexação bíblica — exporta JSON + Meilisearch
 *
 * Uso:
 *   pnpm index:bibles
 *   pnpm index:bibles --versions BLIVRE,BSB
 *   pnpm index:bibles --json-only
 *   pnpm index:bibles --list
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import {
  indexBiblesFromDatabase,
  MeilisearchBibleClient,
} from "@mrb/search-engine";

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

function printHelp() {
  console.log(`
Move Reino Bible — Indexação de versículos

Comandos:
  (padrão)              Exporta JSON + indexa no Meilisearch
  --json-only           Apenas exporta arquivos JSON em data/bibles/index/
  --versions A,B        Indexa versões específicas (ex: BLIVRE,BSB,WEB,KJV)
  --include-demo        Inclui versão DEMO do seed
  --list                Lista versões no banco
  --help                Esta ajuda
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    printHelp();
    return;
  }

  if (args.includes("--list")) {
    const versions = await prisma.bibleVersion.findMany({
      orderBy: { abbreviation: "asc" },
      include: { _count: { select: { verses: true } } },
    });
    console.log("\n📚 Versões no banco:\n");
    for (const v of versions) {
      console.log(`  ${v.abbreviation.padEnd(8)} ${v._count.verses.toString().padStart(6)} versículos — ${v.name}`);
    }
    return;
  }

  const jsonOnly = args.includes("--json-only");
  const includeDemo = args.includes("--include-demo");
  const versionsIdx = args.indexOf("--versions");
  const versions =
    versionsIdx !== -1 && args[versionsIdx + 1]
      ? args[versionsIdx + 1]!.split(",").map((v) => v.trim())
      : undefined;

  const meiliUrl = process.env.MEILISEARCH_URL ?? "http://localhost:7700";
  const meiliKey = process.env.MEILISEARCH_API_KEY ?? "masterKey";

  let meilisearch: MeilisearchBibleClient | undefined;
  if (!jsonOnly) {
    meilisearch = new MeilisearchBibleClient({ url: meiliUrl, apiKey: meiliKey });
    const healthy = await meilisearch.health();
    if (!healthy) {
      console.error(`❌ Meilisearch indisponível em ${meiliUrl}`);
      console.error("   Execute: docker compose up -d meilisearch");
      process.exit(1);
    }
  }

  console.log("🔎 Move Reino Bible — Indexação bíblica\n");

  const result = await indexBiblesFromDatabase(prisma, {
    versions,
    skipDemo: !includeDemo,
    meilisearch,
    clearMeilisearch: !jsonOnly,
    onProgress: console.log,
  });

  console.log("\n🎉 Indexação concluída!\n");
  for (const v of result.versions) {
    console.log(`   ${v.abbreviation}: ${v.documents} versículos`);
  }
  if (result.meilisearchStats) {
    console.log(`\n   Meilisearch total: ${result.meilisearchStats.numberOfDocuments} documentos`);
  }
}

main()
  .catch((err) => {
    console.error("Erro:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
