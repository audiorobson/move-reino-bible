#!/usr/bin/env tsx
/**
 * Importador Strong's — Move Reino Bible
 *
 * pnpm import:strongs --file data/strong/sources/strongs.template.md
 * pnpm import:strongs --all
 * pnpm import:strongs --list
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import {
  importStrongsFromFile,
  loadJsonManifest,
  type StrongsManifest,
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

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--list")) {
    const manifest = await loadJsonManifest<StrongsManifest>("data/strong/manifest.json");
    console.log("\n📖 Fontes Strong no manifest:\n");
    for (const s of manifest.sources) {
      console.log(`  ${s.file} — ${s.enabled ? "ativa" : "inativa"} — ${s.description ?? ""}`);
    }
    console.log(`\nFormato: data/strong/STRONGS_FORMAT.md`);
    return;
  }

  console.log("📚 Move Reino Bible — Importação Strong's\n");

  if (args.includes("--all")) {
    const manifest = await loadJsonManifest<StrongsManifest>("data/strong/manifest.json");
    const enabled = manifest.sources.filter((s) => s.enabled);
    for (const source of enabled) {
      const filePath = join(process.cwd(), manifest.sourcesDirectory, source.file);
      console.log(`\n📂 ${filePath}`);
      const result = await importStrongsFromFile(prisma, filePath);
      console.log(`✅ ${result.entries} entradas (${result.created} novas, ${result.updated} atualizadas)`);
    }
    return;
  }

  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1) {
    const filePath = args[fileIdx + 1];
    if (!filePath) {
      console.error("Informe: --file data/strong/sources/strongs-complete.md");
      process.exit(1);
    }
    const result = await importStrongsFromFile(prisma, filePath);
    console.log(`✅ ${result.entries} entradas (${result.created} novas, ${result.updated} atualizadas)`);
    return;
  }

  console.log(`
Uso:
  pnpm import:strongs --file <caminho.md>
  pnpm import:strongs --all
  pnpm import:strongs --list
`);
}

main()
  .catch((err) => {
    console.error("Erro:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
