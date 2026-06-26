/** Expande referências bíblicas e lemas para busca no HALOT. */

const BOOK_TO_HALOT: Record<string, string> = {
  genesis: "Gn",
  gen: "Gn",
  gn: "Gn",
  exodus: "Ex",
  ex: "Ex",
  leviticus: "Lv",
  lev: "Lv",
  numbers: "Nu",
  num: "Nu",
  deuteronomy: "Dt",
  deut: "Dt",
  dt: "Dt",
  joshua: "Jos",
  judges: "Ju",
  psalms: "Ps",
  psalm: "Ps",
  ps: "Ps",
  isaiah: "Is",
  isa: "Is",
  jeremiah: "Jr",
  jer: "Jr",
  ezekiel: "Ezk",
  ezk: "Ezk",
  daniel: "Da",
  dan: "Da",
};

/** Lema HALOT / Strong para passagens frequentes */
const PASSAGE_LEMMAS: Record<string, string[]> = {
  "Gn 1 1": [
    "Gn 1 1",
    "Gn 1",
    "~yhiloa]",
    "elohim",
    "H430",
    "tyvar",
    "reshit",
    "H7225",
    "arb",
    "hrB",
    "bara",
    "H1254",
    "#r,a",
    "hm'd'a]",
    "~ymev",
    "V'h;",
    "heaven",
    "earth",
    "create",
  ],
};

export function parseBibleReference(text: string): { book: string; chapter: number; verse?: number } | null {
  const normalized = text.replace(/\s+/g, " ").trim();

  const withColon = normalized.match(
    /(?:^|\s)([a-zA-ZàáâãéêíóôúçÀÁÂÃÉÊÍÓÔÚÇ.]+)\s+(\d{1,3})\s*[:.,]\s*(\d{1,3})(?:\s|$)/i
  );
  if (withColon) {
    const bookKey = withColon[1]!.toLowerCase().replace(/\./g, "");
    return {
      book: BOOK_TO_HALOT[bookKey] ?? withColon[1]!,
      chapter: parseInt(withColon[2]!, 10),
      verse: parseInt(withColon[3]!, 10),
    };
  }

  const halotStyle = normalized.match(/(?:^|\s)([A-Za-z]{2,})\s+(\d{1,3})\s+(\d{1,3})(?:\s|$)/);
  if (halotStyle) {
    const bookKey = halotStyle[1]!.toLowerCase();
    return {
      book: BOOK_TO_HALOT[bookKey] ?? halotStyle[1]!,
      chapter: parseInt(halotStyle[2]!, 10),
      verse: parseInt(halotStyle[3]!, 10),
    };
  }

  return null;
}

export function expandPassageSearchQueries(passage?: string, message?: string): string[] {
  const combined = `${passage ?? ""} ${message ?? ""}`.trim();
  const queries = new Set<string>();

  if (combined) queries.add(combined);

  const ref = parseBibleReference(combined);
  if (ref) {
    if (ref.verse !== undefined) {
      queries.add(`${ref.book} ${ref.chapter} ${ref.verse}`);
      queries.add(`${ref.book} ${ref.chapter}`);
    } else {
      queries.add(`${ref.book} ${ref.chapter}`);
    }

    const key = ref.verse !== undefined ? `${ref.book} ${ref.chapter} ${ref.verse}` : "";
    const lemmas = PASSAGE_LEMMAS[key];
    if (lemmas) lemmas.forEach((l) => queries.add(l));
  }

  if (/g[eê]nesis|gênesis|\bgn\b/i.test(combined) && /\b1\b/.test(combined)) {
    PASSAGE_LEMMAS["Gn 1 1"]?.forEach((l) => queries.add(l));
  }

  if (/criou|criar|create|bara|bereshit|re[eê]shit|elohim|אלהים|ברא/i.test(combined)) {
    ["bara", "arb", "hrB", "elohim", "~yhiloa]", "tyvar", "reshit", "Gn 1 1"].forEach((l) =>
      queries.add(l)
    );
  }

  return [...queries].filter((q) => q.length > 1);
}

export function isLexiconNoiseChunk(text: string): boolean {
  const head = text.slice(0, 400);
  return (
    /^## (from the|Preface|Introduction|· )/m.test(head) ||
    /^## from the (first|second|third) edition/m.test(head) ||
    /Introduction to the Aramaic Part/i.test(head) ||
    /Copyright Koninklijke Brill/i.test(head)
  );
}
