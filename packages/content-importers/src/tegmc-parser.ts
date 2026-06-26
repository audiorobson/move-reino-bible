import { readFile } from "fs/promises";

const MORPH_LINE_RE = /^([A-Z][\w-]+)\tFunction=/;

export async function loadGreekMorphologyMap(filePath: string): Promise<Map<string, string>> {
  const raw = await readFile(filePath, "utf-8");
  const map = new Map<string, string>();

  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(MORPH_LINE_RE);
    if (!m) continue;
    const code = m[1]!;
    const expanded = line.slice(line.indexOf("Function=")).replace(/^Function=/, "").trim();
    map.set(code, expanded);
  }

  return map;
}

export function expandMorphology(
  code: string | null | undefined,
  map: Map<string, string>
): string | undefined {
  if (!code) return undefined;
  return map.get(code) ?? code;
}
