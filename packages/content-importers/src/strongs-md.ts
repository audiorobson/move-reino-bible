export interface StrongsMdEntry {
  strongNumber: string;
  lemma: string;
  transliteration?: string;
  language: "greek" | "hebrew" | "aramaic";
  pronunciation?: string;
  shortDefinition: string;
  extendedDefinition?: string;
  semanticDomain?: string;
}

const FIELD_MAP: Record<string, keyof StrongsMdEntry> = {
  lemma: "lemma",
  transliteration: "transliteration",
  language: "language",
  pronunciation: "pronunciation",
  "short definition": "shortDefinition",
  "extended definition": "extendedDefinition",
  "semantic domain": "semanticDomain",
};

function normalizeLanguage(raw: string): StrongsMdEntry["language"] {
  const v = raw.toLowerCase().trim();
  if (v.startsWith("heb")) return "hebrew";
  if (v.startsWith("ara")) return "aramaic";
  return "greek";
}

function parseFieldLine(line: string): { key: keyof StrongsMdEntry; value: string } | null {
  const match = line.trim().match(/^-\s+\*\*([^:]+):\*\*\s*(.+)$/);
  if (!match) return null;
  const fieldKey = FIELD_MAP[match[1]!.trim().toLowerCase()];
  if (!fieldKey) return null;
  return { key: fieldKey, value: match[2]!.trim() };
}

export function parseStrongsMarkdown(input: string): StrongsMdEntry[] {
  const entries: StrongsMdEntry[] = [];
  const sections = input.split(/^##\s+/m).filter(Boolean);

  for (const section of sections) {
    const lines = section.split(/\r?\n/);
    const header = lines[0]?.trim();
    if (!header || !/^[GH]\d+$/i.test(header)) continue;

    const entry: Partial<StrongsMdEntry> = {
      strongNumber: header.toUpperCase(),
    };

    for (const line of lines.slice(1)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "---") continue;
      const parsed = parseFieldLine(trimmed);
      if (!parsed) continue;
      if (parsed.key === "language") {
        entry.language = normalizeLanguage(parsed.value);
      } else {
        (entry as Record<string, string>)[parsed.key] = parsed.value;
      }
    }

    if (!entry.lemma || !entry.shortDefinition) continue;
    if (!entry.language) {
      entry.language = entry.strongNumber!.startsWith("H") ? "hebrew" : "greek";
    }

    entries.push(entry as StrongsMdEntry);
  }

  return entries;
}
