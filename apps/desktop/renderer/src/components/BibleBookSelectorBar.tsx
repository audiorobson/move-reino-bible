import { useCallback, useState } from "react";
import { useBibleBooks, type BibleBookOption } from "../hooks/useBibleBooks";
import { useAppStore } from "../store/appStore";
import {
  getBookAbbreviation,
  NT_BOOK_ROWS,
  OT_BOOK_ROWS,
} from "../lib/book-abbreviations";
import { BookSelectorTooltip, type BookTooltipData } from "./BookSelectorTooltip";

/** Proporção nativa de img/back.png (2105×292). */
const BOOK_SELECTOR_ASPECT_W = 2105;
const BOOK_SELECTOR_ASPECT_H = 292;

const TOOLTIP_OFFSET_BELOW = 14;

function BookRow({
  osisIds,
  currentBook,
  booksByOsis,
  onSelect,
  onTooltipShow,
  onTooltipMove,
  onTooltipHide,
}: {
  osisIds: string[];
  currentBook: string;
  booksByOsis: Record<string, BibleBookOption>;
  onSelect: (osisId: string) => void;
  onTooltipShow: (book: BibleBookOption, clientX: number, clientY: number) => void;
  onTooltipMove: (clientX: number, clientY: number) => void;
  onTooltipHide: () => void;
}) {
  return (
    <div
      className="book-selector-bar__row"
      style={{ gridTemplateColumns: `repeat(${osisIds.length}, minmax(0, 1fr))` }}
    >
      {osisIds.map((osisId) => {
        const isActive = currentBook === osisId;
        const label = getBookAbbreviation(osisId);
        const book = booksByOsis[osisId];
        const fullName = book?.namePt ?? osisId;
        return (
          <button
            key={osisId}
            type="button"
            className={`book-selector-bar__btn${isActive ? " book-selector-bar__btn--active" : ""}`}
            onClick={() => onSelect(osisId)}
            aria-label={fullName}
            aria-pressed={isActive}
            onMouseEnter={(e) => book && onTooltipShow(book, e.clientX, e.clientY)}
            onMouseMove={(e) => onTooltipMove(e.clientX, e.clientY)}
            onMouseLeave={onTooltipHide}
            onFocus={(e) => book && onTooltipShow(book, e.currentTarget.getBoundingClientRect().left + e.currentTarget.offsetWidth / 2, e.currentTarget.getBoundingClientRect().top)}
            onBlur={onTooltipHide}
          >
            <span className="book-selector-bar__btn-label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TestamentSection({
  title,
  rows,
  currentBook,
  booksByOsis,
  onSelect,
  onTooltipShow,
  onTooltipMove,
  onTooltipHide,
  side,
}: {
  title: string;
  rows: string[][];
  currentBook: string;
  booksByOsis: Record<string, BibleBookOption>;
  onSelect: (osisId: string) => void;
  onTooltipShow: (book: BibleBookOption, clientX: number, clientY: number) => void;
  onTooltipMove: (clientX: number, clientY: number) => void;
  onTooltipHide: () => void;
  side: "ot" | "nt";
}) {
  return (
    <section className={`book-selector-bar__testament book-selector-bar__testament--${side}`}>
      <h2 className="book-selector-bar__title">
        <span className="book-selector-bar__title-line" />
        <span className="book-selector-bar__title-text">{title}</span>
        <span className="book-selector-bar__title-line" />
      </h2>
      <div className="book-selector-bar__slots">
        {rows.map((row, i) => (
          <div key={i} className="book-selector-bar__slot">
            <BookRow
              osisIds={row}
              currentBook={currentBook}
              booksByOsis={booksByOsis}
              onSelect={onSelect}
              onTooltipShow={onTooltipShow}
              onTooltipMove={onTooltipMove}
              onTooltipHide={onTooltipHide}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function BibleBookSelectorBar() {
  const { currentBook, setLocation } = useAppStore();
  const { data: books = [] } = useBibleBooks();
  const [tooltip, setTooltip] = useState<BookTooltipData | null>(null);

  const booksByOsis = Object.fromEntries(books.map((b) => [b.osisId, b]));

  const handleSelect = (osisId: string) => {
    setLocation(osisId, 1);
  };

  const buildTooltip = useCallback(
    (book: BibleBookOption, x: number, y: number): BookTooltipData => ({
      namePt: book.namePt,
      nameEn: book.nameEn,
      abbr: getBookAbbreviation(book.osisId),
      testament: book.testament,
      chapters: book.chapterCount,
      x,
      y: y + TOOLTIP_OFFSET_BELOW,
    }),
    []
  );

  const handleTooltipShow = useCallback(
    (book: BibleBookOption, x: number, y: number) => {
      setTooltip(buildTooltip(book, x, y));
    },
    [buildTooltip]
  );

  const handleTooltipMove = useCallback((x: number, y: number) => {
    setTooltip((prev) => (prev ? { ...prev, x, y: y + TOOLTIP_OFFSET_BELOW } : null));
  }, []);

  const handleTooltipHide = useCallback(() => setTooltip(null), []);

  return (
    <div className="app-head__book-panel" role="navigation" aria-label="Seleção de livros bíblicos">
      <BookSelectorTooltip data={tooltip} />
      <div
        className="book-selector-bar__canvas"
        style={{ aspectRatio: `${BOOK_SELECTOR_ASPECT_W} / ${BOOK_SELECTOR_ASPECT_H}` }}
      >
        <div className="book-selector-bar__bg" aria-hidden />
        <div className="book-selector-bar__content">
          <TestamentSection
            title="Antigo Testamento"
            rows={OT_BOOK_ROWS}
            currentBook={currentBook}
            booksByOsis={booksByOsis}
            onSelect={handleSelect}
            onTooltipShow={handleTooltipShow}
            onTooltipMove={handleTooltipMove}
            onTooltipHide={handleTooltipHide}
            side="ot"
          />
          <div className="book-selector-bar__gutter" aria-hidden />
          <TestamentSection
            title="Novo Testamento"
            rows={NT_BOOK_ROWS}
            currentBook={currentBook}
            booksByOsis={booksByOsis}
            onSelect={handleSelect}
            onTooltipShow={handleTooltipShow}
            onTooltipMove={handleTooltipMove}
            onTooltipHide={handleTooltipHide}
            side="nt"
          />
        </div>
      </div>
    </div>
  );
}
