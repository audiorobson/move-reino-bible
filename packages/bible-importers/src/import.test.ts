import { describe, it, expect } from "vitest";
import { parseJsonFlat, validateImport } from "./json-flat.js";
import { parseJsonNested, ptAbbrevToOsis } from "./json-nested.js";
import { helloaoBookToOsis, normalizeBookOsisId } from "./book-map.js";

describe("bible-importers", () => {
  it("parses local JSON flat format", () => {
    const data = parseJsonFlat(JSON.stringify({
      version: {
        name: "Test",
        abbreviation: "TST",
        language: "pt-BR",
        licenseType: "LICENSE_OK_PUBLIC_DOMAIN",
      },
      verses: [{ book: "JHN", chapter: 1, verse: 1, text: "No principio era o Verbo." }],
    }));
    expect(data.verses[0]?.bookOsisId).toBe("John");
    expect(validateImport(data).versesImported).toBe(1);
  });

  it("maps helloao book ids to OSIS", () => {
    expect(helloaoBookToOsis("JHN")).toBe("John");
    expect(normalizeBookOsisId("João")).toBe("John");
  });

  it("parses nested local JSON (66 books)", () => {
    const data = parseJsonNested(
      JSON.stringify([
        {
          abbrev: "Jo",
          name: "João",
          chapters: [["No princípio era o Verbo.", "O mesmo estava no princípio com Deus."]],
        },
      ]),
      {
        name: "Teste",
        abbreviation: "TST",
        language: "pt-BR",
        licenseType: "LICENSE_RESTRICTED_PERSONAL_USE",
      }
    );
    expect(data.verses).toHaveLength(2);
    expect(data.verses[0]?.bookOsisId).toBe("John");
    expect(ptAbbrevToOsis("Ap")).toBe("Rev");
  });
});
