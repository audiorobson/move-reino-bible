import path from "path";
import { app, BrowserWindow, ipcMain, screen } from "electron";
import { getLibraryWindow, getMainWindow, getStudyWindow, setLibraryWindow } from "../windows.js";

const isDev = !app.isPackaged;

const LIBRARY_WIDTH = 820;
const LIBRARY_MIN_WIDTH = 520;
const LIBRARY_MIN_HEIGHT = 480;
const GAP = 8;

export interface LibraryOpenPayload {
  bookId: string;
  chapterId?: string;
  title?: string;
}

function computeLibraryBounds(main: BrowserWindow) {
  const mainBounds = main.getBounds();
  const display = screen.getDisplayMatching(mainBounds);
  const work = display.workArea;

  let width = LIBRARY_WIDTH;
  let height = Math.min(mainBounds.height, work.height);
  let x = mainBounds.x - width - GAP;
  let y = mainBounds.y;

  const study = getStudyWindow();
  if (study && !study.isDestroyed()) {
    const studyBounds = study.getBounds();
    if (x < work.x) {
      x = studyBounds.x + studyBounds.width + GAP;
    }
  }

  if (x < work.x) {
    x = mainBounds.x + mainBounds.width + GAP;
  }

  if (x + width > work.x + work.width) {
    width = Math.min(width, work.width - GAP * 2);
    x = work.x + work.width - width - GAP;
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

function notifyLibrary(channel: string, payload?: unknown) {
  const library = getLibraryWindow();
  if (library && !library.isDestroyed()) {
    library.webContents.send(channel, payload);
  }
}

function buildLibraryQuery(payload: LibraryOpenPayload) {
  const query: Record<string, string> = {
    window: "library",
    book: payload.bookId,
  };
  if (payload.chapterId) query.chapter = payload.chapterId;
  return query;
}

function buildLibraryUrl(payload: LibraryOpenPayload) {
  const params = new URLSearchParams(buildLibraryQuery(payload));
  if (isDev) return `http://localhost:5173/?${params.toString()}`;
  return null;
}

async function loadLibraryWindow(win: BrowserWindow, payload: LibraryOpenPayload) {
  const query = buildLibraryQuery(payload);
  if (isDev) {
    const params = new URLSearchParams(query);
    await win.loadURL(`http://localhost:5173/?${params.toString()}`);
    return;
  }
  await win.loadFile(path.join(__dirname, "../dist/index.html"), { query });
}

function attachLibraryWindow(win: BrowserWindow) {
  setLibraryWindow(win);

  win.on("closed", () => {
    setLibraryWindow(null);
    notifyMain("library:state", { open: false });
  });

  const main = getMainWindow();
  if (main && !main.isDestroyed()) {
    const syncPosition = () => {
      if (win.isDestroyed() || main.isDestroyed()) return;
      const bounds = computeLibraryBounds(main);
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

async function openLibraryWindow(payload: LibraryOpenPayload): Promise<BrowserWindow | null> {
  const existing = getLibraryWindow();
  if (existing && !existing.isDestroyed()) {
    const currentUrl = existing.webContents.getURL();
    const targetUrl = buildLibraryUrl(payload);
    const sameBook = currentUrl.includes(`book=${encodeURIComponent(payload.bookId)}`);

    if (!sameBook) {
      await loadLibraryWindow(existing, payload);
    } else if (payload.chapterId) {
      notifyLibrary("library:navigate", { chapterId: payload.chapterId });
    }

    if (payload.title) existing.setTitle(`${payload.title} — Biblioteca`);
    existing.show();
    existing.focus();
    return existing;
  }

  const main = getMainWindow();
  if (!main || main.isDestroyed()) return null;

  const bounds = computeLibraryBounds(main);
  const win = new BrowserWindow({
    parent: main,
    modal: false,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    minWidth: LIBRARY_MIN_WIDTH,
    minHeight: LIBRARY_MIN_HEIGHT,
    title: payload.title
      ? `${payload.title} — Biblioteca`
      : "Biblioteca — Move Reino Bible",
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
  attachLibraryWindow(win);

  win.once("ready-to-show", () => {
    win.show();
    win.focus();
  });

  await loadLibraryWindow(win, payload);
  return win;
}

function closeLibraryWindow() {
  const win = getLibraryWindow();
  if (win && !win.isDestroyed()) {
    win.close();
  }
  setLibraryWindow(null);
}

export function registerLibraryHandlers() {
  ipcMain.handle("library:open", async (_event, payload: LibraryOpenPayload) => {
    if (!payload?.bookId) return { open: false, error: "bookId obrigatório" };
    const win = await openLibraryWindow(payload);
    const open = Boolean(win);
    notifyMain("library:state", { open, bookId: payload.bookId });
    return { open, bookId: payload.bookId };
  });

  ipcMain.handle("library:close", () => {
    closeLibraryWindow();
    notifyMain("library:state", { open: false });
    return { open: false };
  });

  ipcMain.handle("library:isOpen", () => {
    const win = getLibraryWindow();
    return { open: Boolean(win && !win.isDestroyed()) };
  });

  ipcMain.handle("library:isChildWindow", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const library = getLibraryWindow();
    return { isChild: Boolean(win && library && win.id === library.id) };
  });
}
