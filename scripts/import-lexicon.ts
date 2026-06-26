#!/usr/bin/env tsx
/**
 * Importador de léxicos — Move Reino Bible
 *
 * pnpm import:lexicon --all
 * pnpm import:lexicon --file data/lexicon/The-Hebrew-and-Aramaic-lexicon...
 * pnpm import:lexicon --list
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import {
  importLexiconFromFile,
  loadJsonManifest,
  type LexiconManifest,
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
    const manifest = await loadJsonManifest<LexiconManifest>("data/lexicon/manifest.json");
    console.log("\n📖 Léxicos no manifest:\n");
    for (const s of manifest.sources) {
      console.log(`  ${s.file} — ${s.enabled ? "ativo" : "inativo"} — ${s.title ?? ""}`);
    }
    return;
  }

  console.log("📚 Move Reino Bible — Indexação de léxicos\n");

  if (args.includes("--all")) {
    const manifest = await loadJsonManifest<LexiconManifest>("data/lexicon/manifest.json");
    const enabled = manifest.sources.filter((s) => s.enabled);
    for (const source of enabled) {
      const filePath = join(process.cwd(), manifest.sourcesDirectory, source.file);
      if (!existsSync(filePath)) {
        const altPath = join(process.cwd(), "data/lexicon", source.file);
        if (!existsSync(altPath)) {
          console.error(`❌ Não encontrado: ${source.file}`);
          continue;
        }
        await importOne(altPath, source);
        continue;
      }
      await importOne(filePath, source);
    }
    return;
  }

  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1) {
    const filePath = args[fileIdx + 1];
    if (!filePath) {
      console.error("Informe: --file data/lexicon/arquivo.md");
      process.exit(1);
    }
    const abs = join(process.cwd(), filePath);
    await importOne(abs, {
      file: filePath,
      enabled: true,
      type: "markdown",
      title: filePath.split(/[/\\]/).pop()?.replace(/\.md$/i, ""),
      license: "LICENSE_OK_USER_PROVIDED",
    });
    return;
  }

  console.log(`
Uso:
  pnpm import:lexicon --all
  pnpm import:lexicon --file <caminho.md>
  pnpm import:lexicon --list
`);
}

async function importOne(
  filePath: string,
  source: LexiconManifest["sources"][0]
) {
  console.log(`\n📂 ${filePath}`);
  const sourceKey = `lexicon:${source.file}`;
  const result = await importLexiconFromFile(prisma, filePath, {
    title: source.title ?? source.file,
    author: source.author,
    language: source.language ?? "en",
    license: source.license ?? "LICENSE_OK_USER_PROVIDED",
    documentType: source.documentType ?? "lexicon",
    reliabilityLevel: source.reliabilityLevel ?? "high",
    sourceKey,
  });
  console.log(
    `✅ ${result.created ? "Indexado" : "Reindexado"}: ${result.chunks} chunks (doc ${result.documentId})`
  );
}

main()
  .catch((err) => {
    console.error("Erro:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
