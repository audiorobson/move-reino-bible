import { Search, Focus, Columns2 } from "lucide-react";
import { SearchInput, Button, Badge } from "@mrb/ui-kit";
import { useAppStore } from "../store/appStore";
import { AppLogo } from "./AppLogo";
import { BibleBookSelectorBar } from "./BibleBookSelectorBar";
import { SelectedBookPlaque } from "./SelectedBookPlaque";

export function AppHead() {
  const {
    setActiveModule,
    currentVersion,
    compareMode,
    setCompareMode,
    preferences,
    setPreferences,
    wordSearchQuery,
    setWordSearchQuery,
    submitWordSearch,
  } = useAppStore();

  return (
    <header className="app-head app-head--unified">
      <div className="app-head__unified-row">
        <div className="app-head__brand">
          <AppLogo variant="header" />
        </div>

        <SelectedBookPlaque />

        <div className="app-head__search">
          <div className="topbar-search-wrap">
            <Search size={15} className="topbar-search-icon" strokeWidth={1.75} />
            <SearchInput
              value={wordSearchQuery}
              onChange={setWordSearchQuery}
              placeholder="Buscar palavra (PT/EN), Strong (G3056) ou passagem..."
              onSubmit={() => submitWordSearch()}
            />
          </div>
        </div>

        <BibleBookSelectorBar />

        <div className="app-head__actions">
          <Badge variant="blue">{compareMode ? "Paralelo" : currentVersion}</Badge>
          <Button
            variant={compareMode ? "gold" : "ghost"}
            onClick={() => setCompareMode(!compareMode)}
            title="Comparar versões lado a lado"
          >
            <Columns2 size={17} />
          </Button>
          <Button variant="ghost" onClick={() => setActiveModule("theology-rag")} title="Teologia RAG">
            <Badge variant="rag">RAG</Badge>
          </Button>
          <Button variant="gold" onClick={() => setActiveModule("ai")} title="Assistente IA">
            IA
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPreferences({ focusMode: !preferences.focusMode })}
            title="Modo foco"
          >
            <Focus size={17} />
          </Button>
        </div>
      </div>
    </header>
  );
}
