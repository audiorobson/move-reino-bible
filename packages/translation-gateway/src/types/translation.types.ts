export type TranslationMode = "user_api" | "local" | "disabled";

export type TranslationProviderId =
  | "deepl"
  | "google"
  | "azure"
  | "aws"
  | "llm"
  | "argos_local"
  | "libretranslate_external"
  | "md_translator";

export type SupportedSourceLanguage = "auto" | "en" | "fr" | "es";

export type SupportedTargetLanguage = "pt-BR";

export type TranslationRequest = {
  sourceText: string;
  sourceLanguage: SupportedSourceLanguage;
  targetLanguage: SupportedTargetLanguage;
  provider: TranslationProviderId;
  mode: TranslationMode;
  theologicalMode?: boolean;
  applyGlossary?: boolean;
  preserveFormatting?: boolean;
  useCache?: boolean;
  context?: {
    documentId?: string;
    documentTitle?: string;
    author?: string;
    tradition?: string;
    doctrineTags?: string[];
    biblicalReferences?: string[];
    sourceUrl?: string;
    licenseStatus?: string;
  };
};

export type TranslationResponse = {
  translatedText: string;
  provider: TranslationProviderId;
  mode: TranslationMode;
  sourceLanguage: string;
  targetLanguage: SupportedTargetLanguage;
  cached: boolean;
  cacheKey?: string;
  glossaryApplied: boolean;
  glossaryVersion?: string;
  terminologyWarnings: string[];
  qualityWarnings: string[];
  sourceHash: string;
  createdAt: string;
};

export type ProviderTestResult = {
  provider: TranslationProviderId;
  ok: boolean;
  message: string;
  detectedCapabilities?: TranslationProviderCapabilities;
};

export type TranslationProviderCapabilities = {
  supportsApiKey: boolean;
  supportsLocal: boolean;
  supportsGlossary: boolean;
  supportsAutoDetect: boolean;
  supportsBatch: boolean;
  supportedSourceLanguages: SupportedSourceLanguage[];
  supportedTargetLanguages: SupportedTargetLanguage[];
};

export type TranslationProviderSettings = {
  provider: TranslationProviderId;
  apiKey?: string;
  endpointUrl?: string;
  region?: string;
  model?: string;
  enabled: boolean;
  deeplAccountType?: "free" | "pro" | "auto";
  extra?: Record<string, unknown>;
};

export type TranslationSettings = {
  mode: TranslationMode;
  defaultProvider: TranslationProviderId;
  defaultSourceLanguage: SupportedSourceLanguage;
  cacheEnabled: boolean;
  glossaryEnabled: boolean;
  theologicalMode: boolean;
  providers: Partial<Record<TranslationProviderId, TranslationProviderSettings>>;
};

export const DEFAULT_TRANSLATION_SETTINGS: TranslationSettings = {
  mode: "disabled",
  defaultProvider: "deepl",
  defaultSourceLanguage: "en",
  cacheEnabled: true,
  glossaryEnabled: true,
  theologicalMode: true,
  providers: {},
};
