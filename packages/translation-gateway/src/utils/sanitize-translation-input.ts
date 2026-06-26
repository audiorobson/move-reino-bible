import { TranslationTextTooLongError } from "../errors/translation.errors.js";

const MAX_CHARS = 5000;

export function sanitizeTranslationInput(text: string): string {
  return text.replace(/\u0000/g, "").trim();
}

export function assertTranslationLength(text: string, max = MAX_CHARS): void {
  if (text.length > max) {
    throw new TranslationTextTooLongError(max);
  }
}

export { MAX_CHARS as TRANSLATION_MAX_CHARS };
