import { useState, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import type { VerseContext } from "../lib/verse-context";
import { getVerseFromDragEvent } from "../lib/verse-context";

interface VerseDropZoneProps {
  label: string;
  hint?: string;
  onDrop: (ctx: VerseContext) => void;
  children?: ReactNode;
  compact?: boolean;
}

export function VerseDropZone({ label, hint, onDrop, children, compact }: VerseDropZoneProps) {
  const [active, setActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setActive(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setActive(false);
    const ctx = getVerseFromDragEvent(e);
    if (ctx) onDrop(ctx);
  };

  return (
    <div
      className={`verse-drop-zone ${active ? "verse-drop-zone--active" : ""} ${compact ? "verse-drop-zone--compact" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
    >
      <div className="verse-drop-zone__label">
        <GripVertical size={14} />
        <span>{label}</span>
      </div>
      {hint && <p className="verse-drop-zone__hint">{hint}</p>}
      {children}
    </div>
  );
}
