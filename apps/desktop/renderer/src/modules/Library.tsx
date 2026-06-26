import { useState } from "react";
import { BookOpen, Bookmark, Library as LibraryIcon, List, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Card, EmptyState, LoadingState } from "@mrb/ui-kit";
import { api, type LibraryBookSummary } from "../lib/api";
import { DEMO_STUDY_USER } from "../lib/study-utils";
import { loadAllReadingProgress } from "../lib/library-reader-store";
import { LibraryReader } from "../components/library/LibraryReader";
import {
  electronOpenLibrary,
  isElectronLibraryWindow,
  isLibraryWindowRoute,
} from "../lib/library-electron";

export function Library() {
  const [activeBook, setActiveBook] = useState<LibraryBookSummary | null>(null);
  const [resumeChapterId, setResumeChapterId] = useState<string | undefined>();
  const [openTocOnStart, setOpenTocOnStart] = useState(false);
  const isChildCapable = isElectronLibraryWindow() && !isLibraryWindowRoute();

  const { data: books, isLoading, error } = useQuery({
    queryKey: ["library-books"],
    queryFn: () => api.getLibraryBooks(),
  });

  const { data: favorites } = useQuery({
    queryKey: ["library-favorites", DEMO_STUDY_USER],
    queryFn: () => api.getLibraryFavorites(DEMO_STUDY_USER),
  });

  const { data: notes } = useQuery({
    queryKey: ["library-notes", DEMO_STUDY_USER],
    queryFn: () => api.getLibraryNotes(DEMO_STUDY_USER),
  });

  const readingProgress = loadAllReadingProgress();

  const handleOpenBook = (book: LibraryBookSummary, chapterId?: string, showToc = false) => {
    if (isChildCapable) {
      void electronOpenLibrary({
        bookId: book.id,
        title: book.title,
        chapterId,
      });
      return;
    }
    setOpenTocOnStart(showToc);
    setActiveBook(book);
  };

  if (activeBook && !isChildCapable) {
    return (
      <LibraryReader
        book={activeBook}
        onBack={() => {
          setActiveBook(null);
          setResumeChapterId(undefined);
          setOpenTocOnStart(false);
        }}
        initialChapterId={resumeChapterId}
        initialTocOpen={openTocOnStart}
      />
    );
  }

  return (
    <div className="library-module">
      <div className="bible-header">
        <h2>Biblioteca</h2>
        <p>Livros teológicos para leitura integral — teologia sistemática, confissões e obras clássicas</p>
      </div>

      {isLoading && <LoadingState message="Carregando catálogo..." />}

      {error && (
        <Card style={{ marginBottom: 16 }}>
          <EmptyState
            title="Erro ao carregar biblioteca"
            description={
              error instanceof Error
                ? error.message
                : "Verifique se a API está rodando (pnpm dev:api)."
            }
          />
        </Card>
      )}

      {!isLoading && !error && (!books || books.length === 0) && (
        <EmptyState
          title="Nenhum livro no catálogo"
          description="Adicione obras em data/library/manifest.json"
        />
      )}

      <div className="library-catalog">
        {books?.map((book) => {
          const progress = readingProgress.find((p) => p.bookId === book.id);
          return (
          <Card
            key={book.id}
            className="library-book-card"
            onClick={() => {
              if (!isChildCapable) setResumeChapterId(progress?.chapterId);
              handleOpenBook(book, progress?.chapterId);
            }}
          >
            <div className="library-book-card__icon">
              <BookOpen size={28} />
            </div>
            <div className="library-book-card__body">
              <h3>{book.title}</h3>
              {book.subtitle && <p className="library-book-card__subtitle">{book.subtitle}</p>}
              <p className="library-book-card__author">{book.author}</p>
              {progress && (
                <>
                  <p className="library-book-card__continue">
                    <Bookmark size={14} />
                    Continuar: {progress.chapterTitle ?? progress.chapterId}
                  </p>
                  {typeof progress.bookPercent === "number" && progress.bookPercent > 0 && (
                    <div className="library-book-card__progress">
                      <div className="library-book-card__progress-bar">
                        <div
                          className="library-book-card__progress-fill"
                          style={{ width: `${Math.round(progress.bookPercent)}%` }}
                        />
                      </div>
                      <span className="library-book-card__progress-label">
                        {Math.round(progress.bookPercent)}% lido
                      </span>
                    </div>
                  )}
                </>
              )}
              {book.description && (
                <p className="library-book-card__desc">{book.description}</p>
              )}
              <div className="library-book-card__tags">
                {book.tradition && <Badge variant="gold">{book.tradition}</Badge>}
                <Badge variant="rag">{book.documentType}</Badge>
              </div>
            </div>
            <Button
              variant="primary"
              className="library-book-card__open"
              onClick={(e) => {
                e.stopPropagation();
                if (!isChildCapable) setResumeChapterId(progress?.chapterId);
                handleOpenBook(book, progress?.chapterId);
              }}
            >
              {progress ? "Continuar" : isChildCapable ? "Abrir em janela" : "Abrir"}
            </Button>
            <Button
              variant="ghost"
              className="library-book-card__toc"
              onClick={(e) => {
                e.stopPropagation();
                if (!isChildCapable) {
                  setResumeChapterId(undefined);
                  handleOpenBook(book, undefined, true);
                } else {
                  handleOpenBook(book);
                }
              }}
              title="Ver índice do livro"
            >
              <List size={16} /> Índice
            </Button>
          </Card>
        );
        })}
      </div>

      {!isChildCapable && books && books.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
          No app desktop, os livros abrem em uma janela secundária ao lado da Bíblia.
        </p>
      )}

      <Card style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <LibraryIcon size={18} style={{ color: "var(--mrb-accent)" }} />
          <h3 style={{ color: "var(--mrb-accent)", margin: 0 }}>Notas e favoritos</h3>
        </div>
        {!favorites?.length && !notes?.length && (
          <EmptyState
            title="Nenhuma nota ou favorito ainda"
            description="Abra um livro e use a estrela ou o campo de notas no capítulo"
          />
        )}
        {favorites && favorites.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              <Star size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Favoritos ({favorites.length})
            </p>
            <ul className="library-sidebar-list">
              {favorites.slice(0, 8).map((f) => (
                <li key={f.id}>
                  {books?.find((b) => b.id === f.libraryBookId)?.title ?? f.libraryBookId} —{" "}
                  {f.chapterTitle ?? f.chapterId}
                </li>
              ))}
            </ul>
          </div>
        )}
        {notes && notes.length > 0 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Notas ({notes.length})</p>
            <ul className="library-sidebar-list">
              {notes.slice(0, 6).map((n) => (
                <li key={n.id}>
                  <strong>{books?.find((b) => b.id === n.libraryBookId)?.title ?? n.libraryBookId}</strong>
                  <br />
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {n.excerpt ?? n.chapterId}: {n.content.slice(0, 80)}
                    {n.content.length > 80 ? "…" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
