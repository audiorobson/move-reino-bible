import type { LucideIcon } from "lucide-react";
import {
  BookOpen, Search, Columns2, Languages, Hash, FileText,
  GitBranch, Database, Sparkles, Library, Settings, LayoutDashboard,
} from "lucide-react";
import type { AppModule } from "@mrb/shared-types";

export const NAV_ITEMS: Array<{ id: AppModule; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Início", icon: LayoutDashboard },
  { id: "bible", label: "Bíblia", icon: BookOpen },
  { id: "parallel", label: "Comparar", icon: Columns2 },
  { id: "search", label: "Buscar", icon: Search },
  { id: "originals", label: "Originais", icon: Languages },
  { id: "strong", label: "Strong", icon: Hash },
  { id: "studies", label: "Estudos", icon: FileText },
  { id: "chains", label: "Cadeias", icon: GitBranch },
  { id: "theology-rag", label: "Teologia RAG", icon: Database },
  { id: "ai", label: "IA", icon: Sparkles },
  { id: "library", label: "Biblioteca", icon: Library },
  { id: "settings", label: "Configurações", icon: Settings },
];
