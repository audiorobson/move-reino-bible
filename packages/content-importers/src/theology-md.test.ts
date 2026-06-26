import { describe, it, expect } from "vitest";
import { isCcelTheologyFormat, parseTheologyMarkdown } from "./theology-md.js";

const SAMPLE = `
Título: Divindade Doutrinária
Criador(es): Gill, John (1697-1771)
__________________________________________________________________

LIVRO I.

Capítulo 1
  Da Existência de Deus
   Tendo empreendido escrever um Sistema de Teologia, ou um Corpo de
   Divindade Doutrinária; e sendo a Teologia nada mais do que falar de Deus.

Capítulo 2
  Da Revelação de Deus
   Deus se revela na natureza e na Escritura.

1. file:///ccel/g/gill/doctrinal/cache/doctrinal.html3#ii.i-p1.1
`;

describe("theology-md", () => {
  it("detecta formato CCEL", () => {
    expect(isCcelTheologyFormat(SAMPLE)).toBe(true);
    expect(isCcelTheologyFormat("# Hello\n\nWorld")).toBe(false);
  });

  it("extrai capítulos e remove lixo CCEL", () => {
    const parsed = parseTheologyMarkdown(SAMPLE, { title: "Teste", author: "Gill" });
    expect(parsed.chapters).toHaveLength(2);
    expect(parsed.chapters[0]!.title).toBe("Da Existência de Deus");
    expect(parsed.chapters[0]!.content).toContain("Sistema de Teologia");
    expect(parsed.chapters[1]!.title).toBe("Da Revelação de Deus");
    expect(parsed.normalizedMarkdown).toContain("---");
    expect(parsed.normalizedMarkdown).toContain("## Livro I");
    expect(parsed.chapters.every((c) => !c.content.includes("file:///ccel"))).toBe(true);
  });
});
