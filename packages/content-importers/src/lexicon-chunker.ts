/** Chunking semântico para léxicos acadêmicos (HALOT, BDAG, etc.) */

export function chunkLexiconMarkdown(text: string, maxWords = 550): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const sections = normalized.split(/\n(?=## )/);
  const chunks: string[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const words = trimmed.split(/\s+/);
    if (words.length <= maxWords) {
      chunks.push(trimmed);
      continue;
    }

    const subSections = trimmed.split(/\n(?=\* )/);
    let buffer = "";

    for (const part of subSections) {
      const candidate = buffer ? `${buffer}\n${part}` : part;
      if (candidate.split(/\s+/).length > maxWords && buffer) {
        chunks.push(buffer.trim());
        buffer = part;
      } else {
        buffer = candidate;
      }
    }

    if (buffer.trim()) chunks.push(buffer.trim());
  }

  return chunks.filter((c) => c.length > 80);
}

export function extractLexiconLemmaHints(chunk: string): string[] {
  const hints: string[] = [];
  for (const m of chunk.matchAll(/^##\s+(.+)$/gm)) {
    hints.push(m[1]!.trim());
  }
  for (const m of chunk.matchAll(/^\*\s+([a-zA-Z'";>\[\]]+)/gm)) {
    hints.push(m[1]!.trim());
  }
  return hints.slice(0, 8);
}
