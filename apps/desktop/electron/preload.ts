import { contextBridge, ipcRenderer } from "electron";



export interface PrinterInfo {

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



export interface StudyStatePayload {

  open: boolean;

}



export interface LibraryStatePayload {

  open: boolean;

  bookId?: string;

}



export interface LibraryOpenPayload {

  bookId: string;

  chapterId?: string;

  title?: string;

}



type Unsubscribe = () => void;



export interface MrbApi {

  getVersion: () => Promise<string>;

  getApiUrl: () => Promise<string>;

  storeApiKey: (provider: string, key: string) => Promise<{ success: boolean; error?: string }>;

  getApiKeyStatus: (provider: string) => Promise<{ configured: boolean }>;

  listApiKeyStatus: () => Promise<Array<{ provider: string; configured: boolean }>>;

  getApiKey: (provider: string) => Promise<{ configured: boolean; key: string | null }>;

  listPrinters: () => Promise<PrinterInfo[]>;

  printHtml: (options: PrintHtmlOptions) => Promise<{ success: boolean; error?: string }>;

  savePdf: (options: SavePdfOptions) => Promise<{ success: boolean; error?: string }>;

  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;

  windowMinimize: () => Promise<void>;

  windowMaximize: () => Promise<void>;

  windowClose: () => Promise<void>;

  windowIsMaximized: () => Promise<boolean>;

  studyOpen: () => Promise<{ open: boolean }>;

  studyClose: () => Promise<{ open: boolean }>;

  studyToggle: () => Promise<{ open: boolean }>;

  studyIsOpen: () => Promise<{ open: boolean }>;

  studySendVerse: (ctx: unknown) => Promise<{ success: boolean }>;

  onStudyState: (callback: (state: StudyStatePayload) => void) => Unsubscribe;

  onStudyVerse: (callback: (ctx: unknown) => void) => Unsubscribe;

  libraryOpen: (payload: LibraryOpenPayload) => Promise<{ open: boolean; bookId?: string }>;

  libraryClose: () => Promise<{ open: boolean }>;

  libraryIsOpen: () => Promise<{ open: boolean }>;

  onLibraryState: (callback: (state: LibraryStatePayload) => void) => Unsubscribe;

  onLibraryNavigate: (callback: (payload: { chapterId: string }) => void) => Unsubscribe;

  isElectron: boolean;

  isFrameless: boolean;

  platform: string;

}



const mrbApi: MrbApi = {

  getVersion: () => ipcRenderer.invoke("app:getVersion"),

  getApiUrl: () => ipcRenderer.invoke("app:getApiUrl"),

  storeApiKey: (provider, key) => ipcRenderer.invoke("security:storeApiKey", { provider, key }),

  getApiKeyStatus: (provider) => ipcRenderer.invoke("security:getApiKeyStatus", provider),

  listApiKeyStatus: () => ipcRenderer.invoke("security:listApiKeyStatus"),

  getApiKey: (provider) => ipcRenderer.invoke("security:getApiKey", provider),

  listPrinters: () => ipcRenderer.invoke("print:listPrinters"),

  printHtml: (options) => ipcRenderer.invoke("print:html", options),

  savePdf: (options) => ipcRenderer.invoke("print:savePdf", options),

  openExternal: (url) => ipcRenderer.invoke("app:openExternal", url),

  windowMinimize: () => ipcRenderer.invoke("window:minimize"),

  windowMaximize: () => ipcRenderer.invoke("window:maximize"),

  windowClose: () => ipcRenderer.invoke("window:close"),

  windowIsMaximized: () => ipcRenderer.invoke("window:isMaximized"),

  studyOpen: () => ipcRenderer.invoke("study:open"),

  studyClose: () => ipcRenderer.invoke("study:close"),

  studyToggle: () => ipcRenderer.invoke("study:toggle"),

  studyIsOpen: () => ipcRenderer.invoke("study:isOpen"),

  studySendVerse: (ctx) => ipcRenderer.invoke("study:sendVerse", ctx),

  onStudyState: (callback) => {

    const handler = (_event: Electron.IpcRendererEvent, state: StudyStatePayload) => callback(state);

    ipcRenderer.on("study:state", handler);

    return () => ipcRenderer.removeListener("study:state", handler);

  },

  onStudyVerse: (callback) => {

    const handler = (_event: Electron.IpcRendererEvent, ctx: unknown) => callback(ctx);

    ipcRenderer.on("study:verse", handler);

    return () => ipcRenderer.removeListener("study:verse", handler);

  },

  libraryOpen: (payload) => ipcRenderer.invoke("library:open", payload),

  libraryClose: () => ipcRenderer.invoke("library:close"),

  libraryIsOpen: () => ipcRenderer.invoke("library:isOpen"),

  onLibraryState: (callback) => {

    const handler = (_event: Electron.IpcRendererEvent, state: LibraryStatePayload) => callback(state);

    ipcRenderer.on("library:state", handler);

    return () => ipcRenderer.removeListener("library:state", handler);

  },

  onLibraryNavigate: (callback) => {

    const handler = (_event: Electron.IpcRendererEvent, payload: { chapterId: string }) => callback(payload);

    ipcRenderer.on("library:navigate", handler);

    return () => ipcRenderer.removeListener("library:navigate", handler);

  },

  isElectron: true,

  isFrameless: true,

  platform: process.platform,

};



contextBridge.exposeInMainWorld("mrb", mrbApi);



declare global {

  interface Window {

    mrb: MrbApi;

  }

}

