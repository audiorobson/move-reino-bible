import { useState, type ReactNode } from "react";
import { PanelRightOpen } from "lucide-react";
import { Sidebar } from "./components/Layout";
import { AppHead } from "./components/AppHead";
import { CustomTitleBar } from "./components/CustomTitleBar";
import { ToolPanel } from "./components/ToolPanel";
import { ResizableWorkspace } from "./components/ResizableWorkspace";
import { BibleReader } from "./modules/BibleReader";
import { SplashScreen } from "./components/SplashScreen";
import { StudyFloatingWindow } from "./components/study/StudyFloatingWindow";
import { StudyPreviewWindow } from "./components/study/StudyPreviewWindow";
import { StudyChildApp } from "./components/study/StudyChildApp";
import { LibraryChildApp } from "./components/library/LibraryChildApp";
import { useStudyElectronBridge } from "./hooks/useStudyElectronBridge";
import { isElectronStudyWindow, isStudyWindowRoute } from "./lib/study-electron";
import { isLibraryWindowRoute } from "./lib/library-electron";
import { Button } from "@mrb/ui-kit";
import { useAppStore } from "./store/appStore";
import { useThemeEffect } from "./hooks/useTheme";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { preferences, toolPanelOpen, setToolPanelOpen, setPreferences } = useAppStore();
  const focusMode = preferences.focusMode;
  const collapsed = preferences.sidebarCollapsed;
  const showToolPanel = toolPanelOpen && !focusMode;

  useThemeEffect();
  useStudyElectronBridge();

  if (isStudyWindowRoute()) {
    return <StudyChildApp />;
  }

  if (isLibraryWindowRoute()) {
    return <LibraryChildApp />;
  }

  const shell = (content: ReactNode) => (
    <div className="app-shell">
      <CustomTitleBar />
      <div className="app-shell__body">{content}</div>
    </div>
  );

  if (showSplash) {
    return shell(<SplashScreen onComplete={() => setShowSplash(false)} />);
  }

  if (focusMode) {
    return shell(
      <div className="app-layout">
        <AppHead />
        <section className="workspace workspace--focus mrb-scroll">
          <div className="workspace__column-inner workspace__column-inner--bible">
            <BibleReader />
          </div>
        </section>
        <StudyFloatingWindow />
        {!isElectronStudyWindow() && <StudyPreviewWindow />}
      </div>
    );
  }

  return shell(
    <div className="app-layout">
      <AppHead />
      <div className="app-body-shell">
        <ResizableWorkspace
          showSidebar
          showToolPanel={showToolPanel}
          sidebarCollapsed={collapsed}
          sidebarWidth={preferences.sidebarWidth}
          toolPanelWidth={preferences.toolPanelWidth}
          onSidebarWidthChange={(w) => setPreferences({ sidebarWidth: w })}
          onToolPanelWidthChange={(w) => setPreferences({ toolPanelWidth: w })}
          sidebar={<Sidebar />}
          main={<BibleReader />}
          toolPanel={showToolPanel ? <ToolPanel /> : undefined}
        />
        {!toolPanelOpen && (
          <Button
            className="tool-panel-toggle"
            variant="gold"
            onClick={() => setToolPanelOpen(true)}
            title="Abrir painel de estudo"
          >
            <PanelRightOpen size={18} />
          </Button>
        )}
      </div>
      <StudyFloatingWindow />
      {!isElectronStudyWindow() && <StudyPreviewWindow />}
    </div>
  );
}
