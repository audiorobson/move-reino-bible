import { describe, it, expect } from "vitest";
import { isCcelSummaFormat, parseSummaMarkdown } from "./summa-md.js";

const SAMPLE = `
Title: Summa Theologica
Creator(s): Thomas Aquinas, Saint (1225?-1274)

FIRST PART (FP: QQ 1-119)

TREATISE ON SACRED DOCTRINE [1](Q[1])

   Whether it is necessary?

   Objection 1: It seems that philosophy is enough.
   I answer that, Sacred doctrine is required.

   Whether it is a science?

   Objection 1: It seems not.
   I answer that, It is a science.

1. file:///ccel/a/aquinas/summa/cache/summa.html3#fp
`;

describe("summa-md", () => {
  it("detecta formato Suma CCEL", () => {
    expect(isCcelSummaFormat(SAMPLE)).toBe(true);
    expect(isCcelSummaFormat("# Hello")).toBe(false);
  });

  it("extrai artigos e remove lixo CCEL", () => {
    const parsed = parseSummaMarkdown(SAMPLE, { title: "Suma", author: "Aquino" });
    expect(parsed.chapters.length).toBe(2);
    expect(parsed.chapters[0]!.title).toContain("Whether it is necessary");
    expect(parsed.chapters[0]!.bookRoman).toBe("fp");
    expect(parsed.chapters.every((c) => !c.content.includes("file:///ccel"))).toBe(true);
  });
});
