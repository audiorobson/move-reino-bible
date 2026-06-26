import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Badge, Button, LoadingState, EmptyState } from "@mrb/ui-kit";
import { api } from "../lib/api";
import type { OriginalTokenDto } from "@mrb/shared-types";
import { InterlinearTokenDetail } from "./InterlinearTokenDetail";
import {
  detectOriginalScript,
  originalScriptLabel,
  originalDatasetLabel,
  type OriginalScript,
} from "../lib/original-language";

interface VerseVocabularyPopoverProps {
  bookOsisId: string;
  bookName: string;
  chapter: number;
  verse: number;
  reference: string;
  prefetchedTokens?: OriginalTokenDto[];
  script?: OriginalScript | null;
  onClose: () => void;
  onSelectToken?: (token: OriginalTokenDto) => void;
}

export function VerseVocabularyPopover({
  bookOsisId,
  bookName,
  chapter,
  verse,
  reference,
  prefetchedTokens,
  script,
  onClose,
  onSelectToken,
}: VerseVocabularyPopoverProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["verse-tokens", bookOsisId, chapter, verse],
    queryFn: () => api.getVerseTokens(bookOsisId, chapter, verse),
    enabled: !prefetchedTokens?.length,
  });

  const tokens = prefetchedTokens?.length ? prefetchedTokens : data?.tokens ?? [];
  const loading = !prefetchedTokens?.length && isLoading;
  const resolved = script ?? detectOriginalScript(tokens, bookOsisId);
  const scriptLabel = originalScriptLabel(resolved);
  const dataset = originalDatasetLabel(resolved);

  return (
    <div className="verse-vocab-popover" role="dialog" aria-label={`Palavras originais — ${reference}`}>
      <div className="verse-vocab-popover__header">
        <div>
          <Badge variant="gold">{scriptLabel} · STEP {dataset}</Badge>
          <h4 className="verse-vocab-popover__title">{bookName} {chapter}:{verse}</h4>
          <p className="verse-vocab-popover__subtitle">Clique numa palavra — formato: texto (pronúncia) gloss (Strong)</p>
        </div>
        <Button variant="ghost" onClick={onClose} aria-label="Fechar">
          <X size={16} />
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Carregando tokens..." />
      ) : error && !prefetchedTokens?.length ? (
        <EmptyState
          title="Sem dados originais"
          description="Importe com pnpm import:step --sample-gen1 ou --mat-jhn"
        />
      ) : !tokens.length ? (
        <EmptyState
          title="Versículo sem tokens"
          description="Este livro/capítulo ainda não foi importado do STEPBible-Data."
        />
      ) : (
        <ul className="verse-vocab-popover__list">
          {tokens.map((token) => (
            <li key={token.id}>
              <button
                type="button"
                className="verse-vocab-popover__item"
                onClick={() => onSelectToken?.(token)}
              >
                <InterlinearTokenDetail token={token} script={resolved} compact showPtGloss />
                {token.morphologyCode && (
                  <span className="verse-vocab-popover__morph">{token.morphologyCode}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {(data?.attribution || prefetchedTokens?.length) && (
        <p className="verse-vocab-popover__attrib">
          {data?.attribution ?? "Dados STEPBible.org (CC BY 4.0)"}
        </p>
      )}
    </div>
  );
}
