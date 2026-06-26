import { parseJsonFlat } from "./json-flat.js";
import { isNestedBibleFormat, parseJsonNested, versionFromFilename } from "./json-nested.js";
import type { BibleVersionMeta, StandardBibleImport } from "./types.js";

export function parseJsonBible(
  input: string | Buffer,
  options?: { filePath?: string; version?: Partial<BibleVersionMeta> }
): StandardBibleImport {
  const raw = typeof input === "string" ? input : input.toString("utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (isNestedBibleFormat(parsed)) {
    const base = versionFromFilename(options?.filePath ?? "local.json");
    const version: BibleVersionMeta = { ...base, ...options?.version };
    return parseJsonNested(raw, version);
  }

  return parseJsonFlat(raw);
}
