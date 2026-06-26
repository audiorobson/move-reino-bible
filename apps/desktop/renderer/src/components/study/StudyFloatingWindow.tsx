import { useCallback, useEffect, useRef } from "react";

import { createPortal } from "react-dom";

import { FileText, Minus, X, GripHorizontal } from "lucide-react";

import { Badge } from "@mrb/ui-kit";

import { useAppStore } from "../../store/appStore";
import { useStudySession } from "../../hooks/useStudySession";

import { StudyPanelShell } from "./StudyPanelShell";

import { isElectronStudyWindow } from "../../lib/study-electron";



const MIN_W = 320;

const MIN_H = 280;



function clamp(value: number, min: number, max: number) {

  return Math.max(min, Math.min(value, max));

}



export function StudyFloatingWindow() {

  if (isElectronStudyWindow()) return null;



  const {

    studyModeOpen,

    closeStudyMode,

    studyFloating,

    setStudyFloating,

    studyDraftDirty,

  } = useAppStore();

  const { activeStudy } = useStudySession();



  const shellRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);



  const positionStyle = useCallback(() => {

    const { x, y, width, height } = studyFloating;

    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;

    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    const defaultX = vw - width - 24;

    const defaultY = vh - height - 24;

    const left = clamp(x >= 0 ? x : defaultX, 8, Math.max(8, vw - width - 8));

    const top = clamp(y >= 0 ? y : defaultY, 8, Math.max(8, vh - (studyFloating.minimized ? 48 : height) - 8));

    return {

      left,

      top,

      width,

      height: studyFloating.minimized ? "auto" : height,

    };

  }, [studyFloating]);



  const onDragStart = (e: React.MouseEvent) => {

    if ((e.target as HTMLElement).closest("button, select, input, textarea")) return;

    const rect = shellRef.current?.getBoundingClientRect();

    if (!rect) return;

    const left = studyFloating.x >= 0 ? studyFloating.x : rect.left;

    const top = studyFloating.y >= 0 ? studyFloating.y : rect.top;

    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: left, origY: top };

    e.preventDefault();

  };



  useEffect(() => {

    const onMove = (e: MouseEvent) => {

      if (dragRef.current) {

        const dx = e.clientX - dragRef.current.startX;

        const dy = e.clientY - dragRef.current.startY;

        const vw = window.innerWidth;

        const vh = window.innerHeight;

        setStudyFloating({

          x: clamp(dragRef.current.origX + dx, 8, vw - studyFloating.width - 8),

          y: clamp(dragRef.current.origY + dy, 8, vh - studyFloating.height - 8),

        });

      }

      if (resizeRef.current) {

        const dx = e.clientX - resizeRef.current.startX;

        const dy = e.clientY - resizeRef.current.startY;

        setStudyFloating({

          width: Math.max(MIN_W, resizeRef.current.origW + dx),

          height: Math.max(MIN_H, resizeRef.current.origH + dy),

        });

      }

    };

    const onUp = () => {

      dragRef.current = null;

      resizeRef.current = null;

    };

    window.addEventListener("mousemove", onMove);

    window.addEventListener("mouseup", onUp);

    return () => {

      window.removeEventListener("mousemove", onMove);

      window.removeEventListener("mouseup", onUp);

    };

  }, [setStudyFloating, studyFloating.width, studyFloating.height]);



  const onResizeStart = (e: React.MouseEvent) => {

    e.stopPropagation();

    resizeRef.current = {

      startX: e.clientX,

      startY: e.clientY,

      origW: studyFloating.width,

      origH: studyFloating.height,

    };

  };



  const handleClose = () => {

    if (studyDraftDirty && !confirm("Há alterações não salvas. Fechar mesmo assim?")) return;

    closeStudyMode();

  };



  if (!studyModeOpen) return null;



  if (studyFloating.minimized) {

    return createPortal(

      <button

        type="button"

        className="study-float-minimized"

        onClick={() => setStudyFloating({ minimized: false })}

        title="Expandir Modo de Estudo"

      >

        <FileText size={16} />

        Estudo

        {activeStudy && <Badge variant="gold">{activeStudy.blocks.length}</Badge>}

      </button>,

      document.body

    );

  }



  return createPortal(

    <div

      ref={shellRef}

      className="study-float-window"

      style={positionStyle()}

      onClick={(e) => e.stopPropagation()}

    >

      <header className="study-float-window__header" onMouseDown={onDragStart}>

        <GripHorizontal size={16} className="study-float-window__grip" />

        <span className="study-float-window__drag-label">Arrastar</span>

        <div className="study-float-window__win-actions">

          <button type="button" title="Minimizar" onClick={() => setStudyFloating({ minimized: true })}>

            <Minus size={16} />

          </button>

          <button type="button" title="Fechar" onClick={handleClose}>

            <X size={16} />

          </button>

        </div>

      </header>



      <StudyPanelShell onClose={handleClose} />



      <div className="study-float-window__resize" onMouseDown={onResizeStart} title="Redimensionar" />

    </div>,

    document.body

  );

}

