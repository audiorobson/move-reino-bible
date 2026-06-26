import { Copy, Download, Highlighter, LocateFixed, Trash2 } from "lucide-react";
import type { HighlightColor } from "../../lib/library-reader-store";

const HIGHLIGHT_COLORS: { id: HighlightColor; label: string }[] = [
  { id: "yellow", label: "Amarelo" },
  { id: "green", label: "Verde" },
  { id: "blue", label: "Azul" },
  { id: "pink", label: "Rosa" },
];

interface LibrarySelectionPopoverProps {
  x: number;
  y: number;
  selectedText: string;
  onHighlight: (color: HighlightColor) => void;
  onCopy: () => void;
  onExport: () => void;
  onClose: () => void;
}

export function LibrarySelectionPopover({
  x,
  y,
  selectedText,
  onHighlight,
  onCopy,
  onExport,
  onClose,
}: LibrarySelectionPopoverProps) {
  if (!selectedText.trim()) return null;

  return (
    <>
      <button type="button" className="ereader-selection-backdrop" onClick={onClose} aria-label="Fechar" />
      <div
        className="ereader-selection-popover"
        style={{ left: x, top: y }}
        role="toolbar"
        aria-label="Ações de seleção"
      >
        <span className="ereader-selection-popover__label">
          <Highlighter size={13} /> Grifar
        </span>
        <div className="ereader-selection-popover__colors">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              className={`ereader-selection-popover__color ereader-selection-popover__color--${color.id}`}
              title={color.label}
              onClick={() => onHighlight(color.id)}
            />
          ))}
        </div>
        <div className="ereader-selection-popover__actions">
          <button type="button" onClick={onCopy} title="Copiar passagem">
            <Copy size={14} />
          </button>
          <button type="button" onClick={onExport} title="Exportar passagem">
            <Download size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

interface HighlightListItemProps {
  text: string;
  color: HighlightColor;
  onJump?: () => void;
  onCopy: () => void;
  onRemove: () => void;
}

export function HighlightListItem({ text, color, onJump, onCopy, onRemove }: HighlightListItemProps) {
  return (
    <li className="ereader-highlight-item">
      <button
        type="button"
        className="ereader-highlight-item__text"
        onClick={onJump}
        title="Ir ao trecho"
      >
        <mark className={`ereader-highlight ereader-highlight--${color}`}>
          {text.slice(0, 120)}
          {text.length > 120 ? "…" : ""}
        </mark>
      </button>
      <div className="ereader-highlight-item__actions">
        {onJump && (
          <button type="button" onClick={onJump} title="Ir ao trecho">
            <LocateFixed size={13} />
          </button>
        )}
        <button type="button" onClick={onCopy} title="Copiar">
          <Copy size={13} />
        </button>
        <button type="button" onClick={onRemove} title="Remover grifo">
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}
