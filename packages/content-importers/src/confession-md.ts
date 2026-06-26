import type { TheologyChapter, TheologyParsedDocument, TheologyVolume } from "./theology-md.js";

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Parser para confissões/catecismos em Markdown com seções `# Título`. */
export function parseSectionsMarkdown(
  raw: string,
  overrides?: Record<string, string>
): TheologyParsedDocument {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const meta: Record<string, string> = { ...overrides };
  let body = raw;

  if (fmMatch) {
    body = raw.slice(fmMatch[0].length);
    for (const line of fmMatch[1]!.split("\n")) {
      const eq = line.indexOf(":");
      if (eq > 0) {
        meta[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
      }
    }
  }

  const sections = body.split(/^#\s+/m).filter((s) => s.trim());
  const chapters: TheologyChapter[] = sections.map((section, idx) => {
    const lines = section.split(/\r?\n/);
    const title = (lines[0] ?? `Seção ${idx + 1}`).trim();
    const content = lines.slice(1).join("\n").trim();
    const num = idx + 1;
    return {
      id: `sec-${num}`,
      bookRoman: "I",
      bookLabel: meta.title ?? "Obra",
      chapterNumber: num,
      title,
      content,
      wordCount: wordCount(content),
    };
  });

  const volume: TheologyVolume = {
    roman: "I",
    label: meta.title ?? "Confissão",
    chapterIds: chapters.map((c) => c.id),
  };

  const mdParts = [
    "---",
    ...Object.entries(meta).map(([k, v]) => `${k}: ${v}`),
    "---",
    "",
    `# ${meta.title ?? "Documento"}`,
    "",
  ];
  for (const ch of chapters) {
    mdParts.push(`## ${ch.title}`, "", ch.content, "");
  }

  return {
    meta,
    normalizedMarkdown: mdParts.join("\n").trim(),
    volumes: [volume],
    chapters,
  };
}
