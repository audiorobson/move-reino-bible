import type { MouseEvent, ReactNode } from "react";
import { useCallback, useRef } from "react";

interface ColumnResizerProps {
  onResize: (deltaX: number) => void;
  onResizeEnd?: () => void;
  side?: "left" | "right";
}

export function ColumnResizer({ onResize, onResizeEnd, side = "left" }: ColumnResizerProps) {
  const startX = useRef(0);
  const dragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      startX.current = e.clientX;
      dragging.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const handleMove = (ev: globalThis.MouseEvent) => {
        const delta = ev.clientX - startX.current;
        startX.current = ev.clientX;
        onResize(side === "left" ? delta : -delta);
      };

      const handleUp = () => {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
        onResizeEnd?.();
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    },
    [onResize, onResizeEnd, side]
  );

  return (
    <div
      className="column-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionar coluna"
      onMouseDown={handleMouseDown}
    />
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface ResizableWorkspaceProps {
  sidebar: ReactNode;
  main: ReactNode;
  toolPanel?: ReactNode;
  showSidebar?: boolean;
  showToolPanel?: boolean;
  sidebarCollapsed?: boolean;
  sidebarWidth: number;
  toolPanelWidth: number;
  onSidebarWidthChange: (w: number) => void;
  onToolPanelWidthChange: (w: number) => void;
}

const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 380;
const SIDEBAR_COLLAPSED = 64;
const TOOL_MIN = 280;
const TOOL_MAX = 640;
const BIBLE_MIN = 320;

export function ResizableWorkspace({
  sidebar,
  main,
  toolPanel,
  showSidebar = true,
  showToolPanel = true,
  sidebarCollapsed = false,
  sidebarWidth,
  toolPanelWidth,
  onSidebarWidthChange,
  onToolPanelWidthChange,
}: ResizableWorkspaceProps) {
  const effectiveSidebar = sidebarCollapsed ? SIDEBAR_COLLAPSED : sidebarWidth;

  return (
    <div className="workspace">
      {showSidebar && (
        <>
          <section
            className="workspace__column workspace__column--sidebar"
            style={{ width: effectiveSidebar, flexShrink: 0 }}
          >
            {sidebar}
          </section>
          {!sidebarCollapsed && (
            <ColumnResizer
              onResize={(d) => onSidebarWidthChange(clamp(sidebarWidth + d, SIDEBAR_MIN, SIDEBAR_MAX))}
            />
          )}
        </>
      )}

      <section
        className="workspace__column workspace__column--bible mrb-scroll"
        style={{ minWidth: BIBLE_MIN }}
      >
        <div className="workspace__column-inner workspace__column-inner--bible">{main}</div>
      </section>

      {showToolPanel && toolPanel && (
        <>
          <ColumnResizer
            side="right"
            onResize={(d) => onToolPanelWidthChange(clamp(toolPanelWidth + d, TOOL_MIN, TOOL_MAX))}
          />
          <section
            className="workspace__column workspace__column--tool"
            style={{ width: toolPanelWidth, flexShrink: 0 }}
          >
            {toolPanel}
          </section>
        </>
      )}
    </div>
  );
}
