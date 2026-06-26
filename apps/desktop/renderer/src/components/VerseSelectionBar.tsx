import { useState, useCallback } from "react";
import {
  Sparkles,
  FileText,
  GitBranch,
  Hash,
  Database,
  Languages,
  Search,
  Copy,
  X,
  GripVertical,
  Check,
} from "lucide-react";
import type { AppModule } from "@mrb/shared-types";
import { Button, Badge } from "@mrb/ui-kit";
import { useAppStore } from "../store/appStore";
import { formatVerseForClipboard, setVerseDragData } from "../lib/verse-context";
import { useChapterOriginal } from "../hooks/useChapterOriginal";
import { originalScriptLabel } from "../lib/original-language";

const ACTIONS: Array<{
  module: AppModule;
  label: string;
  icon: typeof Sparkles;
  variant?: "ai" | "secondary" | "gold";
}> = [
  { module: "ai", label: "IA", icon: Sparkles, variant: "ai" },
  { module: "studies", label: "Estudo", icon: FileText },
  { module: "chains", label: "Cadeias", icon: GitBranch },
  { module: "strong", label: "Strong", icon: Hash },
  { module: "theology-rag", label: "RAG", icon: Database },
  { module: "search", label: "Buscar", icon: Search },
];

const FLASH_MS = 1400;

export function VerseSelectionBar({ compact }: { compact?: boolean }) {
  const [flashModule, setFlashModule] = useState<AppModule | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    selectedVerseContext,
    clearVerseSelection,
    dispatchVerseToModule,
    sendVerseToStudy,
    studyModeOpen,
    selectedOriginalToken,
    openStrongLookup,
    setActiveModule,
    setSelectedOriginalToken,
  } = useAppStore();

  const ctx = selectedVerseContext;
  const { hasVerseData, tokensByVerse, originalLanguage } = useChapterOriginal(
    ctx?.bookOsisId ?? "",
    ctx?.chapter ?? 0,
    !!ctx
  );

  const flash = useCallback((module: AppModule) => {
    setFlashModule(module);
    window.setTimeout(() => setFlashModule((m) => (m === module ? null : m)), FLASH_MS);
  }, []);

  if (!ctx) return null;

  const hasOriginal = hasVerseData(ctx.verse);
  const verseTokens =
    (tokensByVerse as Record<string, typeof tokensByVerse[number]>)[String(ctx.verse)] ?? [];

  const openOriginalVocab = () => {
    flash("originals");
    if (verseTokens[0]) setSelectedOriginalToken(verseTokens[0]);
    dispatchVerseToModule("originals", ctx);
  };

  const runAction = (module: AppModule, fn: () => void) => {
    flash(module);
    fn();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatVerseForClipboard(ctx));
    setCopied(true);
    window.setTimeout(() => setCopied(false), FLASH_MS);
  };

  return (
    <div
      className={`verse-selection-bar ${compact ? "verse-selection-bar--compact" : ""}`}
      draggable
      onDragStart={(e) => setVerseDragData(e, ctx)}
    >
      <div className="verse-selection-bar__main">
        <GripVertical size={16} className="verse-selection-bar__grip" />
        <div className="verse-selection-bar__text">
          <div className="verse-selection-bar__ref">
            <Badge variant="gold">{ctx.reference}</Badge>
            <Badge variant="blue">{ctx.version}</Badge>
            {hasOriginal && (
              <Badge variant="gold">
                {originalLanguage ? `${originalScriptLabel(originalLanguage)} STEP` : "STEP"}
              </Badge>
            )}
          </div>
          {!compact && (
            <p className="verse-selection-bar__preview">"{ctx.text}"</p>
          )}
        </div>
      </div>

      <div className="verse-selection-bar__actions">
        {hasOriginal && (
          <Button
            variant="gold"
            className={flashModule === "originals" ? "verse-action-btn--flash" : ""}
            onClick={openOriginalVocab}
            title="Ver palavras originais"
          >
            <Languages size={14} />
            {!compact && "Originais"}
          </Button>
        )}
        {ACTIONS.map(({ module, label, icon: Icon, variant }) => (
          <Button
            key={module}
            variant={variant ?? "secondary"}
            className={flashModule === module ? "verse-action-btn--flash" : ""}
            onClick={() =>
              runAction(module, () => {
                if (module === "studies") {
                  sendVerseToStudy(ctx);
                  return;
                }
                if (module === "strong" && selectedOriginalToken?.strongNumber) {
                  openStrongLookup(selectedOriginalToken.strongNumber);
                  return;
                }
                dispatchVerseToModule(module, ctx);
              })
            }
            title={
              module === "studies" && studyModeOpen
                ? "Enviar para janela de estudo"
                : `Enviar para ${label}`
            }
          >
            {flashModule === module ? <Check size={14} /> : <Icon size={14} />}
            {!compact && (flashModule === module ? "Enviado" : label)}
          </Button>
        ))}
        <Button
          variant="ghost"
          className={copied ? "verse-action-btn--flash" : ""}
          onClick={handleCopy}
          title="Copiar versículo"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
        <Button variant="ghost" onClick={clearVerseSelection} title="Limpar seleção">
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
