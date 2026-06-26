import {
  TranslationProviderNotConfiguredError,
  TranslationUnsupportedLanguageError,
} from "../errors/translation.errors.js";
import { applyTheologicalGlossary, resolveGlossaryPair } from "../glossary/glossary-registry.js";
import { getProvider, listProviders } from "../providers/provider-registry.js";
import { TranslationCacheService, GLOSSARY_VERSION } from "./translation-cache.service.js";
import { TranslationSettingsService } from "./translation-settings.service.js";
import type {
  ProviderTestResult,
  TranslationProviderCapabilities,
  TranslationProviderId,
  TranslationProviderSettings,
  TranslationRequest,
  TranslationResponse,
  TranslationSettings,
} from "../types/translation.types.js";
import {
  assertTranslationLength,
  sanitizeTranslationInput,
} from "../utils/sanitize-translation-input.js";
import { normalizeSourceLanguage } from "../utils/normalize-language.js";

export type TranslationServiceOptions = {
  repoRoot: string;
};

export class TranslationService {
  private readonly settingsService: TranslationSettingsService;
  private readonly cacheService: TranslationCacheService;
  private readonly repoRoot: string;

  constructor(options: TranslationServiceOptions) {
    this.repoRoot = options.repoRoot;
    this.settingsService = new TranslationSettingsService(options.repoRoot);
    this.cacheService = new TranslationCacheService(options.repoRoot);
  }

  async getSettings(): Promise<TranslationSettings> {
    return this.settingsService.getSettings(true);
  }

  async updateSettings(patch: Partial<TranslationSettings>): Promise<TranslationSettings> {
    return this.settingsService.updateSettings(patch);
  }

  async updateProviderSettings(
    providerId: TranslationProviderId,
    patch: Partial<TranslationProviderSettings>
  ): Promise<TranslationSettings> {
    return this.settingsService.updateProviderSettings(providerId, patch);
  }

  listProviderCapabilities(): Array<{
    id: TranslationProviderId;
    label: string;
    capabilities: TranslationProviderCapabilities;
  }> {
    return listProviders(this.repoRoot).map((p) => ({
      id: p.id,
      label: p.label,
      capabilities: p.getCapabilities(),
    }));
  }

  async testProvider(
    providerId: TranslationProviderId,
    override?: Partial<TranslationProviderSettings>
  ): Promise<ProviderTestResult> {
    const provider = getProvider(this.repoRoot, providerId);
    if (!provider) {
      return { provider: providerId, ok: false, message: "Provedor desconhecido." };
    }

    const settings = await this.resolveProviderSettings(providerId, override);
    return provider.testConnection(settings);
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const settings = await this.settingsService.getSettings(false);
    if (settings.mode === "disabled") {
      throw new TranslationProviderNotConfiguredError(
        "Tradução desativada. Ative em Configurações > Tradução."
      );
    }

    const sourceText = sanitizeTranslationInput(request.sourceText);
    assertTranslationLength(sourceText);

    const providerId =
      settings.mode === "local"
        ? "md_translator"
        : (request.provider ?? settings.defaultProvider);
    const provider = getProvider(this.repoRoot, providerId);
    if (!provider) {
      throw new TranslationProviderNotConfiguredError(`Provedor inválido: ${providerId}`);
    }

    const sourceLanguage = normalizeSourceLanguage(request.sourceLanguage);
    const providerSettings = await this.resolveProviderSettings(providerId);
    const caps = provider.getCapabilities();

    if (!caps.supportedSourceLanguages.includes(sourceLanguage)) {
      throw new TranslationUnsupportedLanguageError(
        `Idioma "${sourceLanguage}" não suportado por ${provider.label}.`
      );
    }

    const useCache = request.useCache ?? settings.cacheEnabled;
    const theologicalMode = request.theologicalMode ?? settings.theologicalMode;
    const applyGlossary = request.applyGlossary ?? settings.glossaryEnabled;

    const cacheKey = this.cacheService.buildKey({
      sourceText,
      sourceLanguage,
      targetLanguage: request.targetLanguage,
      provider: providerId,
      theologicalMode,
    });

    if (useCache) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;
    }

    const normalizedRequest: TranslationRequest = {
      ...request,
      sourceText,
      sourceLanguage,
      provider: providerId,
      mode: settings.mode,
      theologicalMode,
      applyGlossary,
    };

    let response = await provider.translate(normalizedRequest, providerSettings);

    if (applyGlossary && theologicalMode && caps.supportsGlossary) {
      const pair = resolveGlossaryPair(response.sourceLanguage);
      const glossaryResult = applyTheologicalGlossary(sourceText, response.translatedText, pair);
      response = {
        ...response,
        translatedText: glossaryResult.text,
        glossaryApplied: glossaryResult.applied.length > 0,
        glossaryVersion: GLOSSARY_VERSION,
        terminologyWarnings: [...response.terminologyWarnings, ...glossaryResult.warnings],
      };
    }

    if (useCache) {
      await this.cacheService.set(cacheKey, response);
    }

    return response;
  }

  private async resolveProviderSettings(
    providerId: TranslationProviderId,
    override?: Partial<TranslationProviderSettings>
  ): Promise<TranslationProviderSettings> {
    const stored = await this.settingsService.getProviderSettings(providerId, false);
    const base: TranslationProviderSettings = stored ?? {
      provider: providerId,
      enabled: providerId === "md_translator",
    };

    if (override?.apiKey?.includes("•")) {
      const { apiKey: _ignored, ...rest } = override;
      return { ...base, ...rest };
    }

    return { ...base, ...override };
  }
}

export function createTranslationService(repoRoot: string): TranslationService {
  return new TranslationService({ repoRoot });
}
