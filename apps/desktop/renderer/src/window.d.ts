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
  onStudyState: (callback: (state: StudyStatePayload) => void) => () => void;
  onStudyVerse: (callback: (ctx: unknown) => void) => () => void;
  libraryOpen: (payload: LibraryOpenPayload) => Promise<{ open: boolean; bookId?: string }>;
  libraryClose: () => Promise<{ open: boolean }>;
  libraryIsOpen: () => Promise<{ open: boolean }>;
  onLibraryState: (callback: (state: LibraryStatePayload) => void) => () => void;
  onLibraryNavigate: (callback: (payload: { chapterId: string }) => void) => () => void;
  isElectron: boolean;
  isFrameless: boolean;
  platform: string;
}

declare global {
  interface Window {
    mrb?: MrbApi;
  }
}

export {};
