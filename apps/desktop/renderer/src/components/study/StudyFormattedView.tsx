import type { StudySessionRecord } from "../../lib/api";
import { getStudyBlockDef } from "../../lib/study-block-themes";
import { blockTypeLabel } from "../../lib/study-utils";

interface StudyFormattedViewProps {
  study: StudySessionRecord;
  className?: string;
  showHeader?: boolean;
}

export function StudyFormattedView({ study, className, showHeader = true }: StudyFormattedViewProps) {
  const sorted = [...study.blocks].sort((a, b) => a.order - b.order);

  return (
    <article className={`study-formatted ${className ?? ""}`}>
      {showHeader && (
        <header className="study-formatted__header">
          <h2 className="study-formatted__title">{study.title}</h2>
          {study.passageRange && (
            <p className="study-formatted__meta">
              <span className="study-formatted__meta-label">Passagem</span> {study.passageRange}
            </p>
          )}
          {study.description && (
            <p className="study-formatted__meta">{study.description}</p>
          )}
        </header>
      )}

      <div className="study-formatted__body">
        {sorted.map((block) => {
          const def = getStudyBlockDef(block.type);
          return (
            <section
              key={block.id}
              className={`study-formatted__block study-formatted__block--${def.cssClass}`}
              style={
                {
                  "--study-accent": def.accent,
                  "--study-bg": def.bg,
                  "--study-border": def.border,
                } as React.CSSProperties
              }
            >
              <div className="study-formatted__block-label">{blockTypeLabel(block.type)}</div>

              {block.type === "bible_text" && (
                <div className="study-formatted__verse">
                  <div className="study-formatted__verse-ref">
                    {String(block.content.reference ?? "")}
                    {block.content.version ? (
                      <span className="study-formatted__verse-ver"> ({String(block.content.version)})</span>
                    ) : null}
                  </div>
                  <blockquote>"{String(block.content.text ?? "")}"</blockquote>
                </div>
              )}

              {block.type === "theological_citation" && (
                <div className="study-formatted__citation">
                  <strong>{String(block.content.title ?? "")}</strong>
                  <p>{String(block.content.excerpt ?? "")}</p>
                </div>
              )}

              {block.type !== "bible_text" && block.type !== "theological_citation" && (
                <div className="study-formatted__text">
                  {String(block.content.text ?? "").trim() || (
                    <em className="study-formatted__empty">(sem conteúdo)</em>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <footer className="study-formatted__footer">
        Move Reino Bible — {new Date().toLocaleString("pt-BR")}
      </footer>
    </article>
  );
}
