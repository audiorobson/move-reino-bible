import path from "path";
import { app, BrowserWindow, ipcMain, screen } from "electron";
import { getMainWindow, getStudyWindow, setStudyWindow } from "../windows.js";
import { getDevRendererUrl } from "../dev-server-url.js";

const isDev = !app.isPackaged;

const STUDY_WIDTH = 480;
const STUDY_MIN_WIDTH = 360;
const STUDY_MIN_HEIGHT = 400;
const GAP = 8;

let studyOpenPromise: Promise<BrowserWindow | null> | null = null;

function computeStudyBounds(main: BrowserWindow) {
  const mainBounds = main.getBounds();
  const display = screen.getDisplayMatching(mainBounds);
  const work = display.workArea;

  let width = STUDY_WIDTH;
  let height = Math.min(mainBounds.height, work.height);
  let x = mainBounds.x + mainBounds.width + GAP;
  let y = mainBounds.y;

  if (x + width > work.x + work.width) {
    x = mainBounds.x - width - GAP;
  }

  if (x < work.x) {
    x = work.x + GAP;
    width = Math.min(width, work.width - GAP * 2);
  }

  if (y < work.y) y = work.y;
  if (y + height > work.y + work.height) {
    height = work.y + work.height - y;
  }

  return { x, y, width, height };
}

function notifyMain(channel: string, payload?: unknown) {
  const main = getMainWindow();
  if (main && !main.isDestroyed()) {
    main.webContents.send(channel, payload);
  }
}

function notifyStudy(channel: string, payload?: unknown) {
  const study = getStudyWindow();
  if (study && !study.isDestroyed()) {
    study.webContents.send(channel, payload);
  }
}

function isStudyWindowReady(win: BrowserWindow): boolean {
  if (win.isDestroyed()) return false;
  const url = win.webContents.getURL();
  return url.includes("window=study") && !win.webContents.isLoading();
}

async function loadStudyWindow(win: BrowserWindow): Promise<void> {
  if (isDev) {
    const url = getDevRendererUrl("window=study");
    await win.loadURL(url);
    return;
  }
  await win.loadFile(path.join(__dirname, "../dist/index.html"), { query: { window: "study" } });
}

function attachStudyWindow(win: BrowserWindow) {
  setStudyWindow(win);

  win.on("closed", () => {
    setStudyWindow(null);
    notifyMain("study:state", { open: false });
  });

  const main = getMainWindow();
  if (main && !main.isDestroyed()) {
    const syncPosition = () => {
      if (win.isDestroyed() || main.isDestroyed()) return;
      const bounds = computeStudyBounds(main);
      win.setBounds({
        x: bounds.x,
        y: bounds.y,
        width: win.getBounds().width,
        height: bounds.height,
      });
    };
    main.on("move", syncPosition);
    main.on("resize", syncPosition);
    win.on("closed", () => {
      main.removeListener("move", syncPosition);
      main.removeListener("resize", syncPosition);
    });
  }
}

function destroyStudyWindow(win: BrowserWindow) {
  if (!win.isDestroyed()) {
    win.destroy();
  }
  if (getStudyWindow()?.id === win.id) {
    setStudyWindow(null);
  }
}

async function openStudyWindowInternal(): Promise<BrowserWindow | null> {
  const existing = getStudyWindow();
  if (existing && !existing.isDestroyed()) {
    if (isStudyWindowReady(existing)) {
      existing.show();
      existing.focus();
      return existing;
    }
    destroyStudyWindow(existing);
  }

  const main = getMainWindow();
  if (!main || main.isDestroyed()) return null;

  const bounds = computeStudyBounds(main);

  const win = new BrowserWindow({
    modal: false,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    minWidth: STUDY_MIN_WIDTH,
    minHeight: STUDY_MIN_HEIGHT,
    title: "Modo de Estudo — Move Reino Bible",
    backgroundColor: "#080D16",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.removeMenu();
  win.setMenuBarVisibility(false);
  attachStudyWindow(win);

  const ready = new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Tempo esgotado ao abrir janela de estudo")), 20_000);
    win.once("ready-to-show", () => {
      clearTimeout(timeout);
      resolve();
    });
    win.webContents.once("did-fail-load", (_event, code, description, _url, isMainFrame) => {
      if (!isMainFrame) return;
      clearTimeout(timeout);
      reject(new Error(description || `Falha ao carregar estudo (${code})`));
    });
  });

  try {
    await loadStudyWindow(win);
    await ready;
    win.show();
    win.focus();
    return win;
  } catch (err) {
    console.error("[study] open failed:", err);
    destroyStudyWindow(win);
    return null;
  }
}

async function openStudyWindow(): Promise<BrowserWindow | null> {
  if (studyOpenPromise) return studyOpenPromise;

  studyOpenPromise = openStudyWindowInternal().finally(() => {
    studyOpenPromise = null;
  });

  return studyOpenPromise;
}

function closeStudyWindow() {
  const win = getStudyWindow();
  if (win && !win.isDestroyed()) {
    win.close();
  }
}

export function registerStudyHandlers() {
  ipcMain.handle("study:open", async () => {
    const win = await openStudyWindow();
    const open = Boolean(win);
    notifyMain("study:state", { open });
    return { open };
  });

  ipcMain.handle("study:close", () => {
    closeStudyWindow();
    notifyMain("study:state", { open: false });
    return { open: false };
  });

  ipcMain.handle("study:toggle", async () => {
    const existing = getStudyWindow();
    if (existing && !existing.isDestroyed()) {
      closeStudyWindow();
      notifyMain("study:state", { open: false });
      return { open: false };
    }
    const win = await openStudyWindow();
    const open = Boolean(win);
    notifyMain("study:state", { open });
    return { open };
  });

  ipcMain.handle("study:isOpen", () => {
    const win = getStudyWindow();
    return { open: Boolean(win && !win.isDestroyed() && isStudyWindowReady(win)) };
  });

  ipcMain.handle("study:sendVerse", async (_event, ctx: unknown) => {
    let win = getStudyWindow();
    if (!win || win.isDestroyed() || !isStudyWindowReady(win)) {
      win = await openStudyWindow();
      notifyMain("study:state", { open: Boolean(win) });
    }
    if (!win) return { success: false };
    notifyStudy("study:verse", ctx);
    win.show();
    win.focus();
    return { success: true };
  });

  ipcMain.handle("study:isChildWindow", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const study = getStudyWindow();
    return { isChild: Boolean(win && study && win.id === study.id) };
  });
}
