import { app, safeStorage } from "electron";
import fs from "fs";
import path from "path";

let cache: Record<string, string> = {};

function keysFilePath(): string {
  return path.join(app.getPath("userData"), "mrb-api-keys.dat");
}

export function loadStoredKeys(): void {
  try {
    const file = keysFilePath();
    if (!fs.existsSync(file)) {
      cache = {};
      return;
    }
    const buf = fs.readFileSync(file);
    const json =
      safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(buf)
        : buf.toString("utf-8");
    cache = JSON.parse(json) as Record<string, string>;
  } catch {
    cache = {};
  }
}

function persistKeys(): void {
  const json = JSON.stringify(cache);
  const buf = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(json)
    : Buffer.from(json, "utf-8");
  fs.writeFileSync(keysFilePath(), buf);
}

export function storeKey(provider: string, key: string): void {
  cache[provider] = key;
  persistKeys();
}

export function getKey(provider: string): string | undefined {
  return cache[provider];
}

export function hasKey(provider: string): boolean {
  return Boolean(cache[provider]?.trim());
}

export function listConfiguredProviders(): string[] {
  return Object.keys(cache).filter((p) => Boolean(cache[p]?.trim()));
}
