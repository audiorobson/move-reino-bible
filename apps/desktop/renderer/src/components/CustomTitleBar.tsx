import { useCallback, useEffect, useState } from "react";
import { Minus, Square, X, Copy } from "lucide-react";

const TITLE = "Move Reino Bible";

export function CustomTitleBar() {
  const isElectron = Boolean(window.mrb?.isElectron);
  const [isMaximized, setIsMaximized] = useState(false);

  const refreshMaximized = useCallback(async () => {
    if (!window.mrb?.windowIsMaximized) return;
    const maximized = await window.mrb.windowIsMaximized();
    setIsMaximized(maximized);
  }, []);

  useEffect(() => {
    if (!isElectron) return;
    void refreshMaximized();
    const onResize = () => void refreshMaximized();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isElectron, refreshMaximized]);

  const handleMinimize = () => void window.mrb?.windowMinimize();
  const handleMaximize = async () => {
    await window.mrb?.windowMaximize();
    await refreshMaximized();
  };
  const handleClose = () => void window.mrb?.windowClose();

  const handleTitleDoubleClick = () => {
    if (isElectron) void handleMaximize();
  };

  if (!isElectron) return null;

  return (
    <header
      className="custom-titlebar"
      aria-label="Barra de título"
      onDoubleClick={handleTitleDoubleClick}
      title={TITLE}
    >
      <div className="custom-titlebar__brand">
        <span className="custom-titlebar__title">{TITLE}</span>
      </div>

      <div className="custom-titlebar__controls">
        <button
          type="button"
          className="custom-titlebar__btn"
          onClick={handleMinimize}
          aria-label="Minimizar"
          title="Minimizar"
        >
          <Minus size={14} strokeWidth={2} />
        </button>
        <button
          type="button"
          className="custom-titlebar__btn"
          onClick={() => void handleMaximize()}
          aria-label={isMaximized ? "Restaurar" : "Maximizar"}
          title={isMaximized ? "Restaurar" : "Maximizar"}
        >
          {isMaximized ? <Copy size={12} strokeWidth={2} /> : <Square size={12} strokeWidth={2} />}
        </button>
        <button
          type="button"
          className="custom-titlebar__btn custom-titlebar__btn--close"
          onClick={handleClose}
          aria-label="Fechar"
          title="Fechar"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
