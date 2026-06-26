import type { OriginalTokenDto } from "@mrb/shared-types";
import {
  originalScriptClass,
  tokenGlossEn,
  tokenGlossPt,
  type OriginalScript,
} from "../lib/original-language";
import { StrongNumberLink } from "./StrongNumberLink";

interface InterlinearTokenDetailProps {
  token: OriginalTokenDto;
  script: OriginalScript;
  compact?: boolean;
  showPtGloss?: boolean;
}

export function InterlinearTokenDetail({
  token,
  script,
  compact,
  showPtGloss = true,
}: InterlinearTokenDetailProps) {
  const glossEn = tokenGlossEn(token);
  const glossPt = tokenGlossPt(token);
  const showPt = showPtGloss && glossPt && glossPt !== glossEn;

  return (
    <div className={`interlinear-token-detail ${compact ? "interlinear-token-detail--compact" : ""}`}>
      <p className="interlinear-token-detail__line">
        <span className={`interlinear-token-detail__surface ${originalScriptClass(script)}`}>
          {token.surfaceForm}
        </span>
        {token.transliteration && (
          <span className="interlinear-token-detail__translit"> ({token.transliteration})</span>
        )}
      </p>

      {(glossEn || glossPt) && (
        <div className="interlinear-token-detail__glosses">
          {glossEn && (
            <p className="interlinear-token-detail__gloss-row">
              <span className="interlinear-token-detail__en-label">EN</span>
              <span className="interlinear-token-detail__gloss-en">{glossEn}</span>
            </p>
          )}
          {showPt && (
            <p className="interlinear-token-detail__gloss-row">
              <span className="interlinear-token-detail__pt-label">PT</span>
              <span className="interlinear-token-detail__gloss-pt">{glossPt}</span>
            </p>
          )}
          {!glossEn && glossPt && (
            <p className="interlinear-token-detail__gloss-row">
              <span className="interlinear-token-detail__pt-label">PT</span>
              <span className="interlinear-token-detail__gloss-pt">{glossPt}</span>
            </p>
          )}
        </div>
      )}

      {!glossEn && !glossPt && token.lemma && (
        <p className="interlinear-token-detail__gloss-row">
          <span className="interlinear-token-detail__gloss-en">{token.lemma}</span>
        </p>
      )}

      {token.strongNumber && (
        <p className="interlinear-token-detail__strong-row">
          <StrongNumberLink number={token.strongNumber} className="interlinear-token-detail__strong" />
        </p>
      )}
    </div>
  );
}
