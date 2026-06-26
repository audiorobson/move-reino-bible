import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import type { TranslationResponse } from "../types/translation.types.js";
import { buildCacheKey } from "../utils/hash-text.js";

type CacheEntry = TranslationResponse & { cacheKey: string };

type CacheFile = {
  version: 1;
  entries: Record<string, CacheEntry>;
};

const GLOSSARY_VERSION = "theological-v1";

export class TranslationCacheService {
  private readonly cachePath: string;
  private loaded: CacheFile | null = null;

  constructor(repoRoot: string) {
    this.cachePath = join(repoRoot, "data/translation/cache/gateway-cache.json");
  }

  private async ensureLoaded(): Promise<CacheFile> {
    if (this.loaded) return this.loaded;
    if (!existsSync(this.cachePath)) {
      this.loaded = { version: 1, entries: {} };
      return this.loaded;
    }
    const raw = await readFile(this.cachePath, "utf-8");
    this.loaded = JSON.parse(raw) as CacheFile;
    return this.loaded;
  }

  private async persist(): Promise<void> {
    if (!this.loaded) return;
    await mkdir(dirname(this.cachePath), { recursive: true });
    await writeFile(this.cachePath, JSON.stringify(this.loaded, null, 2), "utf-8");
  }

  buildKey(input: {
    sourceText: string;
    sourceLanguage: string;
    targetLanguage: string;
    provider: string;
    theologicalMode?: boolean;
  }): string {
    return buildCacheKey({
      ...input,
      glossaryVersion: GLOSSARY_VERSION,
      theologicalMode: input.theologicalMode,
    });
  }

  async get(cacheKey: string): Promise<TranslationResponse | null> {
    const file = await this.ensureLoaded();
    const entry = file.entries[cacheKey];
    if (!entry) return null;
    return { ...entry, cached: true, cacheKey };
  }

  async set(cacheKey: string, response: TranslationResponse): Promise<void> {
    const file = await this.ensureLoaded();
    file.entries[cacheKey] = { ...response, cacheKey, cached: true };
    await this.persist();
  }
}

export { GLOSSARY_VERSION };
