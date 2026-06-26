import { matchesSearch, parseReference } from "@mrb/bible-core";
import type { BibleVerseDto, SearchFilters, SearchMode, SearchResult } from "@mrb/shared-types";

export interface SearchableVerse extends BibleVerseDto {
  bookOsisId: string;
  bookName: string;
  normalizedText: string;
}

export interface SearchQuery {
  query: string;
  mode: SearchMode;
  filters?: SearchFilters;
  limit?: number;
}

export class BibleSearchEngine {
  search(verses: SearchableVerse[], query: SearchQuery): SearchResult[] {
    const limit = query.limit ?? 50;

    if (query.mode === "reference") {
      const ref = parseReference(query.query);
      if (!ref) return [];
      return verses
        .filter((v) => {
          if (v.bookOsisId !== ref.bookOsisId && v.bookId !== ref.bookOsisId) return false;
          if (v.chapter !== ref.chapter) return false;
          if (ref.verseStart !== undefined) {
            const end = ref.verseEnd ?? ref.verseStart;
            return v.verse >= ref.verseStart && v.verse <= end;
          }
          return true;
        })
        .slice(0, limit)
        .map((v) => ({ verse: v, bookName: v.bookName, score: 1 }));
    }

    if (query.mode === "strong" || query.mode === "lemma") {
      return [];
    }

    const textMode = query.mode === "hybrid" || query.mode === "semantic" ? "phrase" : query.mode;
    const validModes = ["exact", "phrase", "all_words", "any_word"] as const;
    const mode = validModes.includes(textMode as typeof validModes[number])
      ? (textMode as typeof validModes[number])
      : "phrase";

    let results = verses
      .filter((v) => matchesSearch(v.normalizedText, { query: query.query, mode }))
      .map((v) => ({
        verse: v,
        bookName: v.bookName,
        score: this.computeScore(v.normalizedText, query.query),
        highlight: this.highlight(v.text, query.query),
      }));

    if (query.filters?.testament) {
      const isOT = query.filters.testament === "OT";
      results = results.filter((r) => {
        const order = r.verse.bookId;
        return isOT ? true : true;
      });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private computeScore(text: string, query: string): number {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    let score = 0;
    for (const term of terms) {
      if (text.includes(term)) score += 1;
    }
    return score / Math.max(terms.length, 1);
  }

  private highlight(text: string, query: string): string {
    const terms = query.split(/\s+/).filter(Boolean);
    let result = text;
    for (const term of terms) {
      const regex = new RegExp(`(${term})`, "gi");
      result = result.replace(regex, "**$1**");
    }
    return result;
  }
}

export const bibleSearchEngine = new BibleSearchEngine();

export {
  MeilisearchBibleClient,
  BIBLE_VERSES_INDEX,
  type BibleIndexDocument,
  type MeilisearchConfig,
} from "./meilisearch.js";

export {
  buildIndexDocuments,
  exportVersionJsonIndex,
  indexBiblesFromDatabase,
  type BibleJsonIndexExport,
  type IndexBiblesOptions,
  type IndexBiblesResult,
} from "./bible-indexer.js";
