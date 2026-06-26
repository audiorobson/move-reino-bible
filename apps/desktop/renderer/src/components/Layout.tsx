import { useState } from "react";
import { PanelLeftClose, PanelLeft, BookOpen } from "lucide-react";
import type { AppModule } from "@mrb/shared-types";
import { useAppStore } from "../store/appStore";
import { NAV_ITEMS } from "../lib/navigation";
import { PANEL_LABELS } from "../lib/panel-modules";
import { VERSE_DROP_MODULES, getVerseFromDragEvent } from "../lib/verse-context";
import { SpotifySidebarCard } from "./SpotifySidebarCard";

export function Sidebar() {
  const { activeModule, setActiveModule, dispatchVerseToModule, preferences, setPreferences } = useAppStore();
  const collapsed = preferences.sidebarCollapsed;
  const [dropTarget, setDropTarget] = useState<AppModule | null>(null);

  const handleNavDrop = (module: AppModule, e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
    const ctx = getVerseFromDragEvent(e);
    if (ctx && VERSE_DROP_MODULES.includes(module)) {
      dispatchVerseToModule(module, ctx);
    } else if (ctx) {
      setActiveModule(module);
    }
  };

  return (    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <nav className="sidebar-nav">
        <button
          className="nav-item nav-item--bible-active"
          title="Leitura bíblica (sempre ativa)"
        >
          <BookOpen size={20} strokeWidth={1.75} className="nav-item__icon" />
          {!collapsed && "Bíblia · ativa"}
        </button>
        {NAV_ITEMS.filter((item) => item.id !== "bible").map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          const acceptsVerse = VERSE_DROP_MODULES.includes(item.id);
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "nav-item--active" : ""} ${dropTarget === item.id ? "nav-item--drop-target" : ""}`}
              onClick={() => setActiveModule(item.id)}
              title={collapsed ? (PANEL_LABELS[item.id] ?? item.label) : acceptsVerse ? `${item.label} — solte versículo aqui` : undefined}
              onDragOver={acceptsVerse ? (e) => { e.preventDefault(); setDropTarget(item.id); } : undefined}
              onDragLeave={acceptsVerse ? () => setDropTarget(null) : undefined}
              onDrop={acceptsVerse ? (e) => handleNavDrop(item.id, e) : undefined}
            >              <Icon size={20} strokeWidth={1.75} className="nav-item__icon" />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <SpotifySidebarCard collapsed={collapsed} />
        <div className="sidebar-footer">
          <button
            className="nav-item nav-item--ghost"
            onClick={() => setPreferences({ sidebarCollapsed: !collapsed })}
            title={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            {!collapsed && "Recolher"}
          </button>
        </div>
      </div>
    </aside>
  );
}
