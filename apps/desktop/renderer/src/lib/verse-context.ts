import type { AppModule } from "@mrb/shared-types";

export const VERSE_DRAG_MIME = "application/x-mrb-verse";

export interface VerseContext {
  verse: number;
  bookOsisId: string;
  bookName: string;
  chapter: number;
  version: string;
  text: string;
  reference: string;
}

export const VERSE_DROP_MODULES: AppModule[] = [
  "ai",
  "studies",
  "chains",
  "strong",
  "theology-rag",
  "originals",
  "search",
];

export function buildVerseReference(bookName: string, chapter: number, verse: number): string {
  return `${bookName} ${chapter}:${verse}`;
}

export function buildVerseContext(input: {
  verse: number;
  bookOsisId: string;
  bookName: string;
  chapter: number;
  version: string;
  text: string;
}): VerseContext {
  return {
    ...input,
    reference: buildVerseReference(input.bookName, input.chapter, input.verse),
  };
}

export function formatVerseForClipboard(ctx: VerseContext): string {
  return `${ctx.reference} (${ctx.version})\n"${ctx.text}"`;
}

export function setVerseDragData(event: React.DragEvent, ctx: VerseContext): void {
  event.dataTransfer.setData(VERSE_DRAG_MIME, JSON.stringify(ctx));
  event.dataTransfer.setData("text/plain", formatVerseForClipboard(ctx));
  event.dataTransfer.effectAllowed = "copy";
}

export function getVerseFromDragEvent(event: React.DragEvent): VerseContext | null {
  const raw = event.dataTransfer.getData(VERSE_DRAG_MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VerseContext;
  } catch {
    return null;
  }
}

export function verseMatches(
  a: VerseContext | null,
  b: { bookOsisId: string; chapter: number; verse: number; version?: string }
): boolean {
  if (!a) return false;
  return (
    a.bookOsisId === b.bookOsisId &&
    a.chapter === b.chapter &&
    a.verse === b.verse &&
    (b.version === undefined || a.version === b.version)
  );
}
