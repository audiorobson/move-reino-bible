import { useCallback, useEffect, useRef, useState } from "react";
import { Save, Download, Printer, Eye } from "lucide-react";
import { Badge, Button } from "@mrb/ui-kit";
import { useAppStore } from "../../store/appStore";
import { useStudySession } from "../../hooks/useStudySession";
import { VerseDropZone } from "../VerseDropZone";
import { StudyEditor, linkedVersesFromBlock } from "./StudyEditor";
import { StudyPendingQueue } from "./StudyPendingQueue";
import { StudyBlockToolbar } from "./StudyBlockToolbar";
import { StudyPrintDialog } from "./StudyPrintDialog";
import { downloadTextFile, exportStudyToPlainText } from "../../lib/study-export";
import { defaultStudyTitle } from "../../lib/study-utils";
import type { VerseContext } from "../../lib/verse-context";

interface StudyPanelShellProps {
  onClose?: () => void;
  onDropVerse?: (ctx: VerseContext) => void;
  showDropZone?: boolean;
}

export function StudyPanelShell({ onClose, onDropVerse, showDropZone = true }: StudyPanelShellProps) {
  const {
    studyDraftDirty,
    setStudyDraftDirty,
    consumeStudyVerseInbox,
    sendVerseToStudy,
    studyVerseInbox,
    clearStudyVerses,
    studyVerses,
    openStudyPreview,
  } = useAppStore();

  const {
    studies,
    activeStudy,
    activeStudyId,
    isLoading,
    ensureDraftStudy,
    createStudy,
    selectStudy,
    addVerseBlock,
    addTextBlock,
    saveBlockText,
    deleteBlock,
    flushPendingVerses,
    isSaving,
    updateStudyTitle,
    createError,
    clearCreateError,
  } = useStudySession();

  const [titleEdit, setTitleEdit] = useState("");
  const [printOpen, setPrintOpen] = useState(false);
  const processingInbox = useRef(false);

  const processVerseInbox = useCallback(async () => {
    if (processingInbox.current) return;
    processingInbox.current = true;

    let processed = false;
    try {
      const studyId = await ensureDraftStudy();
      if (!studyId) return;

      processed = true;
      let batch = consumeStudyVerseInbox();
      while (batch.length > 0) {
        for (const ctx of batch) {
          await addVerseBlock(ctx);
        }
        batch = consumeStudyVerseInbox();
      }
      clearStudyVerses();
    } finally {
      processingInbox.current = false;
      if (processed) {
        const pending = useAppStore.getState().studyVerseInbox.length;
        if (pending > 0) {
          window.setTimeout(() => void processVerseInbox(), 0);
        }
      }
    }
  }, [ensureDraftStudy, addVerseBlock, consumeStudyVerseInbox, clearStudyVerses]);

  useEffect(() => {
    void ensureDraftStudy();
  }, [ensureDraftStudy]);

  useEffect(() => {
    if (activeStudy?.title) setTitleEdit(activeStudy.title);
  }, [activeStudy?.title]);

  useEffect(() => {
    if (studyVerseInbox.length === 0) return;
    void processVerseInbox();
  }, [studyVerseInbox.length, processVerseInbox]);

  const handleClose = () => {
    if (studyDraftDirty && !confirm("Há alterações não salvas. Fechar mesmo assim?")) return;
    onClose?.();
  };

  const handleDropVerse = (ctx: VerseContext) => {
    if (onDropVerse) {
      onDropVerse(ctx);
      return;
    }
    sendVerseToStudy(ctx);
  };

  const handleExport = () => {
    if (!activeStudy) return;
    const text = exportStudyToPlainText(activeStudy);
    const safeName = activeStudy.title.replace(/[^\w\s-áàâãéêíóôõúç]/gi, "").trim() || "estudo";
    downloadTextFile(`${safeName}.txt`, text);
  };

  const handlePrint = () => {
    if (!activeStudy?.blocks.length) return;
    setPrintOpen(true);
  };

  const handlePreview = () => {
    if (!activeStudy) return;
    openStudyPreview(activeStudy);
  };

  const handleSave = () => {
    setStudyDraftDirty(false);
  };

  return (
    <div className="study-panel-shell">
      <header className="study-panel-shell__header">
        <div className="study-panel-shell__title-wrap">
          <Badge variant="gold">Modo de Estudo</Badge>
          <input
            className="study-panel-shell__title-input"
            value={titleEdit}
            onChange={(e) => setTitleEdit(e.target.value)}
            onBlur={() => {
              if (activeStudy && titleEdit.trim() && titleEdit !== activeStudy.title) {
                updateStudyTitle(titleEdit.trim());
              }
            }}
            placeholder="Título do estudo"
          />
        </div>
      </header>

      <div className="study-panel-shell__toolbar">
        {createError && (
          <p className="study-float-window__error" role="alert">
            {createError}
            <button type="button" onClick={clearCreateError} aria-label="Fechar erro">
              ×
            </button>
          </p>
        )}
        <select
          className="mrb-input study-float-window__select"
          value={activeStudyId ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__new__") {
              createStudy(defaultStudyTitle());
            } else if (v) {
              selectStudy(v);
            }
          }}
        >
          <option value="" disabled>
            Estudo ativo
          </option>
          {studies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
          <option value="__new__">+ Novo estudo</option>
        </select>
        <Button variant="secondary" title="Salvar" onClick={handleSave} disabled={isSaving}>
          <Save size={14} />
        </Button>
        <Button variant="secondary" title="Exportar TXT" onClick={handleExport} disabled={!activeStudy?.blocks.length}>
          <Download size={14} />
        </Button>
        <Button variant="gold" title="Visualizar estudo" onClick={handlePreview} disabled={!activeStudy?.blocks.length}>
          <Eye size={14} />
          Visualizar
        </Button>
        <Button variant="secondary" title="Imprimir" onClick={handlePrint} disabled={!activeStudy?.blocks.length}>
          <Printer size={14} />
        </Button>
        {onClose && (
          <Button variant="secondary" title="Fechar janela de estudo" onClick={handleClose}>
            Fechar
          </Button>
        )}
      </div>

      <StudyBlockToolbar
        onAddBlock={(type) => void addTextBlock(type, "")}
        onAddVerseFromQueue={() => void flushPendingVerses()}
        hasPendingVerses={studyVerses.length > 0}
        busy={isSaving}
      />

      {showDropZone && (
        <VerseDropZone label="Solte versículos aqui" onDrop={handleDropVerse} compact />
      )}

      <StudyEditor
        study={activeStudy}
        loading={isLoading}
        onDeleteBlock={deleteBlock}
        onSaveBlockText={(id, text) => {
          saveBlockText(id, text);
        }}
        onAddNoteAfterVerse={(verseBlock, type) => {
          void addTextBlock(type, "", linkedVersesFromBlock(verseBlock));
        }}
      />

      <StudyPendingQueue onFlush={() => void flushPendingVerses()} busy={isSaving} />

      {activeStudy && (
        <StudyPrintDialog study={activeStudy} open={printOpen} onClose={() => setPrintOpen(false)} />
      )}
    </div>
  );
}
