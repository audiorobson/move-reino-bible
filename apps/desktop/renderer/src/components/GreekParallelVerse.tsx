import type { OriginalTokenDto } from "@mrb/shared-types";



interface GreekParallelVerseProps {

  verseNumber: number;

  tokens: OriginalTokenDto[];

}



export function GreekParallelVerse({ verseNumber, tokens }: GreekParallelVerseProps) {

  if (!tokens.length) return null;



  const greekText = tokens.map((t) => t.surfaceForm).join(" ");



  return (

    <div className="greek-parallel-verse">

      <span className="greek-parallel-verse__num">{verseNumber}</span>

      <p className="greek-parallel-verse__text greek greek-text">{greekText}</p>

    </div>

  );

}


