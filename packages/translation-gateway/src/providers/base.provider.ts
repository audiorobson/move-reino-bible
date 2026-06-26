import type { TranslationProvider } from "../types/provider.types.js";
import type {
  ProviderTestResult,
  TranslationProviderCapabilities,
  TranslationProviderSettings,
  TranslationRequest,
  TranslationResponse,
} from "../types/translation.types.js";
import { TranslationProviderNotImplementedError } from "../errors/translation.errors.js";

export function createStubProvider(
  id: TranslationProvider["id"],
  label: string,
  capabilities: TranslationProviderCapabilities
): TranslationProvider {
  return {
    id,
    label,
    getCapabilities: () => capabilities,
    async testConnection(): Promise<ProviderTestResult> {
      return {
        provider: id,
        ok: false,
        message: `${label} está preparado na arquitetura, mas ainda não foi ativado nesta versão.`,
        detectedCapabilities: capabilities,
      };
    },
    async translate(): Promise<TranslationResponse> {
      throw new TranslationProviderNotImplementedError(id);
    },
  };
}

export function stubNotImplemented(
  _request: TranslationRequest,
  _settings: TranslationProviderSettings
): never {
  throw new TranslationProviderNotImplementedError("provider");
}
