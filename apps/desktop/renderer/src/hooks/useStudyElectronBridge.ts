import { useEffect } from "react";
import { useAppStore } from "../store/appStore";

export function useStudyElectronBridge() {
  const { setStudyModeOpen } = useAppStore();

  useEffect(() => {
    if (!window.mrb?.onStudyState) return;

    return window.mrb.onStudyState((state) => {
      setStudyModeOpen(state.open);
    });
  }, [setStudyModeOpen]);

  useEffect(() => {
    if (!window.mrb?.studyIsOpen) return;
    void window.mrb.studyIsOpen().then((res) => {
      setStudyModeOpen(res.open);
    });
  }, [setStudyModeOpen]);
}
