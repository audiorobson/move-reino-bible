import type { OriginalTokenDto } from "@mrb/shared-types";
import {
  detectOriginalScript,
  originalScriptClass,
  type OriginalScript,
} from "../lib/original-language";

interface OriginalParallelVerseProps {
  verseNumber: number;
  tokens: OriginalTokenDto[];
  script?: OriginalScript | null;
}

export function OriginalParallelVerse({ verseNumber, tokens, script }: OriginalParallelVerseProps) {
  if (!tokens.length) return null;

  const resolved = script ?? detectOriginalScript(tokens);
  const text = tokens.map((t) => t.surfaceForm).join(" ");

  return (
    <div className={`original-parallel-verse original-parallel-verse--${resolved}`}>
      <span className="original-parallel-verse__num">{verseNumber}</span>
      <p className={`original-parallel-verse__text ${originalScriptClass(resolved)}`}>{text}</p>
    </div>
  );
}
