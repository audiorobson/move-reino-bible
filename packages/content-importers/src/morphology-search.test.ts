import { describe, expect, it } from "vitest";
import { isMorphologyQuery } from "./morphology-search.js";

describe("isMorphologyQuery", () => {
  it("detecta códigos gregos", () => {
    expect(isMorphologyQuery("V-PAI-3S")).toBe(true);
    expect(isMorphologyQuery("N-NSM")).toBe(true);
  });

  it("detecta códigos hebraicos", () => {
    expect(isMorphologyQuery("HR/Ncfsa")).toBe(true);
  });

  it("rejeita Strong e referências", () => {
    expect(isMorphologyQuery("G3056")).toBe(false);
    expect(isMorphologyQuery("João 3:16")).toBe(false);
  });
});
