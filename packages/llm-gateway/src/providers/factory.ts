import type { LlmProvider } from "../index.js";
import { createOpenAiProvider } from "./openai.js";

const SUPPORTED = new Set(["openai"]);

export function createProviderWithKey(provider: string, apiKey: string): LlmProvider {
  const id = provider.toLowerCase();
  if (!SUPPORTED.has(id)) {
    throw new Error(`Provedor '${provider}' ainda não suporta chave de API nesta versão`);
  }
  if (id === "openai") return createOpenAiProvider(apiKey);
  throw new Error(`Provedor '${provider}' não implementado`);
}

export function isProviderKeySupported(provider: string): boolean {
  return SUPPORTED.has(provider.toLowerCase());
}

export const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
};
