#!/usr/bin/env tsx
/**
 * CLI de importação bíblica — Move Reino Bible
 *
 * Uso:
 *   pnpm import:bible --all
 *   pnpm import:bible --helloao BSB
 *   pnpm import:bible --helloao por_blj
 *   pnpm import:bible --file data/bibles/local/example-john1.json
 *   pnpm import:bible --list
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import {
  importAllFromManifest,
  importFromJsonFile,
  importHelloaoById,
  importLocalAllFromManifest,
  loadManifest,
  getEnabledHelloaoSources,
  getEnabledLocalSources,
} from "@mrb/bible-importers";

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
Move Reino Bible — Importador de textos bíblicos

Comandos:
  --all                    Importa fontes com autoImport:true no manifest
  --helloao <id>           Importa uma fonte helloao (ex: BSB, por_blj)
  --file <caminho>         Importa JSON local
  --local-all              Importa todos os JSONs locais habilitados no manifest
  --help                   Esta ajuda

Exemplos:
  pnpm import:bible --all
  pnpm import:bible --helloao por_blj
  pnpm import:bible --file data/bibles/local/example-john1.json
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  if (args.includes("--list")) {
    const manifest = await loadManifest();
    console.log("\n📚 Fontes no manifest:\n");
    for (const s of manifest.sources) {
      if (s.type === "helloao") {
        console.log(
          `  [helloao] ${s.abbreviation} (${s.helloaoId}) — ${s.enabled ? "ativa" : "inativa"} — autoImport: ${s.autoImport}`
        );
      } else {
        console.log(`  [local]   ${s.file} — ${s.enabled ? "ativa" : "inativa"}`);
      }
    }
    console.log(`\nDiretório local: ${manifest.localDirectory}/`);
    process.exit(0);
  }

  console.log("🌐 Move Reino Bible — Importação bíblica\n");

  if (args.includes("--local-all")) {
    const results = await importLocalAllFromManifest(prisma);
    console.log(`\n🎉 Concluído: ${results.length} arquivo(s) local(is) importado(s)`);
    for (const r of results) {
      console.log(`   ${r.persist.abbreviation}: ${r.persist.versesCreated} versículos`);
    }
    return;
  }

  if (args.includes("--all")) {
    const results = await importAllFromManifest(prisma);
    console.log(`\n🎉 Concluído: ${results.length} fonte(s) importada(s)`);
    for (const r of results) {
      console.log(`   ${r.persist.abbreviation}: ${r.persist.versesCreated} versículos`);
    }
    return;
  }

  const helloaoIdx = args.indexOf("--helloao");
  if (helloaoIdx !== -1) {
    const id = args[helloaoIdx + 1];
    if (!id) {
      console.error("Informe o ID: --helloao BSB");
      process.exit(1);
    }
    const result = await importHelloaoById(prisma, id);
    console.log(`✅ ${result.persist.abbreviation}: ${result.persist.versesCreated} versículos importados`);
    return;
  }

  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1) {
    const filePath = args[fileIdx + 1];
    if (!filePath) {
      console.error("Informe o caminho: --file data/bibles/local/arquivo.json");
      process.exit(1);
    }
    const result = await importFromJsonFile(prisma, filePath);
    console.log(`✅ ${result.persist.abbreviation}: ${result.persist.versesCreated} versículos importados`);
    return;
  }

  printHelp();
  process.exit(1);
}

main()
  .catch((err) => {
    console.error("Erro:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
