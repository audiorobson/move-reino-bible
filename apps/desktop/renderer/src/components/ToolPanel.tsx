import { useState } from "react";
import type { ComponentType } from "react";
import { PanelRightClose } from "lucide-react";
import type { AppModule } from "@mrb/shared-types";
import { Button, Badge } from "@mrb/ui-kit";
import { useAppStore } from "../store/appStore";
import { PANEL_LABELS } from "../lib/panel-modules";
import { VerseSelectionBar } from "./VerseSelectionBar";
import { Dashboard } from "../modules/Dashboard";
import { ParallelBible } from "../modules/ParallelBible";
import { SearchLab } from "../modules/SearchLab";
import { OriginalLanguages } from "../modules/OriginalLanguages";
import { StrongConcordance } from "../modules/StrongConcordance";
import { StudyBuilder } from "../modules/StudyBuilder";
import { ThematicChains } from "../modules/ThematicChains";
import { TheologyRag } from "../modules/TheologyRag";
import { AiAssistant } from "../modules/AiAssistant";
import { Library } from "../modules/Library";
import { Settings } from "../modules/Settings";
import { PanelLayoutContext } from "../lib/panel-context";

const PANEL_COMPONENTS: Partial<Record<AppModule, ComponentType>> = {
  dashboard: Dashboard,
  parallel: ParallelBible,
  search: SearchLab,
  originals: OriginalLanguages,
  strong: StrongConcordance,
  studies: StudyBuilder,
  chains: ThematicChains,
  "theology-rag": TheologyRag,
  ai: AiAssistant,
  library: Library,
  settings: Settings,
};

export function ToolPanel() {
  const { activeModule, setToolPanelOpen, selectedVerseContext } = useAppStore();

  const title = PANEL_LABELS[activeModule] ?? "Painel de estudo";
  const PanelComponent = PANEL_COMPONENTS[activeModule];

  return (
    <aside className="tool-panel">
      <header className="tool-panel__header">
        <div>
          <Badge variant="gold">Painel</Badge>
          <h3 className="tool-panel__title">{title}</h3>
          {selectedVerseContext && (
            <p className="tool-panel__verse-ref">
              Versículo ativo: {selectedVerseContext.reference}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={() => setToolPanelOpen(false)}
          title="Recolher painel"
          aria-label="Recolher painel"
        >
          <PanelRightClose size={18} />
        </Button>
      </header>

      {selectedVerseContext && <VerseSelectionBar compact />}

      <div
        className={`tool-panel__body ${activeModule === "ai" ? "tool-panel__body--chat" : "mrb-scroll"} tool-panel__body--${activeModule}`}
      >
        <div className="tool-panel__content">
          <PanelLayoutContext.Provider value={{ isSidePanel: true }}>
            {PanelComponent ? <PanelComponent /> : null}
          </PanelLayoutContext.Provider>
        </div>
      </div>
    </aside>
  );
}
