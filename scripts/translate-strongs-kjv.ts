#!/usr/bin/env tsx
/**
 * Tradutor Strong's KJV (EN → PT) — Move Reino Bible
 *
 * pnpm translate:strongs-kjv --all
 * pnpm translate:strongs-kjv --file data/strong/KJV-Strongs-Greek-Concordance.md
 */

import { readFileSync, existsSync } from "fs";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, basename } from "path";
import {
  parseKjvStrongsMarkdown,
  exportKjvStrongsToMarkdown,
  type StrongsMdEntry,
} from "@mrb/content-importers";
import { translateEnToPtBatch, getDefaultCachePath } from "@mrb/md-translator";

const REPO = process.cwd();

const SOURCES = [
  {
    input: "data/strong/KJV-Strongs-Hebrew-Concordance (1).md",
    output: "data/strong/sources/kjv-strongs-hebrew-pt.md",
    title: "Strong's Hebrew Concordance (KJV) — Português",
    source: "Christian Resource Center-NH / KJV Strong's",
  },
  {
    input: "data/strong/KJV-Strongs-Greek-Concordance.md",
    output: "data/strong/sources/kjv-strongs-greek-pt.md",
    title: "Strong's Greek Concordance (KJV) — Português",
    source: "Christian Resource Center-NH / KJV Strong's",
  },
];

function loadEnvFile() {
  const envPath = join(REPO, ".env");
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

async function translateEntries(
  entries: StrongsMdEntry[],
  cachePath: string
): Promise<StrongsMdEntry[]> {
  console.log(`  🌐 Traduzindo ${entries.length} definições EN → PT...`);
  const definitions = entries.map((e) => e.shortDefinition);
  const translated = await translateEnToPtBatch(definitions, {
    cachePath,
    batchSize: 15,
    delayMs: 500,
  });

  return entries.map((e, i) => ({
    ...e,
    shortDefinition: translated[i] ?? e.shortDefinition,
  }));
}

async function processFile(spec: (typeof SOURCES)[0], cachePath: string) {
  const inputPath = join(REPO, spec.input);
  const outputPath = join(REPO, spec.output);

  if (!existsSync(inputPath)) {
    console.error(`❌ Arquivo não encontrado: ${spec.input}`);
    return;
  }

  console.log(`\n📂 ${basename(spec.input)}`);
  const raw = await readFile(inputPath, "utf-8");
  const entries = parseKjvStrongsMarkdown(raw);
  console.log(`  📖 ${entries.length} entradas Strong detectadas`);

  if (entries.length === 0) {
    console.error("  ❌ Nenhuma entrada parseada");
    return;
  }

  const translated = await translateEntries(entries, cachePath);
  const md = exportKjvStrongsToMarkdown(translated, {
    title: spec.title,
    source: spec.source,
  });

  await mkdir(join(outputPath, ".."), { recursive: true });
  await writeFile(outputPath, md, "utf-8");
  console.log(`  ✅ Salvo: ${spec.output}`);
}

async function main() {
  loadEnvFile();
  const args = process.argv.slice(2);
  const cachePath = getDefaultCachePath(REPO);

  console.log("🌍 Move Reino Bible — Tradutor Strong's KJV (EN → PT)\n");

  if (args.includes("--all")) {
    for (const spec of SOURCES) {
      await processFile(spec, cachePath);
    }
    console.log("\n✨ Tradução concluída. Execute: pnpm import:strongs --all");
    return;
  }

  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1) {
    const filePath = args[fileIdx + 1];
    const spec = SOURCES.find((s) => s.input === filePath || filePath?.endsWith(basename(s.input)));
    if (!spec) {
      const custom = {
        input: filePath!,
        output: filePath!.replace(/\.md$/i, "-pt.md"),
        title: "Strong's KJV — Português",
        source: "KJV Strong's",
      };
      await processFile(custom, cachePath);
    } else {
      await processFile(spec, cachePath);
    }
    return;
  }

  console.log(`
Uso:
  pnpm translate:strongs-kjv --all
  pnpm translate:strongs-kjv --file <caminho.md>

Add-on: @mrb/md-translator (EN → PT para textos .md)
`);
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
