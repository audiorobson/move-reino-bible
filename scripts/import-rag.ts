#!/usr/bin/env tsx
/**
 * Importador RAG teológico — Move Reino Bible
 *
 * pnpm import:rag --file data/rag/sources/example-confession.md
 * pnpm import:rag --all
 * pnpm import:rag --list
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import {
  importRagFromFile,
  loadJsonManifest,
  type RagManifest,
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
    const manifest = await loadJsonManifest<RagManifest>("data/rag/manifest.json");
    console.log("\n📚 Fontes RAG no manifest:\n");
    for (const s of manifest.sources) {
      console.log(`  ${s.file} — ${s.enabled ? "ativa" : "inativa"} — ${s.title ?? ""}`);
    }
    return;
  }

  console.log("🔎 Move Reino Bible — Importação RAG\n");

  if (args.includes("--all")) {
    const manifest = await loadJsonManifest<RagManifest>("data/rag/manifest.json");
    const enabled = manifest.sources.filter((s) => s.enabled);
    for (const source of enabled) {
      const filePath = join(process.cwd(), manifest.sourcesDirectory, source.file);
      console.log(`\n📂 ${filePath}`);
      const meta: Record<string, string> = {};
      if (source.title) meta.title = source.title;
      if (source.author) meta.author = source.author;
      if (source.tradition) meta.tradition = source.tradition;
      if (source.language) meta.language = source.language;
      if (source.license) meta.license = source.license;
      if (source.documentType) meta.documentType = source.documentType;
      if (source.reliabilityLevel) meta.reliabilityLevel = source.reliabilityLevel;
      if (source.slug) meta.slug = source.slug;
      if (source.format) meta.format = source.format;
      if (manifest.processedDirectory) meta.processedDirectory = manifest.processedDirectory;
      const result = await importRagFromFile(prisma, filePath, meta);
      const extra =
        "chapters" in result && typeof result.chapters === "number"
          ? `, ${result.chapters} capítulos`
          : "";
      console.log(`✅ Documento ${result.documentId}: ${result.chunks} chunks${extra}`);
    }
    return;
  }

  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1) {
    const filePath = args[fileIdx + 1];
    if (!filePath) {
      console.error("Informe: --file data/rag/sources/documento.md");
      process.exit(1);
    }
    const result = await importRagFromFile(prisma, filePath);
    console.log(`✅ Documento ${result.documentId}: ${result.chunks} chunks`);
    return;
  }

  console.log(`
Uso:
  pnpm import:rag --file <caminho.md>
  pnpm import:rag --all
  pnpm import:rag --list
`);
}

main()
  .catch((err) => {
    console.error("Erro:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
