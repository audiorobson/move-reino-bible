import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { API_DEFAULTS } from "@mrb/config";
import { bibleRoutes } from "./routes/bible.js";
import { importRoutes } from "./routes/import.js";
import { searchRoutes } from "./routes/search.js";
import { studyRoutes } from "./routes/studies.js";
import { aiRoutes, ragRoutes } from "./routes/ai.js";
import { lexiconRoutes } from "./routes/lexicon.js";
import { originalRoutes } from "./routes/original.js";
import { versificationRoutes } from "./routes/versification.js";
import { chainRoutes } from "./routes/chains.js";
import { spotifyRoutes } from "./routes/spotify.js";
import { libraryRoutes } from "./routes/library.js";
import { translationRoutes } from "./routes/translation.js";
import { THEOLOGY_TRADITIONS } from "@mrb/theology-taxonomy";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
  },
});

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(","),
});
await app.register(rateLimit, {
  max: API_DEFAULTS.rateLimitMax,
  timeWindow: API_DEFAULTS.rateLimitWindowMs,
});

app.get("/health", async () => ({
  status: "ok",
  service: "move-reino-bible-api",
  version: "0.1.0",
  timestamp: new Date().toISOString(),
}));

app.register(async (instance) => {
  instance.register(bibleRoutes, { prefix: "/bible" });
  instance.register(importRoutes, { prefix: "/import" });
}, { prefix: "/api/v1" });

app.register(async (instance) => {
  instance.register(searchRoutes, { prefix: "/search" });
}, { prefix: "/api/v1" });

app.register(async (instance) => {
  instance.register(studyRoutes, { prefix: "/studies" });
}, { prefix: "/api/v1" });

app.register(async (instance) => {
  instance.register(aiRoutes, { prefix: "/ai" });
  instance.register(ragRoutes, { prefix: "/rag" });
  instance.register(lexiconRoutes, { prefix: "/lexicon" });
  instance.register(originalRoutes, { prefix: "/original" });
  instance.register(versificationRoutes, { prefix: "/versification" });
  instance.register(chainRoutes, { prefix: "/chains" });
  instance.register(spotifyRoutes, { prefix: "/spotify" });
  instance.register(libraryRoutes, { prefix: "/library" });
  instance.register(translationRoutes, { prefix: "/translation" });
}, { prefix: "/api/v1" });

app.get("/api/v1/theology/traditions", async () => THEOLOGY_TRADITIONS);

const port = Number(process.env.API_PORT ?? API_DEFAULTS.port);
const host = process.env.API_HOST ?? API_DEFAULTS.host;

try {
  await app.listen({ port, host });
  console.log(`🚀 Move Reino Bible API rodando em http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
