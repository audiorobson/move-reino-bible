import type { TheologyChapter, TheologyParsedDocument, TheologyVolume } from "./theology-md.js";

export interface SummaPart {
  id: string;
  label: string;
}

const PART_PATTERNS: Array<{ id: string; re: RegExp; label: string }> = [
  { id: "fp", re: /^FIRST PART \(FP:/i, label: "Primeira Parte (FP)" },
  { id: "fs", re: /^FIRST PART OF THE SECOND PART \(FS\)/i, label: "Primeira Parte da Segunda Parte (FS)" },
  { id: "ss", re: /^SECOND PART OF THE SECOND PART \(SS\)/i, label: "Segunda Parte da Segunda Parte (SS)" },
  { id: "tp", re: /^THIRD PART \(TP\)/i, label: "Terceira Parte (TP)" },
  { id: "xp", re: /^SUPPLEMENT \(XP\)/i, label: "Suplemento (XP)" },
];

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
  if (/^Hidden links:/i.test(t)) return true;
  if (/^Title:/i.test(t)) return true;
  if (/^Creator/i.test(t)) return true;
  if (/^Rights:/i.test(t)) return true;
  if (/^LC /i.test(t)) return true;
  if (/^Acknowledgment:/i.test(t)) return true;
  if (/^Translated by/i.test(t)) return true;
  if (/^SUMMA THEOLOGICA \(Benziger/i.test(t)) return true;
  if (/^ST\. THOMAS AQUINAS$/i.test(t)) return true;
  if (/^SUMMA THEOLOGICA$/i.test(t)) return true;
  return false;
}

function isPartHeader(line: string): SummaPart | null {
  const t = trimLine(line);
  for (const p of PART_PATTERNS) {
    if (p.re.test(t)) return { id: p.id, label: p.label };
  }
  return null;
}

function isTreatiseHeader(line: string): string | null {
  const t = trimLine(line);
  const m = t.match(/^TREATISE ON (.+?)(?:\s+\[\d+\]\(Q\[\d+\]\))?$/i);
  if (m) return m[1]!.trim();
  return null;
}

function isArticleTitle(line: string): string | null {
  const t = trimLine(line);
  if (!/^Whether\b/i.test(t)) return null;
  return t.replace(/\s+/g, " ");
}

function stripCcelTail(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (/file:\/\/\/ccel/i.test(trimLine(line))) break;
    if (/^\d+\.\s*file:\/\/\/ccel/i.test(trimLine(line))) break;
    out.push(line);
  }
  return out;
}

export function isCcelSummaFormat(raw: string): boolean {
  if (isNormalizedSummaFormat(raw)) return false;
  const sample = raw.slice(0, 12000);
  return (
    /Summa Theologica/i.test(sample) &&
    /TREATISE ON/i.test(sample) &&
    /Whether\b/i.test(sample) &&
    /FIRST PART/i.test(sample)
  );
}

export function isNormalizedSummaFormat(raw: string): boolean {
  const body = raw.replace(/^---[\s\S]*?---\r?\n/, "");
  return /^## .+ — Artigo \d+/m.test(body);
}

