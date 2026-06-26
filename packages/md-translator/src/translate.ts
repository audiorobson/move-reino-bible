import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { translate } from "google-translate-api-x";

export type MdSourceLanguage = "en" | "fr" | "es";
export type MdTargetLanguage = "pt-BR";

export interface TranslationOptions {
  sourceLang?: MdSourceLanguage | string;
  targetLang?: MdTargetLanguage | string;
  cachePath?: string;
  batchSize?: number;
  delayMs?: number;
}

type CacheStore = Record<string, string>;

const BATCH_SEP = "\n|||MRB|||";
const GOOGLE_TARGET = "pt";

const CACHE_FILE_BY_LANG: Record<MdSourceLanguage, string> = {
  en: "en-pt-br.json",
  fr: "fr-pt-br.json",
  es: "es-pt-br.json",
};

function normalizeSourceLang(lang?: string): MdSourceLanguage {
  const v = (lang ?? "en").toLowerCase();
  if (v === "fr" || v.startsWith("fr")) return "fr";
  if (v === "es" || v.startsWith("es")) return "es";
  return "en";
}

async function loadCache(path?: string): Promise<CacheStore> {
  if (!path) return {};
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as CacheStore;
  } catch {
    return {};
  }
}

async function saveCache(path: string | undefined, cache: CacheStore): Promise<void> {
  if (!path) return;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(cache, null, 2), "utf-8");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function getDefaultCachePath(repoRoot: string, sourceLang: MdSourceLanguage = "en"): string {
  return join(repoRoot, "data/translation/cache", CACHE_FILE_BY_LANG[sourceLang]);
}

/** @deprecated Use getDefaultCachePath(repoRoot, "en") */
export function getLegacyEnCachePath(repoRoot: string): string {
  return join(repoRoot, "data/strong/index/translation-cache-en-pt.json");
}

export async function translateToPtBr(
  text: string,
  options?: TranslationOptions
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const sourceLang = normalizeSourceLang(options?.sourceLang);
  const cache = await loadCache(options?.cachePath);
  const cacheKey = `${sourceLang}::${trimmed}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const result = await translate(trimmed, {
    from: sourceLang,
    to: GOOGLE_TARGET,
  });

  const translated = typeof result.text === "string" ? result.text : trimmed;
  cache[cacheKey] = translated;
  await saveCache(options?.cachePath, cache);
  return translated;
}

export async function translateToPtBrBatch(
  texts: string[],
  options?: TranslationOptions
): Promise<string[]> {
  const batchSize = options?.batchSize ?? 20;
  const delayMs = options?.delayMs ?? 400;
  const sourceLang = normalizeSourceLang(options?.sourceLang);
  const cachePath = options?.cachePath;
  const cache = await loadCache(cachePath);
  const results: string[] = new Array(texts.length);

  for (let i = 0; i < texts.length; i += batchSize) {
    const slice = texts.slice(i, i + batchSize);
    const uncached: Array<{ idx: number; text: string; cacheKey: string }> = [];

    for (let j = 0; j < slice.length; j++) {
      const text = slice[j]!.trim();
      const globalIdx = i + j;
      if (!text) {
        results[globalIdx] = text;
        continue;
      }
      const cacheKey = `${sourceLang}::${text}`;
      if (cache[cacheKey]) {
        results[globalIdx] = cache[cacheKey];
      } else {
        uncached.push({ idx: globalIdx, text, cacheKey });
      }
    }

    if (uncached.length > 0) {
      const payload = uncached.map((u) => u.text).join(BATCH_SEP);
      try {
        const translated = await translate(payload, {
          from: sourceLang,
          to: GOOGLE_TARGET,
        });
        const parts = (translated.text as string).split(BATCH_SEP);
        for (let k = 0; k < uncached.length; k++) {
          const item = uncached[k]!;
          const part = (parts[k] ?? item.text).trim();
          cache[item.cacheKey] = part;
          results[item.idx] = part;
        }
      } catch {
        for (const item of uncached) {
          try {
            const single = await translate(item.text, { from: sourceLang, to: GOOGLE_TARGET });
            const part = (single.text as string).trim();
            cache[item.cacheKey] = part;
            results[item.idx] = part;
            await sleep(delayMs);
          } catch {
            results[item.idx] = item.text;
          }
        }
      }
      await saveCache(cachePath, cache);
      await sleep(delayMs);
    }
  }

  return results;
}

/** Traduz blocos de texto em .md preservando cabeçalhos, código e tags Strong. */
export async function translateMarkdownToPtBr(
  input: string,
  options?: TranslationOptions
): Promise<string> {
  const lines = input.split(/\r?\n/);
  const out: string[] = [];
  let codeBlock = false;
  const textBuffer: string[] = [];

  async function flushBuffer() {
    if (!textBuffer.length) return;
    const block = textBuffer.join("\n");
    textBuffer.length = 0;
    if (!block.trim()) {
      out.push(block);
      return;
    }
    const translated = await translateToPtBr(block, options);
    out.push(translated);
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      await flushBuffer();
      codeBlock = !codeBlock;
      out.push(line);
      continue;
    }
    if (codeBlock) {
      out.push(line);
      continue;
    }
    if (/^#{1,6}\s/.test(line) || /^\[([GH])\d+\]/.test(line.trim())) {
      await flushBuffer();
      out.push(line);
      continue;
    }
    textBuffer.push(line);
  }

  await flushBuffer();
  return out.join("\n");
}

/** Aliases EN → PT (compatibilidade) */
export async function translateEnToPt(text: string, options?: TranslationOptions): Promise<string> {
  return translateToPtBr(text, { ...options, sourceLang: "en" });
}

export async function translateEnToPtBatch(
  texts: string[],
  options?: TranslationOptions
): Promise<string[]> {
  return translateToPtBrBatch(texts, { ...options, sourceLang: "en" });
}

export async function translateMarkdownEnToPt(
  input: string,
  options?: TranslationOptions
): Promise<string> {
  return translateMarkdownToPtBr(input, { ...options, sourceLang: "en" });
}
