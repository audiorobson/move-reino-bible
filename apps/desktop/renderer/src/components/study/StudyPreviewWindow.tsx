import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Printer, Download } from "lucide-react";
import { Badge, Button, EmptyState } from "@mrb/ui-kit";
import { useAppStore } from "../../store/appStore";
import { StudyFormattedView } from "./StudyFormattedView";
import { StudyPrintDialog } from "./StudyPrintDialog";
import { downloadTextFile, exportStudyToPlainText } from "../../lib/study-export";

export function StudyPreviewWindow() {
  const { studyPreviewOpen, studyPreviewStudy, closeStudyPreview } = useAppStore();
  const study = studyPreviewStudy;
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    if (!studyPreviewOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeStudyPreview();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [studyPreviewOpen, closeStudyPreview]);

  if (!studyPreviewOpen) return null;

  const handlePrint = () => {
    if (!study?.blocks.length) return;
    setPrintOpen(true);
  };

  const handleExport = () => {
    if (!study) return;
    const text = exportStudyToPlainText(study);
    const safeName = study.title.replace(/[^\w\s-áàâãéêíóôõúç]/gi, "").trim() || "estudo";
    downloadTextFile(`${safeName}.txt`, text);
  };

  return createPortal(
    <div
      className="study-preview-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-preview-title"
      onClick={closeStudyPreview}
    >
      <div className="study-preview-modal__panel" onClick={(e) => e.stopPropagation()}>
        <header className="study-preview-modal__header">
          <div>
            <Badge variant="gold">Visualizar estudo</Badge>
            <h2 id="study-preview-title" className="study-preview-modal__title">
              {study?.title ?? "Estudo"}
            </h2>
            {study?.passageRange && (
              <p className="study-preview-modal__subtitle">{study.passageRange}</p>
            )}
          </div>
          <div className="study-preview-modal__actions">
            <Button
              variant="secondary"
              title="Exportar TXT"
              onClick={handleExport}
              disabled={!study?.blocks.length}
            >
              <Download size={14} />
            </Button>
            <Button
              variant="gold"
              title="Imprimir"
              onClick={handlePrint}
              disabled={!study?.blocks.length}
            >
              <Printer size={14} />
              Imprimir
            </Button>
            <button
              type="button"
              className="study-preview-modal__close"
              title="Fechar"
              onClick={closeStudyPreview}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="study-preview-modal__body mrb-scroll">
          {!study || study.blocks.length === 0 ? (
            <EmptyState
              title="Estudo vazio"
              description="Adicione versículos e blocos de texto no editor para visualizar o estudo formatado."
            />
          ) : (
            <StudyFormattedView study={study} showHeader={false} />
          )}
        </div>
      </div>
      {study && (
        <StudyPrintDialog study={study} open={printOpen} onClose={() => setPrintOpen(false)} />
      )}
    </div>,
    document.body
  );
}
