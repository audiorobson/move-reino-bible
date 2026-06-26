import { describe, it, expect } from "vitest";
import { parseTvtmsRef } from "./verse-ref.js";

describe("parseTvtmsRef", () => {
  it("parses psalm superscription verse 0", () => {
    const ref = parseTvtmsRef("Psa.3:0");
    expect(ref?.bookOsisId).toBe("Ps");
    expect(ref?.verse).toBe(0);
  });

  it("parses standard reference", () => {
    const ref = parseTvtmsRef("Gen.32:1");
    expect(ref?.bookOsisId).toBe("Gen");
    expect(ref?.chapter).toBe(32);
    expect(ref?.verse).toBe(1);
  });
});
