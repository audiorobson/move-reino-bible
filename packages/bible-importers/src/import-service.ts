import { readFile } from "fs/promises";
import { PrismaClient } from "@prisma/client";
import { fetchFromHelloao } from "./helloao.js";
import { parseJsonBible } from "./json-auto.js";
import { validateImport } from "./json-flat.js";
import {
  loadManifest,
  getEnabledHelloaoSources,
  getEnabledLocalSources,
  resolveLocalPath,
  type BibleManifest,
  type ManifestHelloaoSource,
  type ManifestLocalSource,
} from "./manifest.js";
import { persistBibleImport } from "./persist.js";
import type { PersistBibleResult, StandardBibleImport } from "./types.js";

export interface ImportRunResult {
  source: string;
  validation: ReturnType<typeof validateImport>;
  persist: PersistBibleResult;
}

export async function importFromHelloao(
  prisma: PrismaClient,
  config: ManifestHelloaoSource,
  onProgress?: (msg: string) => void
): Promise<ImportRunResult> {
  const data = await fetchFromHelloao(config, onProgress);
  const validation = validateImport(data);
  if (validation.versesImported === 0) {
    throw new Error(`Nenhum versículo válido: ${validation.errors.join("; ")}`);
  }
  const persist = await persistBibleImport(prisma, data);
  return { source: `helloao:${config.helloaoId}`, validation, persist };
}

export async function importFromJsonFile(
  prisma: PrismaClient,
  filePath: string,
  versionMeta?: ManifestLocalSource["version"]
): Promise<ImportRunResult> {
  const raw = await readFile(filePath, "utf-8");
  const data = parseJsonBible(raw, { filePath, version: versionMeta });
  const validation = validateImport(data);
  if (validation.versesImported === 0) {
    throw new Error(`Nenhum versículo válido em ${filePath}`);
  }
  const persist = await persistBibleImport(prisma, data);
  return { source: `file:${filePath}`, validation, persist };
}

export async function importLocalAllFromManifest(
  prisma: PrismaClient,
  manifestPath?: string
): Promise<ImportRunResult[]> {
  const manifest = await loadManifest(manifestPath);
  const results: ImportRunResult[] = [];
  const localSources = getEnabledLocalSources(manifest);

  for (const local of localSources) {
    const filePath = resolveLocalPath(manifest, local.file);
    console.log(`\n📂 Importando arquivo local: ${filePath}`);
    try {
      const result = await importFromJsonFile(prisma, filePath, local.version);
      results.push(result);
      console.log(`✅ ${result.persist.abbreviation}: ${result.persist.versesCreated} versículos`);
    } catch (err) {
      console.error(`❌ Falha em ${local.file}:`, err);
    }
  }

  return results;
}

export async function importAllFromManifest(
  prisma: PrismaClient,
  manifestPath?: string,
  options?: { helloaoOnly?: string[]; skipHelloao?: boolean }
): Promise<ImportRunResult[]> {
  const manifest = await loadManifest(manifestPath);
  const results: ImportRunResult[] = [];

  if (!options?.skipHelloao) {
    let helloaoSources = getEnabledHelloaoSources(manifest);
    if (options?.helloaoOnly?.length) {
      helloaoSources = helloaoSources.filter((s) =>
        options.helloaoOnly!.includes(s.helloaoId) ||
        options.helloaoOnly!.includes(s.abbreviation)
      );
    }

    for (const source of helloaoSources) {
      console.log(`\n📥 Importando ${source.name} (${source.helloaoId})...`);
      try {
        const result = await importFromHelloao(prisma, source, console.log);
        results.push(result);
        console.log(`✅ ${result.persist.abbreviation}: ${result.persist.versesCreated} versículos`);
      } catch (err) {
        console.error(`❌ Falha em ${source.abbreviation}:`, err);
      }
    }
  }

  const localSources = getEnabledLocalSources(manifest);
  for (const local of localSources) {
    const filePath = resolveLocalPath(manifest, local.file);
    console.log(`\n📂 Importando arquivo local: ${filePath}`);
    try {
      const result = await importFromJsonFile(prisma, filePath, local.version);
      results.push(result);
      console.log(`✅ ${result.persist.abbreviation}: ${result.persist.versesCreated} versículos`);
    } catch (err) {
      console.error(`❌ Falha em ${local.file}:`, err);
    }
  }

  return results;
}

export async function importHelloaoById(
  prisma: PrismaClient,
  helloaoId: string,
  manifestPath?: string
): Promise<ImportRunResult> {
  const manifest = await loadManifest(manifestPath);
  const source = manifest.sources.find(
    (s): s is ManifestHelloaoSource =>
      s.type === "helloao" &&
      (s.helloaoId === helloaoId || s.abbreviation.toUpperCase() === helloaoId.toUpperCase())
  );
  if (!source) {
    throw new Error(
      `Fonte helloao '${helloaoId}' não encontrada em manifest.json. Adicione em data/bibles/manifest.json`
    );
  }
  return importFromHelloao(prisma, source);
}

export { loadManifest, type BibleManifest, type StandardBibleImport };
