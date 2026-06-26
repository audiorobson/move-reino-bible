import type { SupportedSourceLanguage } from "../types/translation.types.js";

const LANG_MAP: Record<string, SupportedSourceLanguage> = {
  en: "en",
  english: "en",
  "en-us": "en",
  "en-gb": "en",
  fr: "fr",
  french: "fr",
  "fr-fr": "fr",
  es: "es",
  spanish: "es",
  "es-es": "es",
  auto: "auto",
};

export function normalizeSourceLanguage(lang: string): SupportedSourceLanguage {
  const key = lang.trim().toLowerCase();
  return LANG_MAP[key] ?? "en";
}

export function toDeepLLang(lang: SupportedSourceLanguage): string | undefined {
  if (lang === "auto") return undefined;
  if (lang === "en") return "EN";
  if (lang === "fr") return "FR";
  if (lang === "es") return "ES";
  return "EN";
}

export function toMdTranslatorLang(lang: SupportedSourceLanguage): "en" | "fr" | "es" {
  if (lang === "fr") return "fr";
  if (lang === "es") return "es";
  return "en";
}

export function sourceLanguageLabel(lang: SupportedSourceLanguage): string {
  const labels: Record<SupportedSourceLanguage, string> = {
    auto: "Automático",
    en: "Inglês",
    fr: "Francês",
    es: "Espanhol",
  };
  return labels[lang];
}
