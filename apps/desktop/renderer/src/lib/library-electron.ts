export interface LibraryOpenPayload {
  bookId: string;
  chapterId?: string;
  title?: string;
}

export function isElectronLibraryWindow() {
  return Boolean(window.mrb?.libraryOpen);
}

export function isLibraryWindowRoute() {
  return new URLSearchParams(window.location.search).get("window") === "library";
}

export function getLibraryRouteParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    bookId: params.get("book") ?? "",
    chapterId: params.get("chapter") ?? undefined,
  };
}

export async function electronOpenLibrary(payload: LibraryOpenPayload) {
  if (!window.mrb?.libraryOpen) return null;
  return window.mrb.libraryOpen(payload);
}

export async function electronCloseLibrary() {
  if (!window.mrb?.libraryClose) return null;
  return window.mrb.libraryClose();
}
