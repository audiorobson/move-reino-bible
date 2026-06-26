import type { LicenseStatus } from "@mrb/shared-types";
import { helloaoBookToOsis } from "./book-map.js";
import type { BibleVersionMeta, StandardBibleImport } from "./types.js";

const HELLOAO_BASE = "https://bible.helloao.org/api";

export interface HelloaoSourceConfig {
  helloaoId: string;
  abbreviation: string;
  name: string;
  language: string;
  licenseType: LicenseStatus;
  licenseUrl?: string;
  isPublicDomain?: boolean;
  attributionRequired?: boolean;
}

interface HelloaoBook {
  id: string;
  name: string;
  numberOfChapters: number;
}

interface HelloaoChapterContent {
  type: string;
  number?: number;
  content?: string | string[];
}

interface HelloaoChapterResponse {
  translation: {
    id: string;
    name: string;
    licenseUrl?: string;
    language: string;
  };
  book: { id: string; name: string };
  chapter: {
    number: number;
    content: HelloaoChapterContent[];
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`helloao fetch failed ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

function extractVerseText(content: string | string[] | undefined): string {
  if (!content) return "";
  if (Array.isArray(content)) return content.join(" ").trim();
  return content.trim();
}

export async function fetchFromHelloao(
  config: HelloaoSourceConfig,
  onProgress?: (msg: string) => void
): Promise<StandardBibleImport> {
  const log = onProgress ?? (() => {});
  const booksUrl = `${HELLOAO_BASE}/${config.helloaoId}/books.json`;
  log(`Buscando livros: ${booksUrl}`);

  const booksData = await fetchJson<{ books: HelloaoBook[] }>(booksUrl);
  const books = booksData.books ?? [];

  const version: BibleVersionMeta = {
    name: config.name,
    abbreviation: config.abbreviation,
    language: config.language,
    licenseType: config.licenseType,
    licenseUrl: config.licenseUrl ?? `${HELLOAO_BASE}/${config.helloaoId}/`,
    sourceUrl: `${HELLOAO_BASE}/${config.helloaoId}/complete.json`,
    copyrightStatus: config.isPublicDomain ? "public_domain" : config.licenseType,
    isPublicDomain: config.isPublicDomain ?? false,
    isCommercialAllowed: true,
    attributionRequired: config.attributionRequired ?? false,
    notes: `Importado automaticamente de Free Use Bible API (${config.helloaoId})`,
  };

  const verses: StandardBibleImport["verses"] = [];

  for (const book of books) {
    const osisId = helloaoBookToOsis(book.id);
    log(`  ${book.id} → ${osisId} (${book.numberOfChapters} capítulos)`);

    for (let ch = 1; ch <= book.numberOfChapters; ch++) {
      const chapterUrl = `${HELLOAO_BASE}/${config.helloaoId}/${book.id}/${ch}.json`;
      const chapterData = await fetchJson<HelloaoChapterResponse>(chapterUrl);

      for (const item of chapterData.chapter.content) {
        if (item.type !== "verse" || item.number === undefined) continue;
        const text = extractVerseText(item.content);
        if (!text) continue;
        verses.push({
          bookOsisId: osisId,
          chapter: ch,
          verse: item.number,
          text,
        });
      }
    }
  }

  log(`Total: ${verses.length} versículos`);
  return { version, verses };
}

export async function listHelloaoTranslations(): Promise<
  Array<{ id: string; name: string; language: string }>
> {
  const data = await fetchJson<{
    translations: Array<{ id: string; name: string; language: string }>;
  }>(`${HELLOAO_BASE}/available_translations.json`);
  return data.translations;
}
