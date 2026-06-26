import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";

export interface TheologyChapter {
  id: string;
  bookRoman: string;
  bookLabel: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface TheologyVolume {
  roman: string;
  label: string;
  chapterIds: string[];
}

export interface TheologyParsedDocument {
  meta: Record<string, string>;
  normalizedMarkdown: string;
  volumes: TheologyVolume[];
  chapters: TheologyChapter[];
}

const ROMAN_LABELS: Record<string, string> = {
  I: "Livro I",
  II: "Livro II",
  III: "Livro III",
  IV: "Livro IV",
  V: "Livro V",
  VI: "Livro VI",
  VII: "Livro VII",
  VIII: "Livro VIII",
  IX: "Livro IX",
  X: "Livro X",
};

function trimLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function isNoiseLine(line: string): boolean {
  const t = trimLine(line);
  if (!t) return true;
  if (/^_{5,}$/.test(t)) return true;
  if (/^_{10,}/.test(t)) return true;
  if (/file:\/\/\/ccel/i.test(t)) return true;
  if (/^\d+\.\s*file:\/\/\/ccel/i.test(t)) return true;
  if (/^CCEL$/i.test(t)) return true;
  if (/^Assuntos:/i.test(t)) return true;
  return false;
}

function extractMetaLine(lines: string[], key: string): string | undefined {
  const re = new RegExp(`^${key}\\s*:\\s*(.+)$`, "i");
  for (const line of lines.slice(0, 40)) {
    const m = trimLine(line).match(re);
    if (m) return m[1]!.trim();
  }
  return undefined;
}

function chapterId(bookRoman: string, chapterNumber: number): string {
  return `livro-${bookRoman.toLowerCase()}-cap-${chapterNumber}`;
}

function looksLikeChapterTitle(line: string): boolean {
  const t = trimLine(line);
  if (!t || t.length > 160) return false;
  if (/^Cap[ií]tulo\s+\d+/i.test(t)) return false;
  if (/^LIVRO\s+[IVXLC]+\./i.test(t)) return false;
  if (/^file:\/\//i.test(t)) return false;
  if (/^\[\d+\]/.test(t)) return false;
  if (/^Título:/i.test(t)) return false;
  if (/^Criador/i.test(t)) return false;
  if (/^JOHN GILL/i.test(t)) return false;
  if (/^UM CORPO DE/i.test(t)) return false;
  if (/^POR$/i.test(t)) return false;
  if (/^DE\s+[A-ZÁÉÍÓÚÃÕÂÊÎÔÛÇ]/i.test(t) && t.length > 80) return false;
  return true;
}

export function isCcelTheologyFormat(raw: string): boolean {
  const sample = raw.slice(0, 8000);
  return (
    /Título\s*:/i.test(sample) &&
    /LIVRO\s+[IVXLC]+\./i.test(sample) &&
    /Cap[ií]tulo\s+\d+/i.test(sample)
  );
}

export function parseTheologyMarkdown(
  raw: string,
  overrides?: Record<string, string>
): TheologyParsedDocument {
  const lines = raw.split(/\r?\n/);
  const title =
    overrides?.title ??
    extractMetaLine(lines, "Título") ??
    "Teologia Sistemática";
  let author = overrides?.author;
  if (!author) {
    for (const line of lines.slice(0, 40)) {
      const m = trimLine(line).match(/^Criador(?:\(es\))?\s*:\s*(.+)$/i);
      if (m) {
        author = m[1]!.trim();
        break;
      }
    }
  }
  author ??= "Autor desconhecido";

  const meta: Record<string, string> = {
    title,
    author,
    tradition: overrides?.tradition ?? "Batista",
    language: overrides?.language ?? "pt-BR",
    license: overrides?.license ?? "LICENSE_OK_PUBLIC_DOMAIN",
    documentType: overrides?.documentType ?? "systematic_theology",
    reliabilityLevel: overrides?.reliabilityLevel ?? "high",
    source: "CCEL",
    ...overrides,
  };

  const chapters: TheologyChapter[] = [];
  const volumeMap = new Map<string, TheologyVolume>();

  let currentRoman = "I";
  let currentBookLabel = ROMAN_LABELS.I ?? "Livro I";
  let currentChapter: TheologyChapter | null = null;
  let pendingTitle: string | null = null;
  const contentLines: string[] = [];

  const flushChapter = () => {
    if (!currentChapter) return;
    currentChapter.content = contentLines.join("\n").trim();
    currentChapter.wordCount = currentChapter.content.split(/\s+/).filter(Boolean).length;
    chapters.push(currentChapter);
    contentLines.length = 0;
    currentChapter = null;
    pendingTitle = null;
  };

  for (const line of lines) {
    if (isNoiseLine(line)) continue;

    const trimmed = trimLine(line);

    const livroMatch = trimmed.match(/^LIVRO\s+([IVXLC]+)\./i);
    if (livroMatch) {
      flushChapter();
      currentRoman = livroMatch[1]!.toUpperCase();
      currentBookLabel = ROMAN_LABELS[currentRoman] ?? `Livro ${currentRoman}`;
      if (!volumeMap.has(currentRoman)) {
        volumeMap.set(currentRoman, {
          roman: currentRoman,
          label: currentBookLabel,
          chapterIds: [],
        });
      }
      continue;
    }

    const capMatch = trimmed.match(/^Cap[ií]tulo\s+(\d+)/i);
    if (capMatch) {
      flushChapter();
      const num = Number(capMatch[1]);
      currentChapter = {
        id: chapterId(currentRoman, num),
        bookRoman: currentRoman,
        bookLabel: currentBookLabel,
        chapterNumber: num,
        title: `Capítulo ${num}`,
        content: "",
        wordCount: 0,
      };
      const vol = volumeMap.get(currentRoman);
      if (vol && !vol.chapterIds.includes(currentChapter.id)) {
        vol.chapterIds.push(currentChapter.id);
      }
      pendingTitle = null;
      continue;
    }

    if (currentChapter && !currentChapter.content && pendingTitle === null && looksLikeChapterTitle(trimmed)) {
      pendingTitle = trimmed;
      currentChapter.title = trimmed;
      continue;
    }

    if (currentChapter) {
      contentLines.push(trimmed);
    }
  }

  flushChapter();

  const volumes = [...volumeMap.values()].sort(
    (a, b) => a.chapterIds[0]?.localeCompare(b.chapterIds[0] ?? "") ?? 0
  );

  const mdParts: string[] = [
    "---",
    ...Object.entries(meta).map(([k, v]) => `${k}: ${v}`),
    "---",
    "",
    `# ${title}`,
    "",
    `*${author}*`,
    "",
  ];

  for (const ch of chapters) {
    mdParts.push(`## ${ch.bookLabel} — Capítulo ${ch.chapterNumber}: ${ch.title}`, "");
    mdParts.push(ch.content, "");
  }

  return {
    meta,
    normalizedMarkdown: mdParts.join("\n").trim(),
    volumes,
    chapters,
  };
}

export interface TheologyTocFile {
  bookId: string;
  title: string;
  author: string;
  generatedAt: string;
  chapterCount: number;
  volumes: TheologyVolume[];
  chapters: Array<Pick<TheologyChapter, "id" | "bookRoman" | "bookLabel" | "chapterNumber" | "title" | "wordCount">>;
}

export async function writeTheologyTocFile(
  processedDir: string,
  bookId: string,
  parsed: TheologyParsedDocument
): Promise<string> {
  await mkdir(processedDir, { recursive: true });
  const toc: TheologyTocFile = {
    bookId,
    title: parsed.meta.title ?? bookId,
    author: parsed.meta.author ?? "",
    generatedAt: new Date().toISOString(),
    chapterCount: parsed.chapters.length,
    volumes: parsed.volumes,
    chapters: parsed.chapters.map((c) => ({
      id: c.id,
      bookRoman: c.bookRoman,
      bookLabel: c.bookLabel,
      chapterNumber: c.chapterNumber,
      title: c.title,
      wordCount: c.wordCount,
    })),
  };
  const outPath = join(processedDir, `${bookId}-toc.json`);
  await writeFile(outPath, JSON.stringify(toc, null, 2), "utf-8");
  return outPath;
}

export async function writeTheologyChaptersDir(
  processedDir: string,
  bookId: string,
  chapters: TheologyChapter[]
): Promise<string> {
  const dir = join(processedDir, bookId, "chapters");
  await mkdir(dir, { recursive: true });
  for (const ch of chapters) {
    const path = join(dir, `${ch.id}.md`);
    const body = [
      `# ${ch.bookLabel}`,
      `## Capítulo ${ch.chapterNumber}: ${ch.title}`,
      "",
      ch.content,
    ].join("\n");
    await writeFile(path, body, "utf-8");
  }
  return dir;
}

export async function normalizeTheologyFile(
  inputPath: string,
  outputPath: string,
  overrides?: Record<string, string>
): Promise<TheologyParsedDocument> {
  const { readFile } = await import("fs/promises");
  const raw = await readFile(inputPath, "utf-8");
  if (!raw.trim()) {
    throw new Error(`Arquivo vazio: ${inputPath}. Salve o documento no editor antes de importar.`);
  }
  const parsed = parseTheologyMarkdown(raw, overrides);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, parsed.normalizedMarkdown, "utf-8");
  return parsed;
}
