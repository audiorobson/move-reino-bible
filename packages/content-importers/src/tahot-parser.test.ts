import { describe, it, expect } from "vitest";
import { parseTahotLine } from "./tahot-parser.js";

describe("parseTahotLine", () => {
  it("parses Genesis 1:1 token with compound Strong", () => {
    const line =
      "Gen.1.1#01=L\tבְּ/רֵאשִׁ֖ית\tbe./re.Shit\tin/ beginning\tH9003/{H7225G}\tHR/Ncfsa\t\t\tH7225G\t\tH9003=ב=in/{H7225G=רֵאשִׁית=: beginning»first:1_beginning}";
    const token = parseTahotLine(line);
    expect(token).not.toBeNull();
    expect(token!.bookOsisId).toBe("Gen");
    expect(token!.chapter).toBe(1);
    expect(token!.verse).toBe(1);
    expect(token!.surfaceForm).toContain("רֵאשִׁ");
    expect(token!.strongNumber).toBe("H7225");
    expect(token!.morphologyCode).toBe("HR/Ncfsa");
  });

  it("parses braced Strong only", () => {
    const line =
      "Gen.1.1#02=L\tבָּרָ֣א\tba.Ra'\the created\t{H1254A}\tHVqp3ms\t\t\tH1254A\t\t{H1254A=בָּרָא=to create}";
    const token = parseTahotLine(line);
    expect(token!.strongNumber).toBe("H1254");
    expect(token!.glossEn).toBe("he created");
  });

  it("maps STEP Ezk/Jol/Nam abbreviations to OSIS", () => {
    const ezk =
      "Ezk.1.1#01=L\tוַ/יְהִ֣י\׀\tva/y.Hi\tand/ it was\tH9001/{H1961}\tHc/Vqw3ms";
    expect(parseTahotLine(ezk)!.bookOsisId).toBe("Ezek");
  });
});
