import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { Button, LoadingState, EmptyState, Badge } from "@mrb/ui-kit";
import type { StudyBlockType } from "@mrb/shared-types";
import { api, type StudySessionRecord, type StudyBlockInput } from "../lib/api";
import { useAppStore } from "../store/appStore";
import { VerseDropZone } from "../components/VerseDropZone";
import { StudyBlockToolbar } from "../components/study/StudyBlockToolbar";
import { StudyBlockCard } from "../components/study/StudyBlockCard";
import type { VerseContext } from "../lib/verse-context";
import { ChildPanelRedirect } from "../components/ChildPanelRedirect";
import { electronOpenStudy, isElectronStudyWindow, isStudyWindowRoute } from "../lib/study-electron";

const DEMO_USER = "demo-user";

function verseToBlockContent(v: VerseContext) {
  return {
    reference: v.reference,
    text: v.text,
    version: v.version,
    bookOsisId: v.bookOsisId,
    chapter: v.chapter,
    verse: v.verse,
  };
}

function StudyBuilderRedirect() {
  return (
    <div>
      <div className="bible-header">
        <h2>Estudos</h2>
        <p>Construa estudos com versículos, notas e fontes teológicas</p>
      </div>
      <ChildPanelRedirect
        title="Janela de estudo aberta"
        description="No app desktop, o painel de estudos abre em uma janela secundária ao lado da Bíblia. Arraste versículos para a janela ou use o botão Estudo na barra de versículos."
        onOpen={() => void electronOpenStudy()}
      />
    </div>
  );
}

