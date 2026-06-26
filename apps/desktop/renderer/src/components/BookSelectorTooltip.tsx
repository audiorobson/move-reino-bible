import { createPortal } from "react-dom";

export interface BookTooltipData {
  namePt: string;
  nameEn: string;
  abbr: string;
  testament: "OT" | "NT";
  chapters: number;
  x: number;
  y: number;
}

interface BookSelectorTooltipProps {
  data: BookTooltipData | null;
}

export function BookSelectorTooltip({ data }: BookSelectorTooltipProps) {
  if (!data) return null;

  const testamentLabel = data.testament === "OT" ? "Antigo Testamento" : "Novo Testamento";

  return createPortal(
    <div
      className="book-selector-tooltip"
      style={{
        left: data.x,
        top: data.y,
        transform: "translate(-50%, 12px)",
      }}
      role="tooltip"
      aria-hidden
    >
      <span className="book-selector-tooltip__arrow book-selector-tooltip__arrow--below" aria-hidden />
      <div className="book-selector-tooltip__card">
        <span className="book-selector-tooltip__badge">{testamentLabel}</span>
        <p className="book-selector-tooltip__title">{data.namePt}</p>
        <p className="book-selector-tooltip__meta">
          <span className="book-selector-tooltip__abbr">{data.abbr}</span>
          <span className="book-selector-tooltip__dot" aria-hidden />
          <span>{data.nameEn}</span>
          <span className="book-selector-tooltip__dot" aria-hidden />
          <span>{data.chapters} cap.</span>
        </p>
      </div>
    </div>,
    document.body
  );
}