function parseNormalizedSummaMarkdown(
  raw: string,
  overrides?: Record<string, string>
): TheologyParsedDocument {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const meta: Record<string, string> = {
    title: overrides?.title ?? "Suma Teológica",
    author: overrides?.author ?? "Tomás de Aquino (1225-1274)",
    tradition: overrides?.tradition ?? "Católica",
    language: overrides?.language ?? "pt-BR",
    license: overrides?.license ?? "LICENSE_OK_PUBLIC_DOMAIN",
    documentType: overrides?.documentType ?? "systematic_theology",
    reliabilityLevel: overrides?.reliabilityLevel ?? "high",
    ...overrides,
  };

  if (fmMatch) {
    for (const line of fmMatch[1]!.split("\n")) {
      const eq = line.indexOf(":");
      if (eq > 0) meta[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
  }

  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  const sections = body.split(/^## /m).filter((s) => /— Artigo \d+/i.test(s));
  const chapters: TheologyChapter[] = [];
  const volumeMap = new Map<string, TheologyVolume>();

  for (const section of sections) {
    const lines = section.split(/\r?\n/);
    const header = lines[0]?.trim() ?? "";
    const headerMatch = header.match(/^(.+?) — Artigo (\d+)$/i);
    if (!headerMatch) continue;

    const bookLabel = headerMatch[1]!.trim();
    const chapterNumber = Number(headerMatch[2]);
    const partId =
      bookLabel.match(/\((FP|FS|SS|TP|XP)\)/i)?.[1]?.toLowerCase() ??
      bookLabel.slice(0, 2).toLowerCase();

    let title = `Artigo ${chapterNumber}`;
    let contentStart = 1;
    if (lines[1]?.trim().startsWith("### ")) {
      title = lines[1]!.trim().slice(4).trim();
      contentStart = 2;
    }

    const content = lines.slice(contentStart).join("\n").trim();
    const id = `${partId}-a${chapterNumber}`;

    chapters.push({
      id,
      bookRoman: partId,
      bookLabel,
      chapterNumber,
      title,
      content,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    });

    if (!volumeMap.has(partId)) {
      volumeMap.set(partId, { roman: partId, label: bookLabel.replace(/ — Artigo.*/, ""), chapterIds: [] });
    }
    volumeMap.get(partId)!.chapterIds.push(id);
  }

  return {
    meta,
    normalizedMarkdown: raw.trim(),
    volumes: [...volumeMap.values()],
    chapters,
  };
}

export function parseSummaMarkdown(
  raw: string,
  overrides?: Record<string, string>
): TheologyParsedDocument {
  if (isNormalizedSummaFormat(raw)) {
    return parseNormalizedSummaMarkdown(raw, overrides);
  }

  const lines = stripCcelTail(raw.split(/\r?\n/));

  let title = overrides?.title ?? "Suma Teológica";
  let author = overrides?.author ?? "Tomás de Aquino (1225-1274)";
  for (const line of lines.slice(0, 30)) {
    const t = trimLine(line);
    const titleMatch = t.match(/^Title:\s*(.+)$/i);
    if (titleMatch) title = titleMatch[1]!.trim();
    const creatorMatch = t.match(/^Creator\(s\):\s*(.+)$/i);
    if (creatorMatch) author = creatorMatch[1]!.trim();
  }

  const meta: Record<string, string> = {
    title,
    author,
    tradition: overrides?.tradition ?? "Católica",
    language: overrides?.language ?? "pt-BR",
    license: overrides?.license ?? "LICENSE_OK_PUBLIC_DOMAIN",
    documentType: overrides?.documentType ?? "systematic_theology",
    reliabilityLevel: overrides?.reliabilityLevel ?? "high",
    source: "CCEL",
    originalLanguage: "en",
    ...overrides,
  };

  const chapters: TheologyChapter[] = [];
  const volumeMap = new Map<string, TheologyVolume>();

  let currentPart: SummaPart = { id: "fp", label: "Primeira Parte (FP)" };
  let currentTreatise = "Tratado introdutório";
  let articleIndex = 0;
  let currentTitle: string | null = null;
  const contentLines: string[] = [];

  const ensureVolume = (part: SummaPart) => {
    if (!volumeMap.has(part.id)) {
      volumeMap.set(part.id, { roman: part.id, label: part.label, chapterIds: [] });
    }
  };

  const flushArticle = () => {
    if (!currentTitle) return;
    articleIndex += 1;
    const id = `${currentPart.id}-a${articleIndex}`;
    const content = contentLines.join("\n").trim();
    const chapter: TheologyChapter = {
      id,
      bookRoman: currentPart.id,
      bookLabel: currentPart.label,
      chapterNumber: articleIndex,
      title: currentTitle,
      content,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    };
    chapters.push(chapter);
    const vol = volumeMap.get(currentPart.id);
    if (vol) vol.chapterIds.push(id);
    contentLines.length = 0;
    currentTitle = null;
  };

  for (const line of lines) {
    if (isNoiseLine(line)) continue;
    const trimmed = trimLine(line);

    const part = isPartHeader(line);
    if (part) {
      flushArticle();
      currentPart = part;
      articleIndex = 0;
      ensureVolume(part);
      continue;
    }

    const treatise = isTreatiseHeader(line);
    if (treatise) {
      flushArticle();
      currentTreatise = treatise;
      continue;
    }

    const articleTitle = isArticleTitle(line);
    if (articleTitle) {
      flushArticle();
      ensureVolume(currentPart);
      currentTitle = articleTitle;
      continue;
    }

    if (currentTitle) {
      contentLines.push(trimmed);
    }
  }

  flushArticle();

  const volumes = [...volumeMap.values()];

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
    mdParts.push(
      `## ${ch.bookLabel} — Artigo ${ch.chapterNumber}`,
      `### ${ch.title}`,
      "",
      ch.content,
      ""
    );
  }

  return {
    meta,
    normalizedMarkdown: mdParts.join("\n").trim(),
    volumes,
    chapters,
  };
}
