import type { BrowserWindow } from "electron";

let mainWindow: BrowserWindow | null = null;
let studyWindow: BrowserWindow | null = null;
let libraryWindow: BrowserWindow | null = null;

export function setMainWindow(win: BrowserWindow | null) {
  mainWindow = win;
}

export function getMainWindow() {
  return mainWindow;
}

export function setStudyWindow(win: BrowserWindow | null) {
  studyWindow = win;
}

export function getStudyWindow() {
  return studyWindow;
}

export function setLibraryWindow(win: BrowserWindow | null) {
  libraryWindow = win;
}

export function getLibraryWindow() {
  return libraryWindow;
}
