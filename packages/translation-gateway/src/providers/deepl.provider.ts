import type { TranslationProvider } from "../types/provider.types.js";
import type {
  ProviderTestResult,
  TranslationProviderCapabilities,
  TranslationProviderSettings,
  TranslationRequest,
  TranslationResponse,
} from "../types/translation.types.js";
import {
  TranslationApiKeyInvalidError,
  TranslationProviderNotConfiguredError,
  TranslationRateLimitError,
} from "../errors/translation.errors.js";
import { hashText } from "../utils/hash-text.js";
import { toDeepLLang } from "../utils/normalize-language.js";
import { sanitizeTranslationInput } from "../utils/sanitize-translation-input.js";

const FREE_URL = "https://api-free.deepl.com/v2/translate";
const PRO_URL = "https://api.deepl.com/v2/translate";

function resolveDeepLUrl(settings: TranslationProviderSettings): string {
  const type = settings.deeplAccountType ?? "auto";
  if (type === "pro") return PRO_URL;
  if (type === "free") return FREE_URL;
  const key = settings.apiKey ?? "";
  return key.endsWith(":fx") ? FREE_URL : PRO_URL;
}

async function callDeepL(
  text: string,
  settings: TranslationProviderSettings,
  sourceLanguage: TranslationRequest["sourceLanguage"]
): Promise<{ translated: string; detectedLang?: string }> {
  const apiKey = settings.apiKey?.trim();
  if (!apiKey) throw new TranslationProviderNotConfiguredError("Chave DeepL não configurada.");

  const body = new URLSearchParams();
  body.set("text", text);
  body.set("target_lang", "PT-BR");
  const src = toDeepLLang(sourceLanguage);
  if (src) body.set("source_lang", src);

  const res = await fetch(resolveDeepLUrl(settings), {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (res.status === 401 || res.status === 403) {
    throw new TranslationApiKeyInvalidError();
  }
  if (res.status === 429) {
    throw new TranslationRateLimitError();
  }
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`DeepL erro ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    translations?: Array<{ text: string; detected_source_language?: string }>;
  };
  const first = json.translations?.[0];
  if (!first?.text) throw new Error("Resposta DeepL sem tradução.");
  return { translated: first.text, detectedLang: first.detected_source_language };
}

export const deeplProvider: TranslationProvider = {
  id: "deepl",
  label: "DeepL",
  getCapabilities(): TranslationProviderCapabilities {
    return {
      supportsApiKey: true,
      supportsLocal: false,
      supportsGlossary: true,
      supportsAutoDetect: true,
      supportsBatch: false,
      supportedSourceLanguages: ["auto", "en", "fr", "es"],
      supportedTargetLanguages: ["pt-BR"],
    };
  },
  async testConnection(settings: TranslationProviderSettings): Promise<ProviderTestResult> {
    try {
      await callDeepL("test", settings, "en");
      return {
        provider: "deepl",
        ok: true,
        message: "Conexão com DeepL validada com sucesso.",
        detectedCapabilities: deeplProvider.getCapabilities(),
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao testar DeepL.";
      return { provider: "deepl", ok: false, message: msg };
    }
  },
  async translate(
    request: TranslationRequest,
    settings: TranslationProviderSettings
  ): Promise<TranslationResponse> {
    const sourceText = sanitizeTranslationInput(request.sourceText);
    const { translated, detectedLang } = await callDeepL(
      sourceText,
      settings,
      request.sourceLanguage
    );
    const now = new Date().toISOString();
    return {
      translatedText: translated,
      provider: "deepl",
      mode: request.mode,
      sourceLanguage: detectedLang?.toLowerCase() ?? request.sourceLanguage,
      targetLanguage: "pt-BR",
      cached: false,
      glossaryApplied: false,
      terminologyWarnings: [],
      qualityWarnings: ["Tradução automática. Revise antes de publicar."],
      sourceHash: hashText(sourceText),
      createdAt: now,
    };
  },
};
