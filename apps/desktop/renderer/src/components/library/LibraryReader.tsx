import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, EmptyState, LoadingState } from "@mrb/ui-kit";
import { api, type LibraryBookSummary, type LibraryChapterContent } from "../../lib/api";
import { DEMO_STUDY_USER } from "../../lib/study-utils";
import {
  addHighlight,
  computeBookPercent,
  downloadTextFile,
  exportBookHighlightsMarkdown,
  formatCitation,
  getChapterHighlights,
  loadReaderSettings,
  loadReadingProgress,
  removeHighlight,
  saveReaderSettings,
  saveReadingProgress,
  type HighlightColor,
  type ReaderFontSize,
  type ReaderSettings,
} from "../../lib/library-reader-store";
import { LibraryHighlightableText } from "./LibraryHighlightableText";
import { LibraryReaderToolbar } from "./LibraryReaderToolbar";
import { HighlightListItem, LibrarySelectionPopover } from "./LibrarySelectionPopover";
import { LibraryTocDrawer } from "./LibraryTocDrawer";
import { LibraryTocFab } from "./LibraryTocFab";
import { useLibraryChapterPrefetch } from "./useLibraryChapterPrefetch";

function formatChapterBody(content: string): string[] {
  const stripped = content
    .replace(/^#\s+.+$/m, "")
    .replace(/^##\s+.+$/m, "")
    .trim();
  return stripped
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0 && !/^_{5,}/.test(p));
}

export interface LibraryReaderProps {
  book: LibraryBookSummary;
  onBack?: () => void;
  onClose?: () => void;
  initialChapterId?: string;
  initialTocOpen?: boolean;
  standalone?: boolean;
}

export function LibraryReader({
  book,
  onBack,
  onClose,
  initialChapterId,
  initialTocOpen = false,
  standalone = false,
}: LibraryReaderProps) {
  const savedProgress = loadReadingProgress(book.id);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    initialChapterId ?? savedProgress?.chapterId ?? null
  );
  const [tocOpen, setTocOpen] = useState(initialTocOpen);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(loadReaderSettings);
  const [highlightRevision, setHighlightRevision] = useState(0);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [selectionMenu, setSelectionMenu] = useState<{
    x: number;
    y: number;
    text: string;
    paragraphIndex: number;
  } | null>(null);

  const scrollRef = useRef<HTMLElement>(null);
  const restoredScroll = useRef(false);
  const lastScrollTop = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialChapterId) setActiveChapterId(initialChapterId);
  }, [initialChapterId]);

  useEffect(() => {
    saveReaderSettings(readerSettings);
  }, [readerSettings]);

  const { data: toc, isLoading: tocLoading, error: tocError } = useQuery({
    queryKey: ["library-toc", book.id],
    queryFn: () => api.getLibraryToc(book.id),
    staleTime: 10 * 60_000,
  });

  const { data: chapter, isLoading: chapterLoading } = useQuery({
    queryKey: ["library-chapter", book.id, activeChapterId],
    queryFn: () => api.getLibraryChapter(book.id, activeChapterId!),
    enabled: Boolean(activeChapterId),
    staleTime: 5 * 60_000,
  });

  const firstChapterId = toc?.chapters[0]?.id ?? null;
  const currentChapterId = activeChapterId ?? firstChapterId;

  const { data: displayChapter } = useQuery({
    queryKey: ["library-chapter", book.id, currentChapterId],
    queryFn: () => api.getLibraryChapter(book.id, currentChapterId!),
    enabled: Boolean(currentChapterId) && !activeChapterId,
    staleTime: 5 * 60_000,
  });

  const shown: LibraryChapterContent | undefined = chapter ?? displayChapter;
  const paragraphs = shown ? formatChapterBody(shown.content) : [];
  const chapterKey = shown?.chapterId ?? currentChapterId;

  const chapterIndex = useMemo(() => {
    if (!toc || !chapterKey) return 0;
    return Math.max(0, toc.chapters.findIndex((c) => c.id === chapterKey));
  }, [toc, chapterKey]);

  const chapterHighlights = useMemo(() => {
    void highlightRevision;
    return getChapterHighlights(book.id, chapterKey ?? "");
  }, [book.id, chapterKey, highlightRevision]);

  const prevChapterId = toc?.chapters[chapterIndex - 1]?.id;
  const nextChapterId = toc?.chapters[chapterIndex + 1]?.id;
  useLibraryChapterPrefetch(book.id, { prev: prevChapterId, next: nextChapterId });

  const { data: notes } = useQuery({
    queryKey: ["library-notes", DEMO_STUDY_USER],
    queryFn: () => api.getLibraryNotes(DEMO_STUDY_USER),
  });

  const { data: favorites } = useQuery({
    queryKey: ["library-favorites", DEMO_STUDY_USER],
    queryFn: () => api.getLibraryFavorites(DEMO_STUDY_USER),
  });

  const chapterNote = notes?.find(
    (n) => n.libraryBookId === book.id && n.chapterId === chapterKey
  );
  const isFavorite = favorites?.some(
    (f) => f.libraryBookId === book.id && f.chapterId === chapterKey
  );

  useEffect(() => {
    setNoteText(chapterNote?.content ?? "");
  }, [chapterNote?.content, chapterKey]);

  const persistProgress = useCallback(() => {
    if (!scrollRef.current || !chapterKey || !toc) return;
    const el = scrollRef.current;
    const max = Math.max(1, el.scrollHeight - el.clientHeight);
    const ratio = el.scrollTop / max;
    saveReadingProgress({
      bookId: book.id,
      chapterId: chapterKey,
      chapterTitle: shown?.title,
      scrollTop: el.scrollTop,
      scrollPercent: ratio,
      bookPercent: computeBookPercent(chapterIndex, ratio, toc.chapterCount),
      updatedAt: new Date().toISOString(),
    });
  }, [book.id, chapterKey, shown?.title, chapterIndex, toc]);

  useEffect(() => {
    restoredScroll.current = false;
    setScrollRatio(0);
  }, [chapterKey]);

  useEffect(() => {
    if (!shown || !scrollRef.current || restoredScroll.current) return;
    const el = scrollRef.current;
    const progress = loadReadingProgress(book.id);
    requestAnimationFrame(() => {
      if (progress?.chapterId === chapterKey && progress.scrollTop > 0) {
        el.scrollTop = progress.scrollTop;
        const max = Math.max(1, el.scrollHeight - el.clientHeight);
        setScrollRatio(el.scrollTop / max);
      } else {
        el.scrollTop = 0;
        setScrollRatio(0);
      }
      restoredScroll.current = true;
    });
  }, [shown, chapterKey, book.id]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      const max = Math.max(1, el.scrollHeight - el.clientHeight);
      const ratio = el.scrollTop / max;
      setScrollRatio(ratio);

      if (readerSettings.immersive) {
        const delta = el.scrollTop - lastScrollTop.current;
        if (delta > 8) setToolbarVisible(false);
        else if (delta < -8) setToolbarVisible(true);
        lastScrollTop.current = el.scrollTop;
      }

      clearTimeout(timer);
      timer = setTimeout(persistProgress, 400);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", onScroll);
    };
  }, [persistProgress, chapterKey, readerSettings.immersive]);

  const bookProgressPercent = useMemo(() => {
    if (!toc || !chapterKey) return 0;
    return computeBookPercent(chapterIndex, scrollRatio, toc.chapterCount);
  }, [toc, chapterKey, chapterIndex, scrollRatio]);

  const saveNoteMutation = useMutation({
    mutationFn: () =>
      api.saveLibraryNote({
        userId: DEMO_STUDY_USER,
        libraryBookId: book.id,
        chapterId: chapterKey!,
        content: noteText.trim(),
        excerpt: shown?.title,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library-notes"] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!chapterKey) return;
      if (isFavorite) {
        await api.removeLibraryFavorite(DEMO_STUDY_USER, book.id, chapterKey);
      } else {
        await api.addLibraryFavorite({
          userId: DEMO_STUDY_USER,
          libraryBookId: book.id,
          chapterId: chapterKey,
          chapterTitle: shown?.title,
        });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library-favorites"] });
    },
  });

  const goToChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setTocOpen(false);
    setSelectionMenu(null);
  };

  const openToc = () => {
    setNotesOpen(false);
    setTocOpen(true);
    setToolbarVisible(true);
  };

  const toggleToc = () => {
    if (tocOpen) {
      setTocOpen(false);
      return;
    }
    openToc();
  };

  const goRelative = (delta: number) => {
    if (!toc || chapterIndex < 0) return;
    const next = toc.chapters[chapterIndex + delta];
    if (next) goToChapter(next.id);
  };

  const scrollToHighlight = (paragraphIndex: number) => {
    const el = scrollRef.current?.querySelector(`[data-paragraph-index="${paragraphIndex}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setNotesOpen(false);
  };

  const handleTextMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !scrollRef.current) {
      setSelectionMenu(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length < 3) {
      setSelectionMenu(null);
      return;
    }
    const range = selection.getRangeAt(0);
    const paragraph = range.startContainer.parentElement?.closest("[data-paragraph-index]");
    const paragraphIndex = paragraph
      ? Number((paragraph as HTMLElement).dataset.paragraphIndex)
      : 0;
    const rect = range.getBoundingClientRect();
    setSelectionMenu({
      x: Math.min(window.innerWidth - 220, Math.max(12, rect.left + rect.width / 2 - 100)),
      y: Math.max(12, rect.top - 52),
      text,
      paragraphIndex: Number.isFinite(paragraphIndex) ? paragraphIndex : 0,
    });
  };

  const handleHighlight = (color: HighlightColor) => {
    if (!selectionMenu || !chapterKey) return;
    addHighlight({
      bookId: book.id,
      chapterId: chapterKey,
      paragraphIndex: selectionMenu.paragraphIndex,
      text: selectionMenu.text,
      color,
    });
    setHighlightRevision((r) => r + 1);
    setSelectionMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleCopySelection = async () => {
    if (!selectionMenu || !shown) return;
    await navigator.clipboard.writeText(
      formatCitation(book.title, book.author, shown.title, selectionMenu.text)
    );
    setSelectionMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleExportSelection = () => {
    if (!selectionMenu || !shown) return;
    const citation = formatCitation(book.title, book.author, shown.title, selectionMenu.text);
    downloadTextFile(`passagem-${book.id}-${chapterKey}.txt`, citation);
    setSelectionMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleExportChapter = () => {
    if (!shown) return;
    const body = paragraphs.join("\n\n");
    const content = `# ${book.title}\n*${book.author ?? ""}*\n\n## ${shown.title}\n\n${body}`;
    downloadTextFile(`capitulo-${book.id}-${chapterKey}.md`, content);
  };

  const handleExportAllHighlights = () => {
    if (!toc) return;
    const titles = new Map(toc.chapters.map((c) => [c.id, c.title]));
    const content = exportBookHighlightsMarkdown(book.title, book.author, book.id, titles);
    if (!content) return;
    downloadTextFile(`grifos-${book.id}.md`, content);
  };

  const cycleLineWidth = () => {
    const order = ["narrow", "normal", "wide"] as const;
    const idx = order.indexOf(readerSettings.lineWidth);
    setReaderSettings((s) => ({
      ...s,
      lineWidth: order[(idx + 1) % order.length]!,
    }));
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") goRelative(-1);
      if (e.key === "ArrowRight") goRelative(1);
      if (e.key === "+" || e.key === "=") {
        const sizes: ReaderFontSize[] = ["sm", "md", "lg", "xl"];
        const idx = sizes.indexOf(readerSettings.fontSize);
        if (idx < sizes.length - 1) {
          setReaderSettings((s) => ({ ...s, fontSize: sizes[idx + 1]! }));
        }
      }
      if (e.key === "-") {
        const sizes: ReaderFontSize[] = ["sm", "md", "lg", "xl"];
        const idx = sizes.indexOf(readerSettings.fontSize);
        if (idx > 0) {
          setReaderSettings((s) => ({ ...s, fontSize: sizes[idx - 1]! }));
        }
      }
      if (e.key === "Escape") {
        setTocOpen(false);
        setNotesOpen(false);
        setSelectionMenu(null);
        setToolbarVisible(true);
      }
      if (e.key === "i" || e.key === "I") {
        toggleToc();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chapterIndex, toc, readerSettings.fontSize]);

  if (tocLoading) return <LoadingState message="Carregando índice..." />;

  if (tocError) {
    return (
      <div className="ereader-shell">
        <EmptyState
          title="Livro indisponível"
          description={
            tocError instanceof Error
              ? tocError.message
              : "Salve o arquivo fonte no disco e reinicie a API."
          }
        />
        {onBack && (
          <Button variant="ghost" onClick={onBack} style={{ marginTop: 16 }}>
            Voltar
          </Button>
        )}
      </div>
    );
  }

  const shellClass = [
    "ereader-shell",
    `ereader-shell--${readerSettings.theme}`,
    `ereader-shell--font-${readerSettings.fontSize}`,
    `ereader-shell--width-${readerSettings.lineWidth}`,
    standalone ? "ereader-shell--standalone" : "",
    toolbarVisible ? "" : "ereader-shell--immersive-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={shellClass}
      onMouseMove={(e) => {
        if (!readerSettings.immersive) return;
        if (e.clientY < 72) setToolbarVisible(true);
      }}
    >
      <LibraryReaderToolbar
        bookTitle={book.title}
        author={book.author}
        chapterLabel={shown ? `Cap. ${shown.chapterNumber}: ${shown.title}` : undefined}
        progressPercent={bookProgressPercent}
        isFavorite={Boolean(isFavorite)}
        theme={readerSettings.theme}
        fontSize={readerSettings.fontSize}
        lineWidth={readerSettings.lineWidth}
        immersive={readerSettings.immersive}
        tocOpen={tocOpen}
        notesOpen={notesOpen}
        highlightCount={chapterHighlights.length}
        onBack={onBack}
        onClose={onClose}
        onToggleToc={toggleToc}
        onToggleNotes={() => {
          setTocOpen(false);
          setNotesOpen((v) => !v);
        }}
        onToggleFavorite={() => toggleFavoriteMutation.mutate()}
        onPrevChapter={() => goRelative(-1)}
        onNextChapter={() => goRelative(1)}
        onThemeChange={(theme) => setReaderSettings((s) => ({ ...s, theme }))}
        onFontSizeChange={(fontSize) => setReaderSettings((s) => ({ ...s, fontSize }))}
        onLineWidthCycle={cycleLineWidth}
        onToggleImmersive={() =>
          setReaderSettings((s) => ({ ...s, immersive: !s.immersive }))
        }
        onExportChapter={handleExportChapter}
        onExportHighlights={handleExportAllHighlights}
        canGoPrev={chapterIndex > 0}
        canGoNext={Boolean(toc && chapterIndex < toc.chapters.length - 1)}
      />

      <div className="ereader-layout">
        {tocOpen && toc && (
          <LibraryTocDrawer
            toc={toc}
            activeChapterId={activeChapterId}
            firstChapterId={firstChapterId}
            currentChapterId={currentChapterId}
            onSelectChapter={goToChapter}
            onClose={() => setTocOpen(false)}
          />
        )}

        <main ref={scrollRef} className="ereader-page" onMouseUp={handleTextMouseUp}>
          {/* Zonas de toque estilo Kindle */}
          <button
            type="button"
            className="ereader-tap-zone ereader-tap-zone--left"
            onClick={() => goRelative(-1)}
            disabled={chapterIndex <= 0}
            aria-label="Capítulo anterior"
          />
          <button
            type="button"
            className="ereader-tap-zone ereader-tap-zone--right"
            onClick={() => goRelative(1)}
            disabled={!toc || chapterIndex >= toc.chapters.length - 1}
            aria-label="Próximo capítulo"
          />

          <div className="ereader-page__inner">
            {chapterLoading && !shown && <LoadingState message="Carregando capítulo..." />}

            {shown && (
              <>
                <header className="ereader-page__head">
                  {shown.bookLabel && <Badge variant="gold">{shown.bookLabel}</Badge>}
                  <p className="ereader-page__kicker">Capítulo {shown.chapterNumber}</p>
                  <h1 className="ereader-page__title">{shown.title}</h1>
                  <button
                    type="button"
                    className="ereader-page__loc ereader-page__loc--btn"
                    onClick={openToc}
                    title="Abrir índice do livro"
                  >
                    {chapterIndex + 1} de {toc?.chapterCount ?? "—"} · Ver índice
                  </button>
                </header>

                <LibraryHighlightableText paragraphs={paragraphs} highlights={chapterHighlights} />

                <footer className="ereader-page__footer">
                  <Button variant="ghost" onClick={() => goRelative(-1)} disabled={chapterIndex <= 0}>
                    ← Anterior
                  </Button>
                  <Button variant="ghost" onClick={openToc} className="ereader-page__footer-toc">
                    Índice
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => goRelative(1)}
                    disabled={!toc || chapterIndex >= toc.chapters.length - 1}
                  >
                    Próximo →
                  </Button>
                </footer>
              </>
            )}

            {!chapterLoading && !shown && toc && (
              <div className="ereader-page__empty">
                <EmptyState
                  title="Selecione um capítulo"
                  description="Abra o índice para escolher onde começar a leitura."
                />
                <Button variant="primary" onClick={openToc}>
                  Abrir índice
                </Button>
              </div>
            )}
          </div>
        </main>

        {notesOpen && (
          <>
            <button
              type="button"
              className="ereader-drawer-backdrop"
              onClick={() => setNotesOpen(false)}
              aria-label="Fechar painel"
            />
            <aside className="ereader-drawer ereader-drawer--notes">
              <h3 className="ereader-drawer__title">Notas e grifos</h3>
              <div className="ereader-drawer__scroll">
                <section className="ereader-notes-section">
                  <h4>Nota pessoal</h4>
                  <textarea
                    className="ereader-notes-input"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Anote insights sobre este capítulo..."
                    rows={5}
                  />
                  <Button
                    variant="primary"
                    onClick={() => saveNoteMutation.mutate()}
                    disabled={!noteText.trim() || saveNoteMutation.isPending}
                  >
                    {chapterNote ? "Atualizar nota" : "Salvar nota"}
                  </Button>
                </section>

                <section className="ereader-notes-section">
                  <div className="ereader-notes-section__head">
                    <h4>Grifos ({chapterHighlights.length})</h4>
                    {chapterHighlights.length > 0 && (
                      <button type="button" className="ereader-notes-link" onClick={handleExportAllHighlights}>
                        Exportar todos
                      </button>
                    )}
                  </div>
                  {chapterHighlights.length === 0 ? (
                    <p className="ereader-notes-empty">Selecione um trecho no texto para grifar.</p>
                  ) : (
                    <ul className="ereader-highlight-list">
                      {chapterHighlights.map((hl) => (
                        <HighlightListItem
                          key={hl.id}
                          text={hl.text}
                          color={hl.color}
                          onJump={() => scrollToHighlight(hl.paragraphIndex)}
                          onCopy={() => {
                            if (!shown) return;
                            void navigator.clipboard.writeText(
                              formatCitation(book.title, book.author, shown.title, hl.text)
                            );
                          }}
                          onRemove={() => {
                            removeHighlight(hl.id);
                            setHighlightRevision((r) => r + 1);
                          }}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </aside>
          </>
        )}
      </div>

      {selectionMenu && (
        <LibrarySelectionPopover
          x={selectionMenu.x}
          y={selectionMenu.y}
          selectedText={selectionMenu.text}
          onHighlight={handleHighlight}
          onCopy={() => void handleCopySelection()}
          onExport={handleExportSelection}
          onClose={() => setSelectionMenu(null)}
        />
      )}

      {toc && (
        <LibraryTocFab
          onClick={toggleToc}
          open={tocOpen}
          chapterCount={toc.chapterCount}
        />
      )}
    </div>
  );
}
