import { z } from "zod";
import { ipcMain, app, shell } from "electron";
import { registerPrintHandlers } from "./print-handlers.js";
import { registerWindowHandlers } from "./window-handlers.js";
import { registerStudyHandlers } from "./study-handlers.js";
import { registerLibraryHandlers } from "./library-handlers.js";
import {
  loadStoredKeys,
  storeKey,
  getKey,
  hasKey,
  listConfiguredProviders,
} from "./keys-store.js";

const apiKeySchema = z.object({
  provider: z.string().min(1),
  key: z.string().min(8),
});

export function registerIpcHandlers() {
  loadStoredKeys();
  registerPrintHandlers();
  registerWindowHandlers();
  registerStudyHandlers();
  registerLibraryHandlers();

  ipcMain.handle("app:getVersion", () => app.getVersion());

  ipcMain.handle("app:getApiUrl", () => {
    return process.env.API_URL ?? "http://localhost:4000";
  });

  ipcMain.handle("app:openExternal", async (_event, url: unknown) => {
    if (typeof url !== "string") return { success: false, error: "URL inválida" };
    const allowed =
      url.startsWith("http://") || url.startsWith("https://") || url.startsWith("spotify:");
    if (!allowed) return { success: false, error: "Protocolo não permitido" };
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch {
      return { success: false, error: "Falha ao abrir link" };
    }
  });

  ipcMain.handle("security:storeApiKey", (_event, payload: unknown) => {
    const parsed = apiKeySchema.safeParse(payload);
    if (!parsed.success) return { success: false, error: "Payload inválido" };
    storeKey(parsed.data.provider, parsed.data.key);
    return { success: true };
  });

  ipcMain.handle("security:getApiKeyStatus", (_event, provider: string) => {
    return { configured: hasKey(provider) };
  });

  ipcMain.handle("security:listApiKeyStatus", () => {
    const providers = ["openai", "anthropic", "gemini", "groq", "openrouter", "ollama"];
    return providers.map((provider) => ({
      provider,
      configured: hasKey(provider),
    }));
  });

  ipcMain.handle("security:getApiKey", (_event, provider: string) => {
    if (!provider) return { configured: false, key: null };
    const key = getKey(provider);
    if (!key) return { configured: false, key: null };
    return { configured: true, key };
  });
}
