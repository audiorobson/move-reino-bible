import { useEffect } from "react";
import { useAppStore } from "../store/appStore";

export function useThemeEffect() {
  const theme = useAppStore((s) => s.preferences.theme);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
}
