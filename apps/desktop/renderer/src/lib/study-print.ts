import type { StudySessionRecord } from "./api";
import { exportStudyToPrintHtml } from "./study-export";

export function isElectronPrintAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.mrb?.printHtml && window.mrb?.listPrinters);
}

export function isElectronPdfSaveAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.mrb?.savePdf);
}

export function isPdfPrinter(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes("pdf") ||
    lower.includes("xps") ||
    lower.includes("salvar") ||
    lower.includes("print to") ||
    lower.includes("imprimir em")
  );
}

export async function printStudyHtml(
  html: string,
  options?: { deviceName?: string; silent?: boolean }
): Promise<{ success: boolean; error?: string }> {
  if (window.mrb?.printHtml) {
    return window.mrb.printHtml({
      html,
      deviceName: options?.deviceName,
      silent: options?.silent,
    });
  }

  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!win) {
    return { success: false, error: "Permita pop-ups para imprimir o estudo." };
  }

  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  return { success: true };
}

export async function printFormattedStudyWithOptions(
  study: StudySessionRecord,
  options?: { deviceName?: string; silent?: boolean }
) {
  const html = exportStudyToPrintHtml(study);
  return printStudyHtml(html, options);
}

export async function saveStudyAsPdf(study: StudySessionRecord): Promise<{ success: boolean; error?: string }> {
  const html = exportStudyToPrintHtml(study);
  const defaultName = study.title.replace(/[^\w\s-áàâãéêíóôõúç]/gi, "").trim() || "estudo";

  if (window.mrb?.savePdf) {
    return window.mrb.savePdf({ html, defaultName });
  }

  return { success: false, error: "Salvar PDF não disponível neste ambiente." };
}

export async function printFormattedStudy(study: StudySessionRecord) {
  return printFormattedStudyWithOptions(study, { silent: false });
}
