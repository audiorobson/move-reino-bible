import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import { Badge, Button } from "@mrb/ui-kit";
import type { StudySessionRecord } from "../../lib/api";
import type { PrinterInfo } from "../../window.d";
import {
  isElectronPdfSaveAvailable,
  isElectronPrintAvailable,
  isPdfPrinter,
  printFormattedStudyWithOptions,
  saveStudyAsPdf,
} from "../../lib/study-print";

interface StudyPrintDialogProps {
  study: StudySessionRecord;
  open: boolean;
  onClose: () => void;
}

export function StudyPrintDialog({ study, open, onClose }: StudyPrintDialogProps) {
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const electron = isElectronPrintAvailable();
  const pdfSave = isElectronPdfSaveAvailable();

  useEffect(() => {
    if (!open) return;

    setError(null);

    if (!window.mrb?.listPrinters) {
      setPrinters([]);
      return;
    }

    setLoadingPrinters(true);
    void window.mrb
      .listPrinters()
      .then((list) => {
        setPrinters(list);
        const preferred =
          list.find((p) => isPdfPrinter(p.displayName) || isPdfPrinter(p.name)) ??
          list.find((p) => p.isDefault) ??
          list[0];
        setSelectedPrinter(preferred?.name ?? "");
        if (list.length === 0) {
          setError("Nenhuma impressora instalada foi encontrada no sistema.");
        }
      })
      .catch(() => {
        setError("Não foi possível listar as impressoras do sistema.");
      })
      .finally(() => setLoadingPrinters(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const runAfterClose = async (task: () => Promise<{ success: boolean; error?: string }>) => {
    onClose();
    const result = await task();
    if (result.success) return;
    if (result.error && result.error !== "Impressão cancelada") {
      window.alert(result.error);
    }
  };

  const handleSystemDialog = () =>
    void runAfterClose(() => printFormattedStudyWithOptions(study, { silent: false }));

  const handleSavePdf = () => void runAfterClose(() => saveStudyAsPdf(study));

  const handlePrintToDevice = () => {
    const isPdf = selectedPrinter ? isPdfPrinter(selectedPrinter) : false;

    if (isPdf && pdfSave) {
      void handleSavePdf();
      return;
    }

    void runAfterClose(() =>
      printFormattedStudyWithOptions(study, {
        deviceName: selectedPrinter || undefined,
        silent: Boolean(selectedPrinter && !isPdf),
      })
    );
  };

  const primaryLabel =
    pdfSave && selectedPrinter && isPdfPrinter(selectedPrinter)
      ? "Salvar como PDF"
      : "Imprimir";

  return createPortal(
    <div className="study-print-dialog" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="study-print-dialog__panel" onClick={(e) => e.stopPropagation()}>
        <header className="study-print-dialog__header">
          <div>
            <Badge variant="gold">Imprimir estudo</Badge>
            <p className="study-print-dialog__title">{study.title}</p>
          </div>
          <button type="button" className="study-print-dialog__close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <div className="study-print-dialog__body">
          {electron ? (
            <>
              <label className="study-print-dialog__label" htmlFor="study-printer-select">
                Impressora instalada
              </label>
              <select
                id="study-printer-select"
                className="mrb-input study-print-dialog__select"
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                disabled={loadingPrinters}
              >
                {loadingPrinters && <option value="">Carregando impressoras…</option>}
                {!loadingPrinters && printers.length === 0 && (
                  <option value="">Nenhuma impressora encontrada</option>
                )}
                {printers.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.displayName}
                    {p.isDefault ? " (padrão)" : ""}
                    {isPdfPrinter(p.name) ? " — Salvar como PDF" : ""}
                  </option>
                ))}
              </select>
              <p className="study-print-dialog__hint">
                {pdfSave ? (
                  <>
                    Use <strong>Salvar como PDF</strong> para escolher onde gravar o arquivo, ou{" "}
                    <strong>Diálogo do sistema</strong> para imprimir em papel.
                  </>
                ) : (
                  <>
                    Selecione <strong>Microsoft Print to PDF</strong> ou use{" "}
                    <strong>Diálogo do sistema</strong>.
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="study-print-dialog__hint">
              Abra o diálogo de impressão do navegador para escolher impressora ou salvar como PDF.
            </p>
          )}

          {error && (
            <p className="study-print-dialog__error" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="study-print-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={handleSystemDialog}>
            <Printer size={14} />
            Diálogo do sistema
          </Button>
          {pdfSave && (
            <Button variant="secondary" onClick={handleSavePdf}>
              <Printer size={14} />
              Salvar como PDF
            </Button>
          )}
          <Button
            variant="gold"
            onClick={handlePrintToDevice}
            disabled={electron && !selectedPrinter && !pdfSave}
          >
            <Printer size={14} />
            {primaryLabel}
          </Button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
