import { useState } from "react";
import type { OriginalTokenDto } from "@mrb/shared-types";
import {
  detectOriginalScript,
  originalScriptClass,
  originalDatasetLabel,
  tokenGlossEn,
  tokenGlossPt,
  type OriginalScript,
} from "../lib/original-language";
import { morphologyTokenClass, morphologyLabelPt } from "../lib/morphology-colors";
import { useAppStore } from "../store/appStore";
import { InterlinearTokenDetail } from "./InterlinearTokenDetail";

interface VerseInterlinearStripProps {
  tokens: OriginalTokenDto[];
  compact?: boolean;
  script?: OriginalScript | null;
  selectedTokenId?: string | null;
  onSelectToken?: (token: OriginalTokenDto) => void;
}

function GlossTokenRow({
  label,
  tokens,
  activeId,
  kind,
  onSelect,
}: {
  label: string;
  tokens: OriginalTokenDto[];
  activeId: string | null;
  kind: "en" | "pt";
  onSelect: (token: OriginalTokenDto) => void;
}) {
  const getGloss = kind === "en" ? tokenGlossEn : tokenGlossPt;
  const visible = tokens.filter((t) => getGloss(t));
  if (!visible.length) return null;

  return (
    <div className="verse-interlinear__row">
      <span
        className={`verse-interlinear__label verse-interlinear__label--static ${kind === "pt" ? "verse-interlinear__label--pt" : ""}`}
      >
        {label}
      </span>
      <div className="verse-interlinear__gloss-tokens">
        {tokens.map((token) => {
          const gloss = getGloss(token);
          if (!gloss) return null;
          return (
            <button
              key={`${kind}-${token.id}`}
              type="button"
              className={`interlinear-gloss-token ${activeId === token.id ? "interlinear-gloss-token--active" : ""}`}
              onClick={() => onSelect(token)}
              title={`${label}: ${gloss}`}
            >
              {gloss}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function VerseInterlinearStrip({
  tokens,
  compact,
  script,
  selectedTokenId,
  onSelectToken,
}: VerseInterlinearStripProps) {
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const { showInterlinearEn, showInterlinearPt, toggleInterlinearEn, toggleInterlinearPt } =
    useAppStore();

  if (!tokens.length) return null;

  const resolved = script ?? detectOriginalScript(tokens);
  const activeId = selectedTokenId ?? localSelectedId;
  const activeToken = tokens.find((t) => t.id === activeId) ?? null;
  const hasEnglish = tokens.some((t) => tokenGlossEn(t));
  const hasPortuguese = tokens.some((t) => tokenGlossPt(t));

  const handleSelect = (token: OriginalTokenDto) => {
    setLocalSelectedId(token.id);
    onSelectToken?.(token);
  };

  return (
    <div
      className={`verse-interlinear verse-interlinear--${resolved} ${compact ? "verse-interlinear--compact" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="verse-interlinear__tokens" dir={resolved === "hebrew" ? "rtl" : "ltr"}>
        {tokens.map((token) => (
          <button
            key={token.id}
            type="button"
            className={`interlinear-token ${morphologyTokenClass(token.morphologyCode)} ${activeId === token.id ? "interlinear-token--active" : ""}`}
            onClick={() => handleSelect(token)}
            title={
              token.morphologyCode
                ? `${token.morphologyCode} · ${morphologyLabelPt(token.morphologyCode)}`
                : "Clique para ver transliteração, gloss e Strong"
            }
          >
            <span className={`interlinear-token__surface ${originalScriptClass(resolved)}`}>
              {token.surfaceForm}
            </span>
          </button>
        ))}
      </div>

      {(hasEnglish || hasPortuguese) && (
        <div className="verse-interlinear__lang-toggles">
          {hasEnglish && (
            <button
              type="button"
              className={`verse-interlinear__label verse-interlinear__label--btn ${showInterlinearEn ? "verse-interlinear__label--active" : ""}`}
              onClick={toggleInterlinearEn}
              title={showInterlinearEn ? "Ocultar inglês" : "Mostrar inglês"}
            >
              EN
            </button>
          )}
          {hasPortuguese && (
            <button
              type="button"
              className={`verse-interlinear__label verse-interlinear__label--btn verse-interlinear__label--pt ${showInterlinearPt ? "verse-interlinear__label--active" : ""}`}
              onClick={toggleInterlinearPt}
              title={showInterlinearPt ? "Ocultar português" : "Mostrar português"}
            >
              PT
            </button>
          )}
        </div>
      )}

      {hasEnglish && showInterlinearEn && (
        <GlossTokenRow
          label="EN"
          tokens={tokens}
          activeId={activeId}
          kind="en"
          onSelect={handleSelect}
        />
      )}

      {hasPortuguese && showInterlinearPt && (
        <GlossTokenRow
          label="PT"
          tokens={tokens}
          activeId={activeId}
          kind="pt"
          onSelect={handleSelect}
        />
      )}

      {activeToken ? (
        <div className="verse-interlinear__detail" key={activeToken.id}>
          <InterlinearTokenDetail token={activeToken} script={resolved} compact={compact} showPtGloss />
        </div>
      ) : (
        <p className="verse-interlinear__hint">
          Clique numa palavra (original, EN ou PT) para ver detalhes e Strong
        </p>
      )}

      <p className="verse-interlinear__source">{originalDatasetLabel(resolved)} · STEP</p>
    </div>
  );
}
