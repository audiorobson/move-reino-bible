import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { LibraryToc } from "../../lib/api";

interface LibraryTocDrawerProps {
  toc: LibraryToc;
  activeChapterId: string | null;
  firstChapterId: string | null;
  currentChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onClose: () => void;
}

export function LibraryTocDrawer({
  toc,
  activeChapterId,
  firstChapterId,
  currentChapterId,
  onSelectChapter,
  onClose,
}: LibraryTocDrawerProps) {
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedId = activeChapterId ?? firstChapterId ?? currentChapterId;

  const filteredChapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return toc.chapters.filter(
      (ch) =>
        ch.title.toLowerCase().includes(q) ||
        ch.bookLabel.toLowerCase().includes(q) ||
        String(ch.chapterNumber).includes(q) ||
        ch.id.toLowerCase().includes(q)
    );
  }, [toc.chapters, query]);

  useEffect(() => {
    if (!selectedId || !scrollRef.current) return;
    const timer = window.setTimeout(() => {
      const el = scrollRef.current?.querySelector(`[data-chapter-id="${selectedId}"]`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [selectedId]);

  return (
    <>
      <button type="button" className="ereader-drawer-backdrop" onClick={onClose} aria-label="Fechar índice" />
      <aside className="ereader-drawer ereader-drawer--toc" role="dialog" aria-label="Índice do livro">
        <div className="ereader-drawer__header">
          <h3 className="ereader-drawer__title">Índice · {toc.chapterCount} capítulos</h3>
          <button type="button" className="ereader-drawer__close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="ereader-drawer__search">
          <Search size={15} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              toc.chapterCount >= 80
                ? "Buscar capítulo (recomendado em obras grandes)..."
                : "Buscar capítulo..."
            }
            aria-label="Buscar no índice"
          />
          {query && (
            <button
              type="button"
              className="ereader-drawer__search-clear"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="ereader-drawer__scroll" ref={scrollRef}>
          {filteredChapters ? (
            filteredChapters.length === 0 ? (
              <p className="ereader-drawer__empty">Nenhum capítulo encontrado para &quot;{query}&quot;.</p>
            ) : (
              <ul className="ereader-drawer__flat-list">
                {filteredChapters.slice(0, 150).map((ch) => (
                  <li key={ch.id}>
                    <button
                      type="button"
                      data-chapter-id={ch.id}
                      className={
                        selectedId === ch.id
                          ? "ereader-drawer__chapter ereader-drawer__chapter--active"
                          : "ereader-drawer__chapter"
                      }
                      onClick={() => onSelectChapter(ch.id)}
                    >
                      <span className="ereader-drawer__chapter-num">{ch.chapterNumber}</span>
                      <span className="ereader-drawer__chapter-title">
                        {ch.bookLabel ? `${ch.bookLabel} · ` : ""}
                        {ch.title}
                      </span>
                    </button>
                  </li>
                ))}
                {filteredChapters.length > 150 && (
                  <p className="ereader-drawer__empty">
                    +{filteredChapters.length - 150} resultados — refine a busca
                  </p>
                )}
              </ul>
            )
          ) : (
            toc.volumes.map((vol) => (
              <div key={vol.roman} className="ereader-drawer__volume">
                <h4>{vol.label}</h4>
                <ul>
                  {toc.chapters
                    .filter((ch) => ch.bookRoman === vol.roman)
                    .map((ch) => (
                      <li key={ch.id}>
                        <button
                          type="button"
                          data-chapter-id={ch.id}
                          className={
                            selectedId === ch.id
                              ? "ereader-drawer__chapter ereader-drawer__chapter--active"
                              : currentChapterId === ch.id
                                ? "ereader-drawer__chapter ereader-drawer__chapter--reading"
                                : "ereader-drawer__chapter"
                          }
                          onClick={() => onSelectChapter(ch.id)}
                        >
                          <span className="ereader-drawer__chapter-num">{ch.chapterNumber}</span>
                          <span className="ereader-drawer__chapter-title">{ch.title}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
