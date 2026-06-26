import { useEffect } from "react";
import { StudyPanelShell } from "./StudyPanelShell";
import { StudyPreviewWindow } from "./StudyPreviewWindow";
import { useAppStore } from "../../store/appStore";
import type { VerseContext } from "../../lib/verse-context";

export function StudyChildApp() {
  const { setStudyModeOpen, sendVerseToStudy } = useAppStore();

  useEffect(() => {
    setStudyModeOpen(true);
  }, [setStudyModeOpen]);

  useEffect(() => {
    if (!window.mrb?.onStudyVerse) return;
    return window.mrb.onStudyVerse((ctx) => {
      sendVerseToStudy(ctx as VerseContext);
    });
  }, [sendVerseToStudy]);

  const handleClose = () => {
    void window.mrb?.studyClose?.();
  };

  return (
    <div className="study-child-app">
      <StudyPanelShell onClose={handleClose} showDropZone={false} />
      <StudyPreviewWindow />
    </div>
  );
}
