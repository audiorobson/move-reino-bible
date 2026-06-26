export * from "./types.js";
export * from "./book-map.js";
export * from "./json-flat.js";
export * from "./json-nested.js";
export * from "./json-auto.js";
export * from "./helloao.js";
export * from "./manifest.js";
export * from "./persist.js";
export * from "./import-service.js";

import { parseJsonFlat, validateImport } from "./json-flat.js";

export interface ImportResult {
  versionAbbreviation: string;
  versesImported: number;
  versesSkipped: number;
  errors: string[];
}

export interface BibleImporter {
  name: string;
  parse(input: string | Buffer): ReturnType<typeof parseJsonFlat>;
  validate: typeof validateImport;
}

export class JsonBibleImporter implements BibleImporter {
  name = "json";
  parse = parseJsonFlat;
  validate = validateImport;
}

export function createImporter(format: "json" | "osis" | "usfm"): BibleImporter {
  switch (format) {
    case "json":
      return new JsonBibleImporter();
    default:
      throw new Error(`Importador '${format}' ainda não implementado. Use 'json'.`);
  }
}
