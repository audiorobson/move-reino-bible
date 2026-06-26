import { join } from "path";
import {
  translateToPtBr,
  type MdSourceLanguage,
} from "@mrb/md-translator";
import type { TranslationProvider } from "../types/provider.types.js";
import type {
  ProviderTestResult,
  TranslationProviderCapabilities,
  TranslationProviderSettings,
  TranslationRequest,
  TranslationResponse,
} from "../types/translation.types.js";
import {
  TranslationRateLimitError,
  TranslationUnsupportedLanguageError,
} from "../errors/translation.errors.js";
import { hashText } from "../utils/hash-text.js";
import { toMdTranslatorLang } from "../utils/normalize-language.js";
import { sanitizeTranslationInput } from "../utils/sanitize-translation-input.js";

export function resolveMdTranslatorCachePath(repoRoot: string, sourceLang: MdSourceLanguage): string {
  return join(repoRoot, "data/translation/cache", `${sourceLang}-pt-br.json`);
}

export function createMdTranslatorProvider(repoRoot: string): TranslationProvider {
  return {
    id: "md_translator",
    label: "Tradutor gratuito (Google unofficial)",
    getCapabilities(): TranslationProviderCapabilities {
      return {
        supportsApiKey: false,
        supportsLocal: true,
        supportsGlossary: false,
        supportsAutoDetect: false,
        supportsBatch: true,
        supportedSourceLanguages: ["en", "fr", "es"],
        supportedTargetLanguages: ["pt-BR"],
      };
    },
    async testConnection(): Promise<ProviderTestResult> {
      try {
        const pt = await translateToPtBr("grace", {
          sourceLang: "en",
          cachePath: resolveMdTranslatorCachePath(repoRoot, "en"),
        });
        return {
          provider: "md_translator",
          ok: Boolean(pt),
          message: pt ? "Tradutor gratuito disponível (EN → PT-BR)." : "Falha no teste.",
          detectedCapabilities: createMdTranslatorProvider(repoRoot).getCapabilities(),
        };
      } catch (e) {
        return {
          provider: "md_translator",
          ok: false,
          message: e instanceof Error ? e.message : "Tradutor gratuito indisponível.",
        };
      }
    },
    async translate(
      request: TranslationRequest,
      _settings: TranslationProviderSettings
    ): Promise<TranslationResponse> {
      if (request.sourceLanguage === "auto") {
        throw new TranslationUnsupportedLanguageError(
          "O tradutor gratuito requer idioma fonte explícito (en, fr ou es)."
        );
      }
      const sourceLang = toMdTranslatorLang(request.sourceLanguage);
      const sourceText = sanitizeTranslationInput(request.sourceText);
      let translated: string;
      try {
        translated = await translateToPtBr(sourceText, {
          sourceLang,
          cachePath: resolveMdTranslatorCachePath(repoRoot, sourceLang),
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/too many requests|429|rate limit/i.test(msg)) {
          throw new TranslationRateLimitError(
            "Limite do tradutor gratuito atingido. Aguarde alguns minutos ou use DeepL."
          );
        }
        throw e;
      }
      return {
        translatedText: translated,
        provider: "md_translator",
        mode: request.mode,
        sourceLanguage: sourceLang,
        targetLanguage: "pt-BR",
        cached: false,
        glossaryApplied: false,
        terminologyWarnings: [],
        qualityWarnings: [
          "Tradução automática gratuita. Revise antes de publicar.",
          "Não use para conteúdo protegido sem verificar licença.",
        ],
        sourceHash: hashText(sourceText),
        createdAt: new Date().toISOString(),
      };
    },
  };
}
