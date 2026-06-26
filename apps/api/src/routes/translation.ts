import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getRepoRoot } from "@mrb/content-importers";
import {
  createTranslationService,
  TranslationApiKeyInvalidError,
  TranslationProviderNotConfiguredError,
  TranslationProviderNotImplementedError,
  TranslationRateLimitError,
  TranslationTextTooLongError,
  TranslationUnsupportedLanguageError,
} from "@mrb/translation-gateway";

const providerIdSchema = z.enum([
  "deepl",
  "google",
  "azure",
  "aws",
  "llm",
  "argos_local",
  "libretranslate_external",
  "md_translator",
]);

const sourceLangSchema = z.enum(["auto", "en", "fr", "es"]);
const modeSchema = z.enum(["user_api", "local", "disabled"]);

const translateSchema = z.object({
  sourceText: z.string().min(1),
  sourceLanguage: sourceLangSchema.default("en"),
  targetLanguage: z.literal("pt-BR").default("pt-BR"),
  provider: providerIdSchema.optional(),
  mode: modeSchema.optional(),
  theologicalMode: z.boolean().optional(),
  applyGlossary: z.boolean().optional(),
  preserveFormatting: z.boolean().optional(),
  useCache: z.boolean().optional(),
  context: z
    .object({
      documentId: z.string().optional(),
      documentTitle: z.string().optional(),
      author: z.string().optional(),
      tradition: z.string().optional(),
      doctrineTags: z.array(z.string()).optional(),
      biblicalReferences: z.array(z.string()).optional(),
      sourceUrl: z.string().optional(),
      licenseStatus: z.string().optional(),
    })
    .optional(),
});

const testProviderSchema = z.object({
  provider: providerIdSchema,
  apiKey: z.string().optional(),
  endpointUrl: z.string().optional(),
  region: z.string().optional(),
  model: z.string().optional(),
  deeplAccountType: z.enum(["free", "pro", "auto"]).optional(),
});

const settingsPatchSchema = z.object({
  mode: modeSchema.optional(),
  defaultProvider: providerIdSchema.optional(),
  defaultSourceLanguage: sourceLangSchema.optional(),
  cacheEnabled: z.boolean().optional(),
  glossaryEnabled: z.boolean().optional(),
  theologicalMode: z.boolean().optional(),
});

const providerSettingsPatchSchema = z.object({
  provider: providerIdSchema,
  apiKey: z.string().optional(),
  endpointUrl: z.string().optional(),
  region: z.string().optional(),
  model: z.string().optional(),
  enabled: z.boolean().optional(),
  deeplAccountType: z.enum(["free", "pro", "auto"]).optional(),
});

function mapTranslationError(error: unknown): { status: number; body: { error: string; code?: string } } {
  if (error instanceof TranslationTextTooLongError) {
    return { status: 400, body: { error: error.message, code: error.name } };
  }
  if (error instanceof TranslationUnsupportedLanguageError) {
    return { status: 400, body: { error: error.message, code: error.name } };
  }
  if (error instanceof TranslationProviderNotConfiguredError) {
    return { status: 400, body: { error: error.message, code: error.name } };
  }
  if (error instanceof TranslationApiKeyInvalidError) {
    return { status: 401, body: { error: error.message, code: error.name } };
  }
  if (error instanceof TranslationRateLimitError) {
    return { status: 429, body: { error: error.message, code: error.name } };
  }
  if (error instanceof TranslationProviderNotImplementedError) {
    return { status: 501, body: { error: error.message, code: error.name } };
  }
  const message = error instanceof Error ? error.message : "Erro interno na tradução.";
  return { status: 500, body: { error: message } };
}

export async function translationRoutes(app: FastifyInstance) {
  const service = createTranslationService(getRepoRoot());

  app.get("/providers", async () => ({
    providers: service.listProviderCapabilities(),
  }));

  app.get("/settings", async () => service.getSettings());

  app.post("/settings", async (req, reply) => {
    const parsed = settingsPatchSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const settings = await service.updateSettings(parsed.data);
    return { settings };
  });

  app.post("/settings/provider", async (req, reply) => {
    const parsed = providerSettingsPatchSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const { provider, ...patch } = parsed.data;
    const settings = await service.updateProviderSettings(provider, patch);
    return { settings };
  });

  app.post("/test-provider", async (req, reply) => {
    const parsed = testProviderSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const { provider, ...override } = parsed.data;
    const result = await service.testProvider(provider, override);
    return result;
  });

  app.post("/translate", async (req, reply) => {
    const parsed = translateSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    try {
      const result = await service.translate({
        ...parsed.data,
        mode: parsed.data.mode ?? "user_api",
        provider: parsed.data.provider ?? (await service.getSettings()).defaultProvider,
      });
      return result;
    } catch (error) {
      const mapped = mapTranslationError(error);
      return reply.status(mapped.status).send(mapped.body);
    }
  });
}
