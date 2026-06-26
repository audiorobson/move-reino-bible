import { List } from "lucide-react";

interface LibraryTocFabProps {
  onClick: () => void;
  open: boolean;
  chapterCount?: number;
}

/** Botão flutuante — abre o índice mesmo com a barra oculta no modo imersivo. */
export function LibraryTocFab({ onClick, open, chapterCount }: LibraryTocFabProps) {
  return (
    <button
      type="button"
      className={`ereader-toc-fab ${open ? "ereader-toc-fab--open" : ""}`}
      onClick={onClick}
      title="Ver índice do livro (atalho: I)"
      aria-label="Ver índice do livro"
      aria-expanded={open}
    >
      <List size={20} />
      <span className="ereader-toc-fab__label">Índice</span>
      {chapterCount != null && chapterCount > 0 && (
        <span className="ereader-toc-fab__count">{chapterCount}</span>
      )}
    </button>
  );
}
