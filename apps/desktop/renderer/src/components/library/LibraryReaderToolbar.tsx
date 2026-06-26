import {
  AlignJustify,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Highlighter,
  List,
  Minus,
  Moon,
  Plus,
  ScrollText,
  Star,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@mrb/ui-kit";
import type { ReaderFontSize, ReaderTheme } from "../../lib/library-reader-store";

interface LibraryReaderToolbarProps {
  bookTitle: string;
  author?: string;
  chapterLabel?: string;
  progressPercent: number;
  isFavorite: boolean;
  theme: ReaderTheme;
  fontSize: ReaderFontSize;
  lineWidth: "narrow" | "normal" | "wide";
  immersive: boolean;
  tocOpen: boolean;
  notesOpen: boolean;
  highlightCount: number;
  onBack?: () => void;
  onClose?: () => void;
  onToggleToc: () => void;
  onToggleNotes: () => void;
  onToggleFavorite: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  onThemeChange: (theme: ReaderTheme) => void;
  onFontSizeChange: (size: ReaderFontSize) => void;
  onLineWidthCycle: () => void;
  onToggleImmersive: () => void;
  onExportChapter: () => void;
  onExportHighlights: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

const FONT_SIZES: ReaderFontSize[] = ["sm", "md", "lg", "xl"];
const LINE_WIDTH_LABELS = { narrow: "Estreita", normal: "Normal", wide: "Ampla" };
const THEMES: { id: ReaderTheme; icon: typeof Sun; label: string }[] = [
  { id: "sepia", icon: ScrollText, label: "Sépia" },
  { id: "paper", icon: Sun, label: "Papel" },
  { id: "night", icon: Moon, label: "Noite" },
];

export function LibraryReaderToolbar({
  bookTitle,
  author,
  chapterLabel,
  progressPercent,
  isFavorite,
  theme,
  fontSize,
  lineWidth,
  immersive,
  tocOpen,
  notesOpen,
  highlightCount,
  onBack,
  onClose,
  onToggleToc,
  onToggleNotes,
  onToggleFavorite,
  onPrevChapter,
  onNextChapter,
  onThemeChange,
  onFontSizeChange,
  onLineWidthCycle,
  onToggleImmersive,
  onExportChapter,
  onExportHighlights,
  canGoPrev,
  canGoNext,
}: LibraryReaderToolbarProps) {
  const fontIndex = FONT_SIZES.indexOf(fontSize);

  const cycleFont = (delta: number) => {
    const next = FONT_SIZES[Math.min(FONT_SIZES.length - 1, Math.max(0, fontIndex + delta))];
    if (next) onFontSizeChange(next);
  };

  return (
    <header className="ereader-toolbar">
      <div className="ereader-toolbar__row ereader-toolbar__row--top">
        <div className="ereader-toolbar__left">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="ereader-toolbar__icon-btn" title="Voltar">
              <ChevronLeft size={18} />
            </Button>
          )}
          <div className="ereader-toolbar__title-block">
            <span className="ereader-toolbar__book">{bookTitle}</span>
            {author && <span className="ereader-toolbar__author">{author}</span>}
          </div>
        </div>

        <div className="ereader-toolbar__center">
          {chapterLabel && <span className="ereader-toolbar__chapter">{chapterLabel}</span>}
        </div>

        <div className="ereader-toolbar__right">
          <Button
            variant="ghost"
            onClick={onToggleFavorite}
            className="ereader-toolbar__icon-btn"
            title={isFavorite ? "Remover favorito" : "Favoritar capítulo"}
          >
            <Star size={17} fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          <Button
            variant="ghost"
            onClick={onToggleNotes}
            className={`ereader-toolbar__icon-btn ${notesOpen ? "ereader-toolbar__icon-btn--active" : ""}`}
            title="Notas e grifos"
          >
            <Bookmark size={17} />
          </Button>
          <Button
            variant="ghost"
            onClick={onExportChapter}
            className="ereader-toolbar__icon-btn"
            title="Exportar capítulo (.md)"
          >
            <Download size={17} />
          </Button>
          <Button
            variant="ghost"
            onClick={onToggleToc}
            className={`ereader-toolbar__icon-btn ereader-toolbar__toc-btn ${tocOpen ? "ereader-toolbar__icon-btn--active" : ""}`}
            title="Ver índice (I)"
          >
            <List size={17} />
            <span className="ereader-toolbar__toc-label">Índice</span>
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose} className="ereader-toolbar__icon-btn" title="Fechar">
              <X size={17} />
            </Button>
          )}
        </div>
      </div>

      <div className="ereader-toolbar__row ereader-toolbar__row--bottom">
        <div className="ereader-toolbar__nav">
          <Button
            variant="ghost"
            onClick={onPrevChapter}
            disabled={!canGoPrev}
            className="ereader-toolbar__nav-btn"
          >
            <ChevronLeft size={16} /> Anterior
          </Button>
          <Button
            variant="ghost"
            onClick={onNextChapter}
            disabled={!canGoNext}
            className="ereader-toolbar__nav-btn"
          >
            Próximo <ChevronRight size={16} />
          </Button>
        </div>

        <div className="ereader-toolbar__display">
          <div className="ereader-toolbar__themes" role="group" aria-label="Tema de leitura">
            {THEMES.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                className={`ereader-toolbar__theme-btn ${theme === id ? "ereader-toolbar__theme-btn--active" : ""}`}
                onClick={() => onThemeChange(id)}
                title={label}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
          <div className="ereader-toolbar__font">
            <button
              type="button"
              className="ereader-toolbar__font-btn"
              onClick={() => cycleFont(-1)}
              disabled={fontIndex <= 0}
              title="Diminuir fonte"
            >
              <Minus size={14} />
            </button>
            <span className="ereader-toolbar__font-label">Aa</span>
            <button
              type="button"
              className="ereader-toolbar__font-btn"
              onClick={() => cycleFont(1)}
              disabled={fontIndex >= FONT_SIZES.length - 1}
              title="Aumentar fonte"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            type="button"
            className="ereader-toolbar__width-btn"
            onClick={onLineWidthCycle}
            title={`Largura: ${LINE_WIDTH_LABELS[lineWidth]}`}
          >
            <AlignJustify size={15} />
          </button>
          <button
            type="button"
            className={`ereader-toolbar__width-btn ${immersive ? "ereader-toolbar__width-btn--active" : ""}`}
            onClick={onToggleImmersive}
            title={immersive ? "Modo imersivo ativo" : "Modo imersivo desativado"}
          >
            {immersive ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          {highlightCount > 0 && (
            <button
              type="button"
              className="ereader-toolbar__highlights"
              title="Exportar todos os grifos"
              onClick={onExportHighlights}
            >
              <Highlighter size={14} /> {highlightCount}
            </button>
          )}
        </div>

        <div className="ereader-toolbar__progress-wrap">
          <div className="ereader-toolbar__progress-bar">
            <div
              className="ereader-toolbar__progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <span className="ereader-toolbar__progress-label">{Math.round(progressPercent)}%</span>
        </div>
      </div>
    </header>
  );
}
