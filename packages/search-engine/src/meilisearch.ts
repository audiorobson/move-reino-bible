export const BIBLE_VERSES_INDEX = "bible_verses";

export interface BibleIndexDocument {
  id: string;
  versionId: string;
  versionAbbr: string;
  versionName: string;
  language: string;
  bookId: string;
  bookOsisId: string;
  bookNamePt: string;
  bookNameEn: string;
  testament: string;
  bookOrder: number;
  chapter: number;
  verse: number;
  text: string;
  normalizedText: string;
  reference: string;
}

export interface MeilisearchConfig {
  url: string;
  apiKey?: string;
}

export class MeilisearchBibleClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: MeilisearchConfig) {
    this.baseUrl = config.url.replace(/\/$/, "");
    this.headers = { "Content-Type": "application/json" };
    if (config.apiKey) {
      this.headers.Authorization = `Bearer ${config.apiKey}`;
    }
  }

  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async ensureIndex(): Promise<void> {
    try {
      await this.request("GET", `/indexes/${BIBLE_VERSES_INDEX}`);
    } catch {
      await this.request("POST", "/indexes", {
        uid: BIBLE_VERSES_INDEX,
        primaryKey: "id",
      });
    }
    await this.request("PATCH", `/indexes/${BIBLE_VERSES_INDEX}/settings`, {
      searchableAttributes: [
        "text",
        "normalizedText",
        "bookNamePt",
        "bookNameEn",
        "reference",
        "versionAbbr",
      ],
      filterableAttributes: [
        "versionAbbr",
        "versionId",
        "bookOsisId",
        "bookId",
        "testament",
        "chapter",
        "language",
      ],
      sortableAttributes: ["bookOrder", "chapter", "verse"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
      ],
    });
  }

  async clearIndex(): Promise<void> {
    await this.request("DELETE", `/indexes/${BIBLE_VERSES_INDEX}/documents`);
  }

  async addDocuments(documents: BibleIndexDocument[]): Promise<number> {
    const BATCH = 1000;
    let total = 0;
    for (let i = 0; i < documents.length; i += BATCH) {
      const batch = documents.slice(i, i + BATCH);
      const task = await this.request<{ taskUid: number }>(
        "POST",
        `/indexes/${BIBLE_VERSES_INDEX}/documents`,
        batch
      );
      await this.waitForTask(task.taskUid);
      total += batch.length;
    }
    return total;
  }

  async search(
    query: string,
    options?: {
      limit?: number;
      filter?: string;
      versionAbbr?: string;
    }
  ): Promise<BibleIndexDocument[]> {
    const filters: string[] = [];
    if (options?.versionAbbr) {
      filters.push(`versionAbbr = "${options.versionAbbr}"`);
    }
    if (options?.filter) {
      filters.push(options.filter);
    }

    const body: Record<string, unknown> = {
      q: query,
      limit: options?.limit ?? 50,
    };
    if (filters.length > 0) {
      body.filter = filters.join(" AND ");
    }

    const result = await this.request<{ hits: BibleIndexDocument[] }>(
      "POST",
      `/indexes/${BIBLE_VERSES_INDEX}/search`,
      body
    );
    return result.hits ?? [];
  }

  async getStats(): Promise<{ numberOfDocuments: number }> {
    const stats = await this.request<{ numberOfDocuments: number }>(
      "GET",
      `/indexes/${BIBLE_VERSES_INDEX}/stats`
    );
    return stats;
  }

  private async waitForTask(taskUid: number, maxWaitMs = 120_000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const task = await this.request<{ status: string; error?: { message: string } }>(
        "GET",
        `/tasks/${taskUid}`
      );
      if (task.status === "succeeded") return;
      if (task.status === "failed") {
        throw new Error(task.error?.message ?? `Meilisearch task ${taskUid} failed`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error(`Meilisearch task ${taskUid} timeout`);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Meilisearch ${method} ${path} → ${res.status}: ${text}`);
    }
    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }
}
