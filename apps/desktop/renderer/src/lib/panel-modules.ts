import type { AppModule } from "@mrb/shared-types";

/** Módulos exibidos no painel secundário (Bíblia permanece sempre no centro). */
export const PANEL_MODULES: AppModule[] = [
  "dashboard",
  "parallel",
  "search",
  "originals",
  "strong",
  "studies",
  "chains",
  "theology-rag",
  "ai",
  "library",
  "settings",
];

export function isPanelModule(module: AppModule): boolean {
  return PANEL_MODULES.includes(module);
}

export const PANEL_LABELS: Partial<Record<AppModule, string>> = {
  dashboard: "Início",
  bible: "Versículo",
  parallel: "Comparar versões",
  search: "Buscar",
  originals: "Originais",
  strong: "Strong",
  studies: "Estudos",
  chains: "Cadeias temáticas",
  "theology-rag": "Teologia RAG",
  ai: "Assistente de Estudo",
  library: "Biblioteca",
  settings: "Configurações",
};
