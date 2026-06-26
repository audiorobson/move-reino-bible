import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { StudyBlockType } from "@mrb/shared-types";
import { api, type StudyBlockInput, type StudySessionRecord } from "../lib/api";
import type { VerseContext } from "../lib/verse-context";
import {
  DEMO_STUDY_USER,
  buildPassageRange,
  defaultStudyTitle,
  verseLinkedRef,
  verseToBlockContent,
} from "../lib/study-utils";
import { useAppStore } from "../store/appStore";

type BlockMutationArgs = { studyId: string; payload: StudyBlockInput };

export function useStudySession() {
  const queryClient = useQueryClient();
  const {
    activeStudyId,
    setActiveStudyId,
    setStudyDraftDirty,
    studyVerses,
    clearStudyVerses,
  } = useAppStore();

  const ensuredRef = useRef(false);

  const { data: studies = [] } = useQuery({
    queryKey: ["studies", DEMO_STUDY_USER],
    queryFn: () => api.getStudies(DEMO_STUDY_USER),
  });

  const { data: activeStudy, isLoading } = useQuery({
    queryKey: ["study", activeStudyId],
    queryFn: () => api.getStudy(activeStudyId!),
    enabled: Boolean(activeStudyId),
  });

  const [createError, setCreateError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (title: string) =>
      api.createStudy({
        userId: DEMO_STUDY_USER,
        title,
        description: "Estudo criado no Modo de Estudo — Move Reino Bible",
      }),
    onSuccess: (study) => {
      setCreateError(null);
      setActiveStudyId(study.id);
      queryClient.invalidateQueries({ queryKey: ["studies"] });
    },
    onError: (err) => {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar estudo");
    },
  });

  const addBlockMutation = useMutation({
    mutationFn: ({ studyId, payload }: BlockMutationArgs) => api.addStudyBlock(studyId, payload),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({ queryKey: ["study", studyId] });
      queryClient.invalidateQueries({ queryKey: ["studies"] });
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
      setStudyDraftDirty(false);
      queryClient.invalidateQueries({ queryKey: ["study", studyId] });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: ({ studyId, blockId }: { studyId: string; blockId: string }) =>
      api.deleteStudyBlock(studyId, blockId),
    onSuccess: (_, { studyId }) => queryClient.invalidateQueries({ queryKey: ["study", studyId] }),
  });

  const updateStudyMutation = useMutation({
    mutationFn: ({ studyId, data }: { studyId: string; data: Partial<{ title: string; passageRange: string }> }) =>
      api.updateStudy(studyId, data),
    onSuccess: (_, { studyId }) => queryClient.invalidateQueries({ queryKey: ["study", studyId] }),
  });

  const ensureDraftStudy = useCallback(async (): Promise<string | null> => {
    if (activeStudyId) return activeStudyId;
    if (createMutation.isPending) return null;

    if (studies.length > 0 && !ensuredRef.current) {
      ensuredRef.current = true;
      const latest = studies[0] as StudySessionRecord;
      setActiveStudyId(latest.id);
      return latest.id;
    }

    if (!ensuredRef.current) {
      ensuredRef.current = true;
      const study = await createMutation.mutateAsync(defaultStudyTitle());
      return study.id;
    }

    return activeStudyId;
  }, [activeStudyId, createMutation, studies, setActiveStudyId]);

  const addVerseBlock = useCallback(
    async (ctx: VerseContext) => {
      const studyId = (await ensureDraftStudy()) ?? activeStudyId;
      if (!studyId) return;

      await addBlockMutation.mutateAsync({
        studyId,
        payload: {
          type: "bible_text",
          content: verseToBlockContent(ctx),
          linkedVerses: verseLinkedRef(ctx),
        },
      });

      const refreshed = await api.getStudy(studyId);
      const range = buildPassageRange(refreshed.blocks);
      if (range) {
        await api.updateStudy(studyId, { passageRange: range });
      }
      queryClient.invalidateQueries({ queryKey: ["study", studyId] });
    },
    [activeStudyId, addBlockMutation, ensureDraftStudy, queryClient]
  );

  const addTextBlock = useCallback(
    async (type: StudyBlockType, text: string, linkedVerses?: unknown[]) => {
      const studyId = (await ensureDraftStudy()) ?? activeStudyId;
      if (!studyId) return;

      await addBlockMutation.mutateAsync({
        studyId,
        payload: {
          type,
          content: { text: text.trim() },
          linkedVerses,
        },
      });
    },
    [activeStudyId, addBlockMutation, ensureDraftStudy]
  );

  const addBlock = useCallback(
    async (type: StudyBlockType, content: Record<string, unknown> = {}, linkedVerses?: unknown[]) => {
      const studyId = (await ensureDraftStudy()) ?? activeStudyId;
      if (!studyId) return;

      await addBlockMutation.mutateAsync({
        studyId,
        payload: { type, content, linkedVerses },
      });
    },
    [activeStudyId, addBlockMutation, ensureDraftStudy]
  );

  const saveBlockText = useCallback(
    (blockId: string, text: string) => {
      if (!activeStudyId) return;
      setStudyDraftDirty(true);
      const study = queryClient.getQueryData<StudySessionRecord>(["study", activeStudyId]);
      const block = study?.blocks.find((b) => b.id === blockId);
      updateBlockMutation.mutate({
        studyId: activeStudyId,
        blockId,
        data: { content: { ...(block?.content ?? {}), text } },
      });
    },
    [activeStudyId, queryClient, setStudyDraftDirty, updateBlockMutation]
  );

  const flushPendingVerses = useCallback(async () => {
    for (const v of studyVerses) {
      await addVerseBlock(v);
    }
    clearStudyVerses();
  }, [studyVerses, addVerseBlock, clearStudyVerses]);

  useEffect(() => {
    if (!activeStudyId) {
      ensuredRef.current = false;
    }
  }, [activeStudyId]);

  return {
    studies: studies as StudySessionRecord[],
    activeStudy,
    activeStudyId,
    isLoading,
    ensureDraftStudy,
    createStudy: (title: string) => createMutation.mutate(title),
    selectStudy: setActiveStudyId,
    addVerseBlock,
    addTextBlock,
    addBlock,
    saveBlockText,
    deleteBlock: (id: string) => {
      if (!activeStudyId) return;
      deleteBlockMutation.mutate({ studyId: activeStudyId, blockId: id });
    },
    updateStudyTitle: (title: string) => {
      if (!activeStudyId) return;
      updateStudyMutation.mutate({ studyId: activeStudyId, data: { title } });
    },
    flushPendingVerses,
    isSaving:
      addBlockMutation.isPending ||
      updateBlockMutation.isPending ||
      createMutation.isPending,
    createError,
    clearCreateError: () => setCreateError(null),
  };
}
