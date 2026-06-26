import type { StrongsMdEntry } from "./strongs-md.js";

const ENTRY_MARKER = /\[([GH])(\d+)\]\s*\(([^)]+)\)\s*/gi;

function parseLemmaTranslit(inner: string): { lemma: string; transliteration: string } {
  const cleaned = inner.trim().replace(/^['']+|['']+$/g, "");
  const slash = cleaned.indexOf("/");
  if (slash === -1) {
    return { lemma: cleaned, transliteration: cleaned };
  }
  return {
    lemma: cleaned.slice(0, slash).replace(/^['']+|['']+$/g, ""),
    transliteration: cleaned.slice(slash + 1).trim(),
  };
}

function detectLanguage(prefix: "G" | "H", definition: string): StrongsMdEntry["language"] {
  if (prefix === "G") return "greek";
  if (/\(Aramaic\)|\(aramaico\)/i.test(definition)) return "aramaic";
  return "hebrew";
}

function cleanDefinition(raw: string): string {
  return raw
    .replace(/^-\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseKjvStrongsMarkdown(input: string): StrongsMdEntry[] {
  const entries: StrongsMdEntry[] = [];
  const normalized = input.replace(/\r\n/g, "\n");

  const matches: Array<{ index: number; prefix: "G" | "H"; num: number; inner: string; end: number }> = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(ENTRY_MARKER.source, "gi");
  while ((m = re.exec(normalized)) !== null) {
    matches.push({
      index: m.index,
      prefix: m[1]!.toUpperCase() as "G" | "H",
      num: parseInt(m[2]!, 10),
      inner: m[3]!,
      end: m.index + m[0].length,
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i]!;
    const nextStart = matches[i + 1]?.index ?? normalized.length;
    const definition = cleanDefinition(normalized.slice(cur.end, nextStart));
    if (!definition) continue;

    const { lemma, transliteration } = parseLemmaTranslit(cur.inner);
    entries.push({
      strongNumber: `${cur.prefix}${cur.num}`,
      lemma,
      transliteration,
      language: detectLanguage(cur.prefix, definition),
      shortDefinition: definition,
    });
  }

  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.strongNumber)) return false;
    seen.add(e.strongNumber);
    return true;
  });
}

export function isKjvStrongsFormat(input: string): boolean {
  return /\[[GH]\d+\]\s*\([^)]+\)/i.test(input);
}

export function exportKjvStrongsToMarkdown(
  entries: StrongsMdEntry[],
  meta?: { title: string; source: string }
): string {
  const lines: string[] = [];
  if (meta) {
    lines.push(`# ${meta.title}`, "", `> Fonte: ${meta.source}`, `> Idioma das definições: português (traduzido do inglês)`, "");
  }

  for (const e of entries) {
    const num = parseInt(e.strongNumber.replace(/^[GH]/, ""), 10);
    const prefix = e.strongNumber.startsWith("H") ? "H" : "G";
    const lemmaPart = e.lemma;
    const translitPart = e.transliteration ?? e.lemma;
    lines.push(`[${prefix}${num}] (${lemmaPart}/${translitPart}) ${e.shortDefinition}`);
    if (e.extendedDefinition) lines.push("", e.extendedDefinition);
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

export function exportKjvStrongsToSbbMarkdown(entries: StrongsMdEntry[]): string {
  const lines: string[] = [
    "# Strong's KJV — Português",
    "",
    "Definições traduzidas do inglês (KJV Strong's Concordance).",
    "",
  ];

  for (const e of entries) {
    const num = parseInt(e.strongNumber.replace(/^[GH]/, ""), 10);
    const lemma = e.lemma;
    const translit = e.transliteration ?? e.lemma;
    lines.push(`## ${num} ${lemma} ${translit}`);
    lines.push(e.shortDefinition);
    if (e.extendedDefinition) {
      lines.push("");
      lines.push(e.extendedDefinition);
    }
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}
