import { writeFile, unlink } from "fs/promises";
import path from "path";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { getMainWindow, getStudyWindow } from "../windows.js";

export interface PrinterInfoDto {
  name: string;
  displayName: string;
  description: string;
  isDefault: boolean;
  status: number;
}

export interface PrintHtmlOptions {
  html: string;
  deviceName?: string;
  silent?: boolean;
}

export interface SavePdfOptions {
  html: string;
  defaultName?: string;
}

function getPrinterHostWindow(): BrowserWindow | null {
  const main = getMainWindow();
  if (main && !main.isDestroyed()) return main;
  return BrowserWindow.getAllWindows().find((w) => !w.isDestroyed()) ?? null;
}

async function withoutStudyWindowFocus<T>(task: () => Promise<T>): Promise<T> {
  const study = getStudyWindow();
  const main = getMainWindow();
  const studyWasVisible = Boolean(study && !study.isDestroyed() && study.isVisible());

  if (studyWasVisible && study) study.hide();
  if (main && !main.isDestroyed()) {
    main.show();
    main.focus();
  }

  try {
    return await task();
  } finally {
    if (studyWasVisible && study && !study.isDestroyed()) {
      study.show();
      study.focus();
    }
  }
}

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[^\w\s-áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/gi, "").trim();
  return cleaned || "estudo";
}

function createPrintWindow(): BrowserWindow {
  return new BrowserWindow({
    show: false,
    width: 794,
    height: 1123,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
}

async function loadPrintContent(win: BrowserWindow, html: string): Promise<string> {
  const tmpPath = path.join(app.getPath("temp"), `mrb-print-${Date.now()}.html`);
  await writeFile(tmpPath, html, "utf8");
  await win.loadFile(tmpPath);
  await win.webContents.executeJavaScript(`
    new Promise((resolve) => {
      const done = () => resolve(true);
      if (document.readyState === "complete") {
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(done).catch(done);
        } else {
          setTimeout(done, 300);
        }
      } else {
        window.addEventListener("load", done, { once: true });
      }
    })
  `);
  return tmpPath;
}

async function generatePdfBuffer(printWin: BrowserWindow, html: string): Promise<Buffer> {
  let tmpPath: string | null = null;

  try {
    tmpPath = await loadPrintContent(printWin, html);

    // printToPDF no Windows exige janela renderizada (não apenas show:false)
    printWin.showInactive();
    await new Promise((resolve) => setTimeout(resolve, 350));

    const pdfData = await Promise.race([
      printWin.webContents.printToPDF({
        printBackground: true,
        preferCSSPageSize: false,
        pageSize: "A4",
        margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Tempo esgotado ao gerar PDF")), 60_000)
      ),
    ]);

    return Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
  } finally {
    if (tmpPath) await unlink(tmpPath).catch(() => undefined);
  }
}

async function printHtml(options: PrintHtmlOptions): Promise<{ success: boolean; error?: string }> {
  const printWin = createPrintWindow();
  let tmpPath: string | null = null;

  try {
    tmpPath = await loadPrintContent(printWin, options.html);
    printWin.showInactive();
    await new Promise((resolve) => setTimeout(resolve, 350));

    return await new Promise((resolve) => {
      let settled = false;
      const finish = (result: { success: boolean; error?: string }) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(result);
      };

      const timeout = setTimeout(() => {
        finish({
          success: false,
          error: "Tempo esgotado. Verifique se o diálogo de impressão está aberto atrás da janela do app.",
        });
      }, 120_000);

      printWin.webContents.print(
        {
          silent: options.silent ?? false,
          deviceName: options.deviceName || undefined,
          printBackground: true,
          margins: { marginType: "default" },
        },
        (success, failureReason) => {
          finish(
            success
              ? { success: true }
              : { success: false, error: failureReason || "Impressão cancelada" }
          );
        }
      );
    });
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao imprimir",
    };
  } finally {
    if (tmpPath) await unlink(tmpPath).catch(() => undefined);
    if (!printWin.isDestroyed()) printWin.close();
  }
}

async function saveHtmlAsPdf(options: SavePdfOptions): Promise<{ success: boolean; error?: string }> {
  const defaultName = `${sanitizeFilename(options.defaultName ?? "estudo")}.pdf`;

  // Sem parent: evita travamento com janela frameless no Windows
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Salvar estudo como PDF",
    defaultPath: path.join(app.getPath("documents"), defaultName),
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });

  if (canceled || !filePath) {
    return { success: false, error: "Impressão cancelada" };
  }

  const printWin = createPrintWindow();

  try {
    const pdfBuffer = await generatePdfBuffer(printWin, options.html);
    await writeFile(filePath, pdfBuffer);

    const openError = await shell.openPath(filePath);
    if (openError) {
      console.warn("[print] PDF salvo, mas falhou ao abrir:", openError);
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao salvar PDF",
    };
  } finally {
    if (!printWin.isDestroyed()) printWin.close();
  }
}

async function listPrinters(): Promise<PrinterInfoDto[]> {
  const win = getPrinterHostWindow();
  if (!win) return [];

  const printers = await win.webContents.getPrintersAsync();
  return printers.map((p) => ({
    name: p.name,
    displayName: p.displayName || p.name,
    description: p.description ?? "",
    isDefault: Boolean(p.isDefault),
    status: p.status ?? 0,
  }));
}

export function registerPrintHandlers() {
  ipcMain.handle("print:listPrinters", () => listPrinters());
  ipcMain.handle("print:html", (_event, options: PrintHtmlOptions) =>
    withoutStudyWindowFocus(() => printHtml(options))
  );
  ipcMain.handle("print:savePdf", (_event, options: SavePdfOptions) =>
    withoutStudyWindowFocus(() => saveHtmlAsPdf(options))
  );
}
