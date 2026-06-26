import type { TranslationProvider } from "../types/provider.types.js";
import { deeplProvider } from "../providers/deepl.provider.js";
import { createMdTranslatorProvider } from "../providers/md-translator.provider.js";
import {
  argosLocalProvider,
  awsProvider,
  azureProvider,
  googleProvider,
  libretranslateProvider,
  llmProvider,
} from "../providers/stubs.providers.js";
import type { TranslationProviderId } from "../types/translation.types.js";

export function createProviderRegistry(repoRoot: string): Map<TranslationProviderId, TranslationProvider> {
  const mdTranslator = createMdTranslatorProvider(repoRoot);
  return new Map<TranslationProviderId, TranslationProvider>([
    ["deepl", deeplProvider],
    ["google", googleProvider],
    ["azure", azureProvider],
    ["aws", awsProvider],
    ["llm", llmProvider],
    ["argos_local", argosLocalProvider],
    ["libretranslate_external", libretranslateProvider],
    ["md_translator", mdTranslator],
  ]);
}

export function listProviders(repoRoot: string): TranslationProvider[] {
  return [...createProviderRegistry(repoRoot).values()];
}

export function getProvider(
  repoRoot: string,
  id: TranslationProviderId
): TranslationProvider | undefined {
  return createProviderRegistry(repoRoot).get(id);
}
