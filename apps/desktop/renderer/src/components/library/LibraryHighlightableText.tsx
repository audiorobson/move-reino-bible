import type { HighlightColor, TextHighlight } from "../../lib/library-reader-store";
import { applyHighlightsToText } from "../../lib/library-reader-store";

interface LibraryHighlightableTextProps {
  paragraphs: string[];
  highlights: TextHighlight[];
}

export function LibraryHighlightableText({ paragraphs, highlights }: LibraryHighlightableTextProps) {
  return (
    <div className="ereader-text">
      {paragraphs.map((paragraph, index) => {
        const segments = applyHighlightsToText(paragraph, highlights, index);
        const isFirst = index === 0;

        return (
          <p
            key={index}
            data-paragraph-index={index}
            className={isFirst ? "ereader-text__p ereader-text__p--dropcap" : "ereader-text__p"}
          >
            {segments.map((segment, segIndex) =>
              segment.highlight ? (
                <mark
                  key={segIndex}
                  className={`ereader-highlight ereader-highlight--${segment.highlight}`}
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={segIndex}>{segment.text}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export type { HighlightColor };
