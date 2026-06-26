import type { StrongsMdEntry } from "./strongs-md.js";

const GREEK_RE = /[\u0370-\u03FF\u1F00-\u1FFF]/;
const HEBREW_RE = /[\u0590-\u05FF]/;

function detectLanguage(text: string): StrongsMdEntry["language"] {
  if (text.includes("(aramaico)") || text.includes("(aramaico")) return "aramaic";
  if (GREEK_RE.test(text)) return "greek";
  if (HEBREW_RE.test(text)) return "hebrew";
  return "greek";
}

function parseHeaderLine(num: number, rest: string): Pick<StrongsMdEntry, "lemma" | "transliteration" | "language"> {
  const language = detectLanguage(rest);

  const quoted = rest.match(/^(.+?)\s+['']([^'']+)['']/);
  if (quoted) {
    return {
      language,
      lemma: quoted[1]!.trim(),
      transliteration: quoted[2]!.trim(),
    };
  }

  if (language === "greek") {
    const parts = rest.trim().split(/\s+/);
    if (parts.length >= 2) {
      const transliteration = parts[parts.length - 1]!.replace(/^['']+|['']+$/g, "");
      const lemma = parts.slice(0, -1).join(" ");
      return { language, lemma, transliteration };
    }
  }

  const words = rest.split(/\s+/);
  return {
    language,
    lemma: words[0] ?? rest,
    transliteration: words[1] ?? undefined,
  };
}

function collectDefinition(lines: string[]): { short: string; extended?: string } {
  const parts: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "---") continue;
    if (trimmed.startsWith("## ")) break;
    if (/^(Qal|Piel|Hifil|Peal|Afal|TDNT|DITAT|Substantivo)/i.test(trimmed)) continue;
    if (trimmed.startsWith("```")) continue;

    if (trimmed.startsWith("- ")) {
      parts.push(trimmed.replace(/^-\s*/, ""));
      continue;
    }

    if (/^\d+\)|^\d+\./.test(trimmed)) {
      parts.push(trimmed);
      continue;
    }

    if (
      trimmed.includes("DITAT") ||
      trimmed.includes("TDNT") ||
      trimmed.startsWith("procedente") ||
      trimmed.startsWith("correspondente") ||
      trimmed.startsWith("uma raiz") ||
      trimmed.startsWith("de ") ||
      trimmed.startsWith("forma ") ||
      trimmed.startsWith("o mesmo") ||
      trimmed.startsWith("intensivo") ||
      trimmed.startsWith("por reduplicação") ||
      trimmed.startsWith("aparentemente") ||
      trimmed.includes("n pr") ||
      trimmed.includes("n m") ||
      trimmed.includes("n f") ||
      trimmed.includes("adj")
    ) {
      if (!parts.length) parts.push(trimmed);
      else parts[0] = `${parts[0]} ${trimmed}`.slice(0, 500);
      continue;
    }

    if (trimmed.length > 2 && !trimmed.startsWith("<!--")) {
      parts.push(trimmed);
    }
  }

  const short = parts[0]?.slice(0, 500) ?? "—";
  const extended = parts.length > 1 ? parts.slice(1).join(" ").slice(0, 4000) : undefined;
  return { short, extended };
}

export function parseSbbStrongsMarkdown(input: string): StrongsMdEntry[] {
  const entries: StrongsMdEntry[] = [];
  const sections = input.split(/(?=^## \d+\s+)/m);

  for (const section of sections) {
    const lines = section.split(/\r?\n/);
    const header = lines[0]?.trim();
    if (!header) continue;

    const match = header.match(/^## (\d+)\s+(.+)$/);
    if (!match) continue;

    const num = parseInt(match[1]!, 10);
    if (Number.isNaN(num) || num <= 0) continue;

    const { lemma, transliteration, language } = parseHeaderLine(num, match[2]!);
    if (!lemma) continue;

    const prefix = language === "greek" ? "G" : "H";
    const { short, extended } = collectDefinition(lines.slice(1));

    entries.push({
      strongNumber: `${prefix}${num}`,
      lemma,
      transliteration,
      language,
      shortDefinition: short,
      extendedDefinition: extended,
    });
  }

  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.strongNumber)) return false;
    seen.add(e.strongNumber);
    return true;
  });
}

export function isSbbStrongsFormat(input: string): boolean {
  return /^## \d+\s+[\u0590-\u05FF\u0370-\u03FF]/m.test(input) || /^## \d+\s+.+'[a-z]/im.test(input);
}
