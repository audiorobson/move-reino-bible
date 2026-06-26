import { useAppStore } from "../store/appStore";
import { ParallelChapterView } from "../components/ParallelChapterView";
import { BibleToolbar } from "../components/BibleToolbar";
import { useBibleBooks } from "../hooks/useBibleBooks";

export function ParallelBible() {
  const { currentBook, currentChapter, parallelVersions, parallelColumnCount } = useAppStore();
  const { data: books = [] } = useBibleBooks();
  const bookName = books.find((b) => b.osisId === currentBook)?.namePt ?? currentBook;
  const activeVersions = parallelVersions.slice(0, parallelColumnCount);

  return (
    <div className="parallel-panel">
      <div className="bible-header">
        <h2>Comparar versões</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Use o painel central para leitura ampla. Ajuste versões abaixo.
        </p>
        <BibleToolbar />
      </div>
      <ParallelChapterView
        book={currentBook}
        chapter={currentChapter}
        versions={activeVersions}
        bookName={bookName}
        compact
      />
    </div>
  );
}