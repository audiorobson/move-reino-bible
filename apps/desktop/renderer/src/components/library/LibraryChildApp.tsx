import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { LibraryReader } from "./LibraryReader";
import {
  electronCloseLibrary,
  getLibraryRouteParams,
} from "../../lib/library-electron";

export function LibraryChildApp() {
  const { bookId, chapterId: initialChapter } = getLibraryRouteParams();
  const [chapterId, setChapterId] = useState(initialChapter);

  useEffect(() => {
    if (!window.mrb?.onLibraryNavigate) return;
    return window.mrb.onLibraryNavigate((payload) => {
      setChapterId(payload.chapterId);
    });
  }, []);

  const { data: books, isLoading } = useQuery({
    queryKey: ["library-books"],
    queryFn: () => api.getLibraryBooks(),
  });

  const book = books?.find((b) => b.id === bookId);

  const handleClose = () => {
    void electronCloseLibrary();
  };

  if (isLoading || !book) {
    return (
      <div className="library-child-app">
        <p style={{ padding: 24, color: "var(--text-muted)" }}>
          {isLoading ? "Carregando livro..." : "Livro não encontrado."}
        </p>
      </div>
    );
  }

  return (
    <div className="library-child-app">
      <LibraryReader
        book={book}
        onClose={handleClose}
        initialChapterId={chapterId}
        standalone
      />
    </div>
  );
}
