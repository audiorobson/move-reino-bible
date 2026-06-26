import { z } from "zod";

export const MRB_COLORS = {
  blue900: "#003A66",
  blue700: "#075188",
  blue500: "#126EAF",
  gold600: "#D1A058",
  gold500: "#E0B66E",
  bgDark900: "#080D16",
  bgDark850: "#0B1220",
  bgDark800: "#101827",
  textMain: "#F5F0E8",
  textMuted: "#8D9AAD",
  success: "#2FA36B",
  warning: "#D6A13D",
  danger: "#C94A4A",
  info: "#2F80C8",
  aiPurple: "#7C5CFF",
  ragGreen: "#3FA878",
  greekAccent: "#60A5FA",
  hebrewAccent: "#E0B66E",
  /** @deprecated use blue700 */
  navyDeep: "#080D16",
  sacredGold: "#D1A058",
} as const;

export const envSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgresql://")),
  API_PORT: z.coerce.number().default(4000),
  API_HOST: z.string().default("0.0.0.0"),
  API_JWT_SECRET: z.string().min(8).default("dev-secret-change-me"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  REDIS_URL: z.string().optional(),
  MEILISEARCH_URL: z.string().optional(),
  MEILISEARCH_API_KEY: z.string().optional(),
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_ARTIST_ID: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  return envSchema.parse(process.env);
}

export const API_DEFAULTS = {
  port: 4000,
  host: "0.0.0.0",
  rateLimitMax: 100,
  rateLimitWindowMs: 60_000,
} as const;

export const BIBLE_READER_DEFAULTS = {
  maxParallelColumns: 4,
  chapterLoadTimeoutMs: 300,
  defaultFontSize: 18,
} as const;

export const RAG_DEFAULTS = {
  chunkSizeTokens: 800,
  chunkOverlapTokens: 100,
  minRelevanceScore: 0.7,
  maxChunksPerQuery: 8,
  embeddingDimensions: 1536,
} as const;

export const LLM_DEFAULTS = {
  temperature: 0.3,
  maxTokens: 4096,
  defaultProvider: "openai",
} as const;
