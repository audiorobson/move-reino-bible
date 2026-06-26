import { createHash } from "crypto";

export function hashText(text: string): string {
  return createHash("sha256").update(text.normalize("NFC").trim()).digest("hex").slice(0, 32);
}

export function buildCacheKey(parts: {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
  glossaryVersion?: string;
  theologicalMode?: boolean;
}): string {
  const payload = [
    parts.sourceLanguage,
    parts.targetLanguage,
    parts.provider,
    parts.glossaryVersion ?? "none",
    parts.theologicalMode ? "1" : "0",
    hashText(parts.sourceText),
  ].join("|");
  return hashText(payload);
}
