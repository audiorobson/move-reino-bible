import type { ComponentType } from "react";
import type { AppModule } from "@mrb/shared-types";
import { useAppStore } from "../store/appStore";
import { Dashboard } from "../modules/Dashboard";
import { BibleReader } from "../modules/BibleReader";
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

const MODULES: Record<AppModule, ComponentType> = {
  dashboard: Dashboard,
  bible: BibleReader,
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

export function ModuleRouter() {
  const { activeModule } = useAppStore();
  const Component = MODULES[activeModule];
  return <Component />;
}
