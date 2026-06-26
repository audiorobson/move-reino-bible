import { createReadStream } from "fs";
import { createInterface } from "readline";
import { parseTvtmsRef, type ParsedVerseRef, type VersificationTradition } from "./verse-ref.js";

export interface VersificationPair {
  sourceTradition: VersificationTradition;
  targetTradition: VersificationTradition;
  source: ParsedVerseRef;
  target: ParsedVerseRef;
}

const PAIR_LINE_RE = /^([A-Za-z0-9]+)\.(\d+):(\d+)\t([A-Za-z0-9]+)\.(\d+):(\d+)\s*$/;

type PairSection = "english-hebrew" | "english-greek" | null;

function detectSection(line: string): PairSection {
  const lower = line.toLowerCase();
  if (lower.includes("english") && lower.includes("hebrew")) return "english-hebrew";
  if (lower.includes("english") && lower.includes("greek")) return "english-greek";
  return null;
}

export async function parseTvtmsPairwiseMappings(filePath: string): Promise<VersificationPair[]> {
  const rl = createInterface({ input: createReadStream(filePath, { encoding: "utf-8" }), crlfDelay: Infinity });
  const pairs: VersificationPair[] = [];
  let section: PairSection = null;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const newSection = detectSection(trimmed);
    if (newSection) {
      section = newSection;
      continue;
    }

    if (trimmed.startsWith("'") || trimmed.startsWith("#") || trimmed.startsWith("Phrases")) {
      if (section === "english-hebrew" && trimmed.startsWith("Phrases")) section = null;
      continue;
    }

    if (!section) continue;

    const m = trimmed.match(PAIR_LINE_RE);
    if (!m) continue;

    const left = parseTvtmsRef(`${m[1]}.${m[2]}:${m[3]}`);
    const right = parseTvtmsRef(`${m[4]}.${m[5]}:${m[6]}`);
    if (!left || !right) continue;

    if (section === "english-hebrew") {
      pairs.push({
        sourceTradition: "english",
        targetTradition: "hebrew",
        source: left,
        target: right,
      });
      pairs.push({
        sourceTradition: "hebrew",
        targetTradition: "english",
        source: right,
        target: left,
      });
    } else if (section === "english-greek") {
      pairs.push({
        sourceTradition: "english",
        targetTradition: "greek",
        source: left,
        target: right,
      });
      pairs.push({
        sourceTradition: "greek",
        targetTradition: "english",
        source: right,
        target: left,
      });
    }
  }

  return pairs;
}