function StudyBuilderPanel() {
  const [title, setTitle] = useState("");
  const [activeStudyId, setActiveStudyId] = useState<string | null>(null);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceExcerpt, setSourceExcerpt] = useState("");
  const [blockError, setBlockError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { studyVerses, dispatchVerseToModule, clearStudyVerses, openStudyPreview } = useAppStore();

  const { data: studies, isLoading } = useQuery({
    queryKey: ["studies", DEMO_USER],
    queryFn: () => api.getStudies(DEMO_USER),
  });

  const { data: activeStudy, isLoading: loadingStudy } = useQuery({
    queryKey: ["study", activeStudyId],
    queryFn: () => api.getStudy(activeStudyId!),
    enabled: Boolean(activeStudyId),
  });

  const [createError, setCreateError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (t: string) =>
      api.createStudy({ userId: DEMO_USER, title: t, description: "Estudo criado no Move Reino Bible" }),
    onSuccess: (study) => {
      setCreateError(null);
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      setActiveStudyId(study.id);
      setTitle("");
    },
    onError: (err) => {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar estudo");
    },
  });

  const addBlockMutation = useMutation({
    mutationFn: ({ studyId, payload }: { studyId: string; payload: StudyBlockInput }) =>
      api.addStudyBlock(studyId, payload),
    onSuccess: (_, { studyId }) => {
      setBlockError(null);
      queryClient.invalidateQueries({ queryKey: ["study", studyId] });
      queryClient.invalidateQueries({ queryKey: ["studies"] });
    },
    onError: (err) => {
      setBlockError(err instanceof Error ? err.message : "Erro ao adicionar bloco");
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: ({
      studyId,
      blockId,
      data,
    }: {
      studyId: string;
      blockId: string;
      data: Partial<StudyBlockInput>;
    }) => api.updateStudyBlock(studyId, blockId, data),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({ queryKey: ["study", studyId] });
    },
    onError: (err) => {
      setBlockError(err instanceof Error ? err.message : "Erro ao salvar bloco");
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: ({ studyId, blockId }: { studyId: string; blockId: string }) =>
      api.deleteStudyBlock(studyId, blockId),
    onSuccess: (_, { studyId }) => queryClient.invalidateQueries({ queryKey: ["study", studyId] }),
  });

  const saveVersesMutation = useMutation({
    mutationFn: async () => {
      if (!activeStudyId) throw new Error("Selecione um estudo");
      for (const v of studyVerses) {
        await api.addStudyBlock(activeStudyId, {
          type: "bible_text",
          content: verseToBlockContent(v),
          linkedVerses: [{ bookOsisId: v.bookOsisId, chapter: v.chapter, verse: v.verse }],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study", activeStudyId] });
      clearStudyVerses();
    },
  });

  const addBlock = (type: StudyBlockType, content: Record<string, unknown> = {}) => {
    if (!activeStudyId) {
      setBlockError("Selecione ou crie um estudo primeiro.");
      return;
    }
    addBlockMutation.mutate({ studyId: activeStudyId, payload: { type, content } });
  };

  const handleAddBlock = (type: StudyBlockType) => {
    if (type === "observation" || type === "interpretation" || type === "application" || type === "question") {
      addBlock(type, { text: "" });
      return;
    }
    if (type === "original_word") {
      addBlock(type, { text: "" });
      return;
    }
    if (type === "theological_citation") {
      addBlock(type, {
        title: sourceTitle.trim(),
        excerpt: sourceExcerpt.trim(),
      });
      setSourceTitle("");
      setSourceExcerpt("");
    }
  };

  const handleDropVerse = (ctx: VerseContext) => {
    dispatchVerseToModule("studies", ctx);
    if (activeStudyId) {
      addBlockMutation.mutate({
        studyId: activeStudyId,
        payload: {
          type: "bible_text",
          content: verseToBlockContent(ctx),
          linkedVerses: [{ bookOsisId: ctx.bookOsisId, chapter: ctx.chapter, verse: ctx.verse }],
        },
      });
    }
  };

  const saveBlockText = (blockId: string, text: string) => {
    if (!activeStudyId) return;
    const block = activeStudy?.blocks.find((b) => b.id === blockId);
    updateBlockMutation.mutate({
      studyId: activeStudyId,
      blockId,
      data: { content: { ...(block?.content ?? {}), text } },
    });
  };

  return (
    <div className="study-builder">
      <div className="bible-header">
        <h2>Study Builder</h2>
        <p>Crie estudos, adicione versículos e fontes teológicas</p>
      </div>

      <div className="study-builder__create">
        <input
          className="mrb-input"
          placeholder="Título do novo estudo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button
          variant="primary"
          onClick={() => title && createMutation.mutate(title)}
          disabled={createMutation.isPending || !title.trim()}
        >
          {createMutation.isPending ? "Criando..." : "Criar estudo"}
        </Button>
      </div>

      {createError && (
        <p className="study-builder__error" role="alert">
          {createError}
        </p>
      )}

      {blockError && (
        <p className="study-builder__error" role="alert">
          {blockError}
          <button type="button" onClick={() => setBlockError(null)} aria-label="Fechar erro">
            ×
          </button>
        </p>
      )}

      {isLoading && <LoadingState />}
      {studies && studies.length > 0 && (
        <div className="study-builder__list">
          <h3 className="study-section-title">Meus estudos</h3>
          <div className="study-builder__study-chips">
            {(studies as StudySessionRecord[]).map((s) => (
              <button
                key={s.id}
                type="button"
                className={`study-chip ${activeStudyId === s.id ? "study-chip--active" : ""}`}
                onClick={() => setActiveStudyId(s.id)}
              >
                {s.title}
                <Badge variant="blue">{s.blocks?.length ?? 0}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeStudyId && (
        <>
          <VerseDropZone
            label="Arraste versículos para este estudo"
            hint={activeStudy ? `Estudo ativo: ${activeStudy.title}` : "Carregando..."}
            onDrop={handleDropVerse}
          />

          {studyVerses.length > 0 && (
            <div className="study-builder__pending">
              <p>{studyVerses.length} versículo(s) na área de transferência</p>
              <Button
                variant="gold"
                onClick={() => saveVersesMutation.mutate()}
                disabled={saveVersesMutation.isPending}
              >
                Salvar versículos no estudo
              </Button>
            </div>
          )}

          <StudyBlockToolbar
            onAddBlock={handleAddBlock}
            onAddVerseFromQueue={() => saveVersesMutation.mutate()}
            hasPendingVerses={studyVerses.length > 0}
            busy={addBlockMutation.isPending || saveVersesMutation.isPending}
          />

          <div className="study-builder__source-form">
            <h3 className="study-section-title">Citação teológica</h3>
            <input
              className="mrb-input"
              placeholder="Título da fonte teológica (RAG, comentário...)"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
            />
            <textarea
              className="mrb-input study-builder__textarea"
              placeholder="Trecho ou citação da fonte..."
              value={sourceExcerpt}
              onChange={(e) => setSourceExcerpt(e.target.value)}
              rows={3}
            />
            <Button
              variant="secondary"
              disabled={!sourceTitle.trim() && !sourceExcerpt.trim()}
              onClick={() =>
                addBlock("theological_citation", {
                  title: sourceTitle.trim(),
                  excerpt: sourceExcerpt.trim(),
                })
              }
            >
              Adicionar citação teológica
            </Button>
          </div>

          {loadingStudy && <LoadingState message="Carregando estudo..." />}
          {activeStudy && (
            <div className="study-builder__editor">
              <div className="study-builder__editor-head">
                <h3 className="study-section-title">
                  {activeStudy.title}
                  {activeStudy.passageRange && <Badge variant="gold">{activeStudy.passageRange}</Badge>}
                </h3>
                <Button
                  variant="gold"
                  title="Visualizar estudo formatado"
                  disabled={activeStudy.blocks.length === 0}
                  onClick={() => openStudyPreview(activeStudy)}
                >
                  <Eye size={16} />
                  Visualizar estudo
                </Button>
              </div>
              {activeStudy.blocks.length === 0 ? (
                <EmptyState
                  title="Estudo vazio"
                  description="Use os botões acima para adicionar versículos, observações e outros blocos."
                />
              ) : (
                <div className="study-block-list study-builder__block-list">
                  {[...activeStudy.blocks]
                    .sort((a, b) => a.order - b.order)
                    .map((block) => (
                      <StudyBlockCard
                        key={block.id}
                        block={block}
                        onDelete={() =>
                          deleteBlockMutation.mutate({ studyId: activeStudyId, blockId: block.id })
                        }
                        onSaveText={(text) => saveBlockText(block.id, text)}
                        onAddNote={(type) => addBlock(type, { text: "" })}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!isLoading && (!studies || studies.length === 0) && !activeStudyId && (
        <EmptyState title="Nenhum estudo ainda" description="Crie seu primeiro estudo bíblico acima" />
      )}
    </div>
  );
}

export function StudyBuilder() {
  if (isElectronStudyWindow() && !isStudyWindowRoute()) {
    return <StudyBuilderRedirect />;
  }
  return <StudyBuilderPanel />;
}
