import { Button } from "@mrb/ui-kit";
import { useAppStore } from "../../store/appStore";

interface StudyPendingQueueProps {
  onFlush: () => void;
  busy?: boolean;
}

export function StudyPendingQueue({ onFlush, busy }: StudyPendingQueueProps) {
  const { studyVerses, removeStudyVerse } = useAppStore();

  if (studyVerses.length === 0) return null;

  return (
    <div className="study-float-queue">
      <p className="study-float-queue__label">
        {studyVerses.length} versículo(s) na fila
      </p>
      <ul className="study-float-queue__list">
        {studyVerses.map((v, i) => (
          <li key={`${v.reference}-${v.version}-${i}`}>
            <span>{v.reference}</span>
            <button type="button" onClick={() => removeStudyVerse(i)} title="Remover da fila">
              ×
            </button>
          </li>
        ))}
      </ul>
      <Button variant="gold" onClick={onFlush} disabled={busy}>
        Enviar todos ao estudo
      </Button>
    </div>
  );
}
