export {
  TranslationProviderNotConfiguredError,
  TranslationProviderNotImplementedError,
  TranslationApiKeyInvalidError,
  TranslationRateLimitError,
  TranslationUnsupportedLanguageError,
  TranslationLocalEngineUnavailableError,
  TranslationTextTooLongError,
} from "./errors/translation.errors.js";

export type {
  TranslationMode,
  TranslationProviderId,
  SupportedSourceLanguage,
  SupportedTargetLanguage,
  TranslationRequest,
  TranslationResponse,
  ProviderTestResult,
  TranslationProviderCapabilities,
  TranslationProviderSettings,
  TranslationSettings,
} from "./types/translation.types.js";

export { DEFAULT_TRANSLATION_SETTINGS } from "./types/translation.types.js";

export type { TranslationProvider } from "./types/provider.types.js";
export type { GlossaryEntry, GlossaryPair } from "./types/glossary.types.js";

export {
  applyTheologicalGlossary,
  getGlossaryForPair,
  resolveGlossaryPair,
} from "./glossary/glossary-registry.js";

export { createTranslationService, TranslationService } from "./services/translation.service.js";
export { TranslationSettingsService } from "./services/translation-settings.service.js";
export { TranslationCacheService } from "./services/translation-cache.service.js";

export { listProviders, getProvider, createProviderRegistry } from "./providers/provider-registry.js";

export {
  normalizeSourceLanguage,
  sourceLanguageLabel,
  toDeepLLang,
  toMdTranslatorLang,
} from "./utils/normalize-language.js";

export { hashText, buildCacheKey } from "./utils/hash-text.js";
export {
  sanitizeTranslationInput,
  assertTranslationLength,
  TRANSLATION_MAX_CHARS,
} from "./utils/sanitize-translation-input.js";
