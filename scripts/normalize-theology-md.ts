#!/usr/bin/env tsx
/**
 * Normaliza Markdown CCEL (teologia sistemática) para formato RAG/Biblioteca.
 *
 * pnpm normalize:theology --file "data/rag/sources/systematic/Divindade Doutrinária_Gill, John (1697-1771).MD"
 * pnpm normalize:theology --file <entrada> --out <saida.md> --slug gill-divindade-doutrinaria
 */

import { existsSync } from "fs";
import { join } from "path";
import { normalizeTheologyFile, writeTheologyChaptersDir, writeTheologyTocFile } from "@mrb/content-importers";

async function main() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  if (fileIdx === -1 || !args[fileIdx + 1]) {
    console.log(`
Uso:
  pnpm normalize:theology --file <caminho.md> [--out <saida.md>] [--slug <id>]
`);
    process.exit(1);
  }

  const inputPath = args[fileIdx + 1]!;
  if (!existsSync(inputPath)) {
    console.error(`Arquivo não encontrado: ${inputPath}`);
    process.exit(1);
  }

  const outIdx = args.indexOf("--out");
  const slugIdx = args.indexOf("--slug");
  const slug = slugIdx !== -1 ? args[slugIdx + 1] : "theology-book";
  const outputPath =
    outIdx !== -1
      ? args[outIdx + 1]!
      : join("data/rag/sources/systematic", `${slug}.md`);

  const overrides: Record<string, string> = { slug };
  if (slugIdx !== -1) overrides.slug = slug;

  console.log(`📖 Normalizando: ${inputPath}`);
  const parsed = await normalizeTheologyFile(inputPath, outputPath, overrides);
  const processedDir = join(process.cwd(), "data/rag/processed");
  await writeTheologyTocFile(processedDir, slug, parsed);
  await writeTheologyChaptersDir(processedDir, slug, parsed.chapters);

  console.log(`✅ Markdown normalizado: ${outputPath}`);
  console.log(`   ${parsed.volumes.length} livros, ${parsed.chapters.length} capítulos`);
  console.log(`   Índice: data/rag/processed/${slug}-toc.json`);
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
