import type {
  ProviderTestResult,
  TranslationProviderCapabilities,
  TranslationProviderId,
  TranslationProviderSettings,
  TranslationRequest,
  TranslationResponse,
} from "./translation.types.js";

export interface TranslationProvider {
  id: TranslationProviderId;
  label: string;
  getCapabilities(): TranslationProviderCapabilities;
  testConnection(settings: TranslationProviderSettings): Promise<ProviderTestResult>;
  translate(
    request: TranslationRequest,
    settings: TranslationProviderSettings
  ): Promise<TranslationResponse>;
}
