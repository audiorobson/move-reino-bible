import { describe, it, expect } from "vitest";
import { parseStrongsMarkdown } from "./strongs-md.js";

describe("strongs-md", () => {
  it("parses greek and hebrew entries", () => {
    const entries = parseStrongsMarkdown(`
## G3056
- **Lemma:** λόγος
- **Transliteration:** logos
- **Language:** greek
- **Short definition:** palavra, razão

---

## H430
- **Lemma:** אֱלֹהִים
- **Language:** hebrew
- **Short definition:** Deus
`);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.strongNumber).toBe("G3056");
    expect(entries[0]?.lemma).toBe("λόγος");
    expect(entries[1]?.strongNumber).toBe("H430");
    expect(entries[1]?.language).toBe("hebrew");
  });
});
