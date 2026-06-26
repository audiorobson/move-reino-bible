import { app, BrowserWindow, shell, Menu } from "electron";
import path from "path";
import { registerIpcHandlers } from "./ipc/handlers";
import { setMainWindow, getStudyWindow, getLibraryWindow } from "./windows";
import { getDevServerUrl } from "./dev-server-url";

const isDev = !app.isPackaged;

function createWindow() {
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Move Reino Bible",
    icon: path.join(__dirname, "../electron/icon.png"),
    backgroundColor: "#080D16",
    frame: false,
    thickFrame: false,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  setMainWindow(win);

  win.removeMenu();
  win.setMenuBarVisibility(false);
  win.setMenu(null);

  win.once("ready-to-show", () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://") || url.startsWith("spotify:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  win.webContents.on("did-finish-load", () => {
    if (!win.isDestroyed()) setMainWindow(win);
  });

  win.on("closed", () => {
    const study = getStudyWindow();
    if (study && !study.isDestroyed()) {
      study.close();
    }
    const library = getLibraryWindow();
    if (library && !library.isDestroyed()) {
      library.close();
    }
    setMainWindow(null);
  });

  if (isDev) {
    win.loadURL(getDevServerUrl());
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("com.movereino.bible");
  }

  Menu.setApplicationMenu(null);
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
