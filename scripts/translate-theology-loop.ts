#!/usr/bin/env tsx
/**
 * Traduz Suma (ou outra obra) em lotes até concluir.
 */

import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { parseSummaMarkdown } from "@mrb/content-importers";

function loadProgress(slug: string): { translatedIds: string[] } {
  const path = join(process.cwd(), "data/rag/processed", `${slug}-translate-progress.json`);
  if (!existsSync(path)) return { translatedIds: [] };
  return JSON.parse(readFileSync(path, "utf-8"));
}

function countArticles(file: string, format: string): number {
  const raw = readFileSync(file, "utf-8");
  if (format === "ccel-summa") {
    return parseSummaMarkdown(raw).chapters.length;
  }
  return (raw.match(/^Capítulo /gm) ?? []).length;
}

async function main() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  const slugIdx = args.indexOf("--slug");
  const formatIdx = args.indexOf("--format");
  const batchIdx = args.indexOf("--batch");
  const maxRoundsIdx = args.indexOf("--max-rounds");

  if (fileIdx === -1 || slugIdx === -1) {
    console.log(`Uso: pnpm translate:theology:loop --file <md> --slug <id> [--format ccel-summa] [--batch 200] [--max-rounds 20]`);
    process.exit(1);
  }

  const file = args[fileIdx + 1]!;
  const slug = args[slugIdx + 1]!;
  const format = formatIdx !== -1 ? args[formatIdx + 1]! : "ccel-summa";
  const batch = batchIdx !== -1 ? Number(args[batchIdx + 1]) : 200;
  const maxRounds = maxRoundsIdx !== -1 ? Number(args[maxRoundsIdx + 1]) : 50;

  const total = countArticles(file, format);
  console.log(`🔄 Tradução em loop: ${slug} (${total} artigos, lote ${batch})\n`);

  for (let round = 1; round <= maxRounds; round++) {
    const progress = loadProgress(slug);
    const done = progress.translatedIds.length;
    if (done >= total) {
      console.log(`\n✅ Tradução completa: ${done}/${total}`);
      break;
    }

    console.log(`\n── Lote ${round} (${done}/${total} concluídos) ──`);
    const result = spawnSync(
      "pnpm",
      [
        "translate:theology",
        "--file", file,
        "--slug", slug,
        "--format", format,
        "--limit", String(batch),
      ],
      { stdio: "inherit", shell: true, cwd: process.cwd() }
    );

    if (result.status !== 0) {
      console.error(`\n⚠️ Lote ${round} falhou (código ${result.status}). Tentando novamente...`);
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }

    const after = loadProgress(slug).translatedIds.length;
    if (after === done) {
      console.log("\n⚠️ Nenhum progresso neste lote. Encerrando.");
      break;
    }
  }

  const final = loadProgress(slug).translatedIds.length;
  if (final < total) {
    console.log(`\n⏳ Parcial: ${final}/${total}. Rode novamente para continuar.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
