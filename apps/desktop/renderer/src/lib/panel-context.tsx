import { createContext, useContext } from "react";

export interface PanelLayoutContextValue {
  isSidePanel: boolean;
}

export const PanelLayoutContext = createContext<PanelLayoutContextValue>({
  isSidePanel: false,
});

export function usePanelLayout() {
  return useContext(PanelLayoutContext);
}
