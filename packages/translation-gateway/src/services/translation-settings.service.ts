import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import {
  DEFAULT_TRANSLATION_SETTINGS,
  type TranslationProviderId,
  type TranslationProviderSettings,
  type TranslationSettings,
} from "../types/translation.types.js";

type SettingsFile = {
  version: 1;
  settings: TranslationSettings;
};

function maskApiKey(key?: string): string | undefined {
  if (!key) return undefined;
  if (key.length <= 8) return "••••••••";
  return `${"•".repeat(Math.min(key.length - 4, 12))}${key.slice(-4)}`;
}

function sanitizeProviderForRead(
  provider: TranslationProviderSettings
): TranslationProviderSettings {
  return {
    ...provider,
    apiKey: provider.apiKey ? maskApiKey(provider.apiKey) : undefined,
  };
}

export class TranslationSettingsService {
  private readonly settingsPath: string;
  private loaded: SettingsFile | null = null;

  constructor(repoRoot: string) {
    this.settingsPath = join(repoRoot, "data/translation/settings.json");
  }

  private async ensureLoaded(): Promise<SettingsFile> {
    if (this.loaded) return this.loaded;
    if (!existsSync(this.settingsPath)) {
      this.loaded = { version: 1, settings: { ...DEFAULT_TRANSLATION_SETTINGS } };
      return this.loaded;
    }
    const raw = await readFile(this.settingsPath, "utf-8");
    const parsed = JSON.parse(raw) as SettingsFile;
    this.loaded = {
      version: 1,
      settings: { ...DEFAULT_TRANSLATION_SETTINGS, ...parsed.settings },
    };
    return this.loaded;
  }

  private async persist(): Promise<void> {
    if (!this.loaded) return;
    await mkdir(dirname(this.settingsPath), { recursive: true });
    await writeFile(this.settingsPath, JSON.stringify(this.loaded, null, 2), "utf-8");
  }

  async getSettings(maskSecrets = true): Promise<TranslationSettings> {
    const file = await this.ensureLoaded();
    if (!maskSecrets) return structuredClone(file.settings);

    const providers: TranslationSettings["providers"] = {};
    for (const [id, cfg] of Object.entries(file.settings.providers)) {
      if (cfg) providers[id as TranslationProviderId] = sanitizeProviderForRead(cfg);
    }
    return { ...file.settings, providers };
  }

  async updateSettings(patch: Partial<TranslationSettings>): Promise<TranslationSettings> {
    const file = await this.ensureLoaded();
    file.settings = {
      ...file.settings,
      ...patch,
      providers: {
        ...file.settings.providers,
        ...(patch.providers ?? {}),
      },
    };
    await this.persist();
    return this.getSettings(true);
  }

  async updateProviderSettings(
    providerId: TranslationProviderId,
    patch: Partial<TranslationProviderSettings>
  ): Promise<TranslationSettings> {
    const file = await this.ensureLoaded();
    const current = file.settings.providers[providerId] ?? {
      provider: providerId,
      enabled: false,
    };

    const next: TranslationProviderSettings = { ...current, ...patch, provider: providerId };

    if (patch.apiKey !== undefined) {
      const masked = maskApiKey(patch.apiKey);
      const looksMasked = patch.apiKey.includes("•") || patch.apiKey === masked;
      if (looksMasked && current.apiKey) {
        next.apiKey = current.apiKey;
      }
    }

    file.settings.providers[providerId] = next;
    await this.persist();
    return this.getSettings(true);
  }

  async getProviderSettings(
    providerId: TranslationProviderId,
    maskSecrets = false
  ): Promise<TranslationProviderSettings | undefined> {
    const file = await this.ensureLoaded();
    const cfg = file.settings.providers[providerId];
    if (!cfg) return undefined;
    return maskSecrets ? sanitizeProviderForRead(cfg) : structuredClone(cfg);
  }
}
