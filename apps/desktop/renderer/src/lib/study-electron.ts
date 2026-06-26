export function isElectronStudyWindow() {
  return Boolean(window.mrb?.studyToggle);
}

export async function electronToggleStudy() {
  if (!window.mrb?.studyToggle) return null;
  return window.mrb.studyToggle();
}

export async function electronOpenStudy() {
  if (!window.mrb?.studyOpen) return null;
  return window.mrb.studyOpen();
}

export async function electronCloseStudy() {
  if (!window.mrb?.studyClose) return null;
  return window.mrb.studyClose();
}

export async function electronSendVerseToStudy(ctx: unknown) {
  if (!window.mrb?.studySendVerse) return null;
  return window.mrb.studySendVerse(ctx);
}

export function isStudyWindowRoute() {
  return new URLSearchParams(window.location.search).get("window") === "study";
}
