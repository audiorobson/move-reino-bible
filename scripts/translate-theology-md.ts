#!/usr/bin/env tsx
/**
 * Traduz e normaliza teologia sistemática EN → PT (Suma, etc.)
 *
 * pnpm translate:theology --file data/rag/sources/systematic/Suma_Theologica_Thomas_Aquino.MD --slug suma-teologica-aquino --format ccel-summa
 * pnpm translate:theology --file ... --limit 50   # traduz só N artigos (teste)
 * pnpm translate:theology --file ... --skip-translate  # só normaliza/índice
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { translateEnToPtBatch } from "@mrb/md-translator";
import {
  getRepoRoot,
  isCcelSummaFormat,
  isCcelTheologyFormat,
  parseSummaMarkdown,
  parseTheologyMarkdown,
  writeTheologyChaptersDir,
  writeTheologyTocFile,
  type TheologyChapter,
  type TheologyParsedDocument,
} from "@mrb/content-importers";

interface ProgressFile {
  slug: string;
  translatedIds: string[];
  updatedAt: string;
}

function loadProgress(path: string): ProgressFile {
  if (!existsSync(path)) {
    return { slug: "", translatedIds: [], updatedAt: new Date().toISOString() };
  }
  return JSON.parse(readFileSync(path, "utf-8")) as ProgressFile;
}

function saveProgress(path: string, data: ProgressFile) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0);
}

/** Detecta artigo já traduzido para PT (evita regravar inglês do fonte CCEL). */
function isChapterTranslatedPt(ch: TheologyChapter): boolean {
  const head = `${ch.title}\n${ch.content.slice(0, 600)}`;
  if (/^Whether\b/i.test(ch.title.trim()) || /Objection\s*1\s*:/i.test(head)) {
    return false;
  }
  return /Objeção\s*1\s*:/i.test(head) || /Pelo contrário/i.test(head) || /^Se /i.test(ch.title.trim());
}

function parseExistingOutput(
  outputPath: string,
  format: string,
  overrides: Record<string, string>
): TheologyParsedDocument | null {
  if (!existsSync(outputPath)) return null;
  const existingRaw = readFileSync(outputPath, "utf-8");
  if (!existingRaw.trim()) return null;
  return format === "ccel-summa"
    ? parseSummaMarkdown(existingRaw, overrides)
    : parseTheologyMarkdown(existingRaw, overrides);
}

function seedTranslatedChapters(
  sourceChapters: TheologyChapter[],
  existingById: Map<string, TheologyChapter>
): Map<string, TheologyChapter> {
  return new Map(
    sourceChapters.map((ch) => {
      const existing = existingById.get(ch.id);
      if (existing && isChapterTranslatedPt(existing)) {
        return [ch.id, existing];
      }
      return [ch.id, ch];
    })
  );
}

function reconcileProgress(
  progress: ProgressFile,
  existingById: Map<string, TheologyChapter>
): void {
  progress.translatedIds = progress.translatedIds.filter((id) => {
    const ch = existingById.get(id);
    return Boolean(ch && isChapterTranslatedPt(ch));
  });
}

async function translateChapter(
  chapter: TheologyChapter,
  cachePath: string
): Promise<TheologyChapter> {
  const title = (await translateEnToPtBatch([chapter.title], { cachePath, batchSize: 1 }))[0]!;
  const paragraphs = splitParagraphs(chapter.content);
  const translatedParagraphs =
    paragraphs.length > 0
      ? await translateEnToPtBatch(paragraphs, { cachePath, batchSize: 12, delayMs: 350 })
      : [];
  return {
    ...chapter,
    title,
    content: translatedParagraphs.join("\n\n"),
  };
}

