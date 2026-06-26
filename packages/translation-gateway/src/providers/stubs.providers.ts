import { createStubProvider } from "./base.provider.js";

export const googleProvider = createStubProvider("google", "Google Cloud Translation", {
  supportsApiKey: true,
  supportsLocal: false,
  supportsGlossary: true,
  supportsAutoDetect: true,
  supportsBatch: true,
  supportedSourceLanguages: ["auto", "en", "fr", "es"],
  supportedTargetLanguages: ["pt-BR"],
});

export const azureProvider = createStubProvider("azure", "Azure Translator", {
  supportsApiKey: true,
  supportsLocal: false,
  supportsGlossary: true,
  supportsAutoDetect: true,
  supportsBatch: true,
  supportedSourceLanguages: ["auto", "en", "fr", "es"],
  supportedTargetLanguages: ["pt-BR"],
});

export const awsProvider = createStubProvider("aws", "Amazon Translate", {
  supportsApiKey: true,
  supportsLocal: false,
  supportsGlossary: true,
  supportsAutoDetect: true,
  supportsBatch: true,
  supportedSourceLanguages: ["auto", "en", "fr", "es"],
  supportedTargetLanguages: ["pt-BR"],
});

export const llmProvider = createStubProvider("llm", "LLM Translation", {
  supportsApiKey: true,
  supportsLocal: false,
  supportsGlossary: true,
  supportsAutoDetect: true,
  supportsBatch: false,
  supportedSourceLanguages: ["auto", "en", "fr", "es"],
  supportedTargetLanguages: ["pt-BR"],
});

export const argosLocalProvider = createStubProvider("argos_local", "Argos Local (EN → PT-BR)", {
  supportsApiKey: false,
  supportsLocal: true,
  supportsGlossary: false,
  supportsAutoDetect: false,
  supportsBatch: false,
  supportedSourceLanguages: ["en"],
  supportedTargetLanguages: ["pt-BR"],
});

export const libretranslateProvider = createStubProvider(
  "libretranslate_external",
  "LibreTranslate (externo)",
  {
    supportsApiKey: true,
    supportsLocal: false,
    supportsGlossary: false,
    supportsAutoDetect: true,
    supportsBatch: false,
    supportedSourceLanguages: ["auto", "en", "fr", "es"],
    supportedTargetLanguages: ["pt-BR"],
  }
);
