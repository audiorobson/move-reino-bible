#!/usr/bin/env tsx
/**
 * Importa cadeias temáticas bíblicas (Torrey, Nave) para o Move Reino Bible.
 *
 * Uso:
 *   pnpm import:chains --torrey
 *   pnpm import:chains --nave
 *   pnpm import:chains --all
 *   pnpm import:chains --torrey --reset
 */
import { PrismaClient } from "@prisma/client";
import { importTorrey, importNave } from "@mrb/chain-system";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const runTorrey = args.includes("--torrey") || args.includes("--all") || args.length === 0;
const runNave = args.includes("--nave") || args.includes("--all");
const reset = args.includes("--reset");

async function resetChainData() {
  console.log("Limpando dados de cadeias...");
  await prisma.chainNode.deleteMany();
  await prisma.chainTopicVerse.deleteMany();
  await prisma.chainTopicAlias.deleteMany();
  await prisma.chainTopic.updateMany({ data: { chainId: null } });
  await prisma.chain.deleteMany();
  await prisma.chainTopic.deleteMany();
  await prisma.chainImportLog.deleteMany();
  await prisma.chainSource.deleteMany();
}

async function writeReport(sections: string[]) {
  const dir = join(process.cwd(), "docs", "import-reports");
  await mkdir(dir, { recursive: true });
  const path = join(dir, "chain-import-report.md");
  const body = [
    "# Relatório de importação — Cadeias Bíblicas",
    "",
    `**Data:** ${new Date().toLocaleString("pt-BR")}`,
    "",
    ...sections,
  ].join("\n");
  await writeFile(path, body, "utf-8");
  console.log(`Relatório salvo em ${path}`);
}

async function main() {
  if (reset) await resetChainData();

  const report: string[] = [];

  if (runTorrey) {
    console.log("Importando Torrey...");
    const result = await importTorrey(prisma);
    console.log(
      `Torrey: ${result.totalTopics} tópicos, ${result.totalTopicVerses} versículos, ${result.totalChains} cadeias`
    );
    report.push(
      "## Torrey",
      `- Tópicos: ${result.totalTopics}`,
      `- Versículos temáticos: ${result.totalTopicVerses}`,
      `- Cadeias: ${result.totalChains}`,
      `- Nós: ${result.totalChainNodes}`,
      `- Erros: ${result.errors.length}`,
      ""
    );
  }

  if (runNave) {
    console.log("Importando Nave...");
    const result = await importNave(prisma);
    console.log(
      `Nave: ${result.totalTopics} tópicos, ${result.totalTopicVerses} versículos, ${result.totalChains} cadeias`
    );
    report.push(
      "## Nave",
      `- Tópicos: ${result.totalTopics}`,
      `- Versículos temáticos: ${result.totalTopicVerses}`,
      `- Cadeias: ${result.totalChains}`,
      `- Nós: ${result.totalChainNodes}`,
      `- Erros: ${result.errors.length}`,
      ""
    );
  }

  const stats = await prisma.chainTopic.count();
  report.push(`## Total de tópicos no banco: ${stats}`);
  await writeReport(report);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
