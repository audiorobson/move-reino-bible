import { useLayoutEffect, useRef } from "react";
import { useBibleBooks } from "../hooks/useBibleBooks";
import { useAppStore } from "../store/appStore";

/** Proporção nativa de img/b2.png (1448×1086). */
const PLAQUE_ASPECT_W = 1448;
const PLAQUE_ASPECT_H = 1086;

const TITLE_FONT_MAX = 18;
const TITLE_FONT_MIN = 7;
const META_FONT_MAX = 10;
const META_FONT_MIN = 6;

function fitTextToBox(
  el: HTMLElement,
  box: HTMLElement,
  maxHeightRatio: number,
  fontMax: number,
  fontMin: number
) {
  const maxHeight = box.clientHeight * maxHeightRatio;
  let size = Math.min(fontMax, box.clientWidth * 0.12);

  el.style.fontSize = `${size}px`;

  while (size > fontMin && el.scrollHeight > maxHeight) {
    size -= 0.5;
    el.style.fontSize = `${size}px`;
  }

  while (size > fontMin && el.scrollWidth > box.clientWidth + 1) {
    size -= 0.5;
    el.style.fontSize = `${size}px`;
  }
}

export function SelectedBookPlaque() {
  const { currentBook, currentChapter } = useAppStore();
  const { data: books = [] } = useBibleBooks();
  const contentRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);

  const book = books.find((b) => b.osisId === currentBook);
  const namePt = book?.namePt ?? currentBook;
  const testament = book?.testament === "OT" ? "Antigo Test." : book?.testament === "NT" ? "Novo Test." : "";

  useLayoutEffect(() => {
    const box = contentRef.current;
    const nameEl = nameRef.current;
    const metaEl = metaRef.current;
    if (!box || !nameEl) return;

    fitTextToBox(nameEl, box, 0.68, TITLE_FONT_MAX, TITLE_FONT_MIN);

    if (metaEl) {
      fitTextToBox(metaEl, box, 0.32, META_FONT_MAX, META_FONT_MIN);
    }
  }, [namePt, currentChapter, testament]);

  useLayoutEffect(() => {
    const box = contentRef.current;
    const nameEl = nameRef.current;
    const metaEl = metaRef.current;
    if (!box || !nameEl) return;

    const observer = new ResizeObserver(() => {
      fitTextToBox(nameEl, box, 0.68, TITLE_FONT_MAX, TITLE_FONT_MIN);
      if (metaEl) {
        fitTextToBox(metaEl, box, 0.32, META_FONT_MAX, META_FONT_MIN);
      }
    });

    observer.observe(box);
    return () => observer.disconnect();
  }, [namePt, currentChapter, testament]);

  return (
    <div
      className="selected-book-plaque"
      style={{ aspectRatio: `${PLAQUE_ASPECT_W} / ${PLAQUE_ASPECT_H}` }}
      aria-label={`Livro selecionado: ${namePt}, capítulo ${currentChapter}`}
    >
      <div className="selected-book-plaque__bg" aria-hidden />
      <div ref={contentRef} className="selected-book-plaque__content">
        <p ref={nameRef} className="selected-book-plaque__name">
          {namePt}
        </p>
        <p ref={metaRef} className="selected-book-plaque__meta">
          <span>Capítulo {currentChapter}</span>
          {testament && (
            <>
              <span className="selected-book-plaque__dot" aria-hidden />
              <span>{testament}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
