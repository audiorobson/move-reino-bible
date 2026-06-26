import { describe, expect, it } from "vitest";
import { parseChainReference } from "./reference-parser.js";
import { resolveOsisBook } from "./osis-map.js";

describe("chain reference parser", () => {
  it("parses nave dot notation", () => {
    const ref = parseChainReference("John.3.16");
    expect(ref?.book).toBe("John");
    expect(ref?.chapter).toBe(3);
    expect(ref?.verseStart).toBe(16);
  });

  it("parses verse ranges", () => {
    const ref = parseChainReference("Exod.6.16-Exod.6.20");
    expect(ref?.book).toBe("Exod");
    expect(ref?.verseStart).toBe(16);
    expect(ref?.verseEnd).toBe(20);
  });

  it("parses human references", () => {
    const ref = parseChainReference("João 3:16");
    expect(ref?.book).toBe("John");
  });

  it("resolves english book names", () => {
    expect(resolveOsisBook("1 Peter")).toBe("1Pet");
    expect(resolveOsisBook("Psalms")).toBe("Ps");
  });
});