function rebuildDocument(
  parsed: TheologyParsedDocument,
  chapters: TheologyChapter[]
): TheologyParsedDocument {
  const mdParts: string[] = [
    "---",
    ...Object.entries(parsed.meta).map(([k, v]) => `${k}: ${v}`),
    "---",
    "",
    `# ${parsed.meta.title}`,
    "",
    `*${parsed.meta.author}*`,
    "",
  ];

  for (const ch of chapters) {
    mdParts.push(
      `## ${ch.bookLabel} — Artigo ${ch.chapterNumber}`,
      `### ${ch.title}`,
      "",
      ch.content,
      ""
    );
  }

  return {
    ...parsed,
    meta: { ...parsed.meta, language: "pt-BR" },
    chapters,
    normalizedMarkdown: mdParts.join("\n").trim(),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  if (fileIdx === -1 || !args[fileIdx + 1]) {
    console.log(`
Uso:
  pnpm translate:theology --file <caminho.md> --slug <id> [--format ccel-summa|ccel-theology]
  Opções: --limit N  --skip-translate  --out <saida.md>
`);
    process.exit(1);
  }

  const inputPath = args[fileIdx + 1]!;
  const slugIdx = args.indexOf("--slug");
  const formatIdx = args.indexOf("--format");
  const limitIdx = args.indexOf("--limit");
  const outIdx = args.indexOf("--out");
  const skipTranslate = args.includes("--skip-translate");

  const slug = slugIdx !== -1 ? args[slugIdx + 1]! : "theology-book";
  const format = formatIdx !== -1 ? args[formatIdx + 1] : "auto";
  const limit = limitIdx !== -1 ? Number(args[limitIdx + 1]) : undefined;
  const outputPath =
    outIdx !== -1
      ? args[outIdx + 1]!
      : join("data/rag/sources/systematic", `${slug}.md`);

  if (!existsSync(inputPath)) {
    console.error(`Arquivo não encontrado: ${inputPath}`);
    process.exit(1);
  }

  const raw = readFileSync(inputPath, "utf-8");
  if (!raw.trim()) {
    console.error("Arquivo vazio. Salve o documento no editor (Ctrl+S).");
    process.exit(1);
  }

  const overrides: Record<string, string> = { slug };
  if (slug === "suma-teologica-aquino") {
    overrides.title = "Suma Teológica";
    overrides.author = "Tomás de Aquino (1225-1274)";
    overrides.tradition = "Católica";
  }

  const resolvedFormat =
    format === "auto"
      ? isCcelSummaFormat(raw)
        ? "ccel-summa"
        : isCcelTheologyFormat(raw)
          ? "ccel-theology"
          : "unknown"
      : format;

  console.log(`📖 Analisando (${resolvedFormat}): ${inputPath}`);

  let parsed =
    resolvedFormat === "ccel-summa"
      ? parseSummaMarkdown(raw, overrides)
      : parseTheologyMarkdown(raw, overrides);

  console.log(`   ${parsed.volumes.length} partes/volumes, ${parsed.chapters.length} artigos/capítulos`);

  const repoRoot = getRepoRoot();
  const cachePath = join(repoRoot, "data/rag/index/translation-cache-summa-en-pt.json");
  const progressPath = join(repoRoot, "data/rag/processed", `${slug}-translate-progress.json`);
  const progress = loadProgress(progressPath);
  progress.slug = slug;

  const existingParsed = parseExistingOutput(outputPath, resolvedFormat, overrides);
  const existingById = new Map(existingParsed?.chapters.map((c) => [c.id, c]) ?? []);
  reconcileProgress(progress, existingById);

  if (existingParsed && progress.translatedIds.length > 0) {
    console.log(
      `   📎 Preservando ${progress.translatedIds.length} artigos já traduzidos do arquivo de saída`
    );
  }

  if (!skipTranslate && resolvedFormat === "ccel-summa") {
    const pending = parsed.chapters.filter((c) => !progress.translatedIds.includes(c.id));
    const batch = typeof limit === "number" ? pending.slice(0, limit) : pending;

    console.log(`🌐 Traduzindo ${batch.length} de ${pending.length} artigos pendentes...`);

    const translatedMap = seedTranslatedChapters(parsed.chapters, existingById);
    let done = 0;

    for (const chapter of batch) {
      const translated = await translateChapter(chapter, cachePath);
      translatedMap.set(chapter.id, translated);
      if (!progress.translatedIds.includes(chapter.id)) {
        progress.translatedIds.push(chapter.id);
      }
      done += 1;
      if (done % 10 === 0) {
        progress.updatedAt = new Date().toISOString();
        saveProgress(progressPath, progress);
        console.log(`   ✅ ${done}/${batch.length} artigos traduzidos`);
      }
    }

    parsed = rebuildDocument(
      parsed,
      parsed.chapters.map((c) => translatedMap.get(c.id)!)
    );
    progress.updatedAt = new Date().toISOString();
    saveProgress(progressPath, progress);
    console.log(`✅ Tradução: ${progress.translatedIds.length}/${parsed.chapters.length} artigos no total`);
  } else if (existingParsed && existingById.size > 0) {
    parsed = rebuildDocument(
      parsed,
      parsed.chapters.map((c) => {
        const existing = existingById.get(c.id);
        return existing && isChapterTranslatedPt(existing) ? existing : c;
      })
    );
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, parsed.normalizedMarkdown, "utf-8");

  const processedDir = join(repoRoot, "data/rag/processed");
  await writeTheologyTocFile(processedDir, slug, parsed);
  await writeTheologyChaptersDir(processedDir, slug, parsed.chapters);

  console.log(`✅ Markdown: ${outputPath}`);
  console.log(`   Índice: data/rag/processed/${slug}-toc.json`);

  if (!skipTranslate && progress.translatedIds.length < parsed.chapters.length) {
    const remaining = parsed.chapters.length - progress.translatedIds.length;
    console.log(`\n⏳ Faltam ${remaining} artigos. Rode novamente o mesmo comando para continuar.`);
  }
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
