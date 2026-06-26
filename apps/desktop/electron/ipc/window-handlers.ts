import { BrowserWindow, ipcMain } from "electron";

export function registerWindowHandlers() {
  const getWindow = (event: Electron.IpcMainInvokeEvent) =>
    BrowserWindow.fromWebContents(event.sender);

  ipcMain.handle("window:minimize", (event) => {
    getWindow(event)?.minimize();
  });

  ipcMain.handle("window:maximize", (event) => {
    const win = getWindow(event);
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });

  ipcMain.handle("window:close", (event) => {
    getWindow(event)?.close();
  });

  ipcMain.handle("window:isMaximized", (event) => {
    return getWindow(event)?.isMaximized() ?? false;
  });
}
