export interface TbeshEntry {
  eStrong: string;
  dStrong: string;
  uStrong: string;
  lemma: string;
  transliteration: string;
  morphology: string;
  gloss: string;
  definition: string;
}

const ENTRY_RE = /^(H\d+)\t/;

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTbeshLine(line: string): TbeshEntry | null {
  if (!ENTRY_RE.test(line)) return null;
  const cols = line.split("\t");
  if (cols.length < 8) return null;

  const eStrongRaw = cols[0]!.trim();
  const numMatch = eStrongRaw.match(/^H(\d+)/i);
  if (!numMatch) return null;
  const eStrong = `H${parseInt(numMatch[1]!, 10)}`;

  return {
    eStrong,
    dStrong: (cols[1] ?? eStrong).trim(),
    uStrong: (cols[2] ?? eStrong).trim(),
    lemma: (cols[3] ?? "").trim(),
    transliteration: (cols[4] ?? "").trim(),
    morphology: (cols[5] ?? "").trim(),
    gloss: (cols[7] ?? "").trim(),
    definition: stripHtml(cols.slice(8).join(" ")),
  };
}
