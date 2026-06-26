import { describe, it, expect } from "vitest";
import { parseReference, normalizeText, formatReference, matchesSearch } from "./index.js";

describe("bible-core", () => {
  it("parses João 3:16", () => {
    const ref = parseReference("João 3:16");
    expect(ref).toEqual({ bookOsisId: "John", chapter: 3, verseStart: 16, verseEnd: undefined });
  });

  it("normalizes accented text", () => {
    expect(normalizeText("No princípio")).toBe("no principio");
  });

  it("formats reference", () => {
    expect(formatReference({ bookOsisId: "John", chapter: 1, verseStart: 1 }, "João")).toBe("João 1:1");
  });

  it("matches phrase search", () => {
    expect(matchesSearch("No principio era o Verbo", { query: "principio verbo", mode: "all_words" })).toBe(true);
  });
});
