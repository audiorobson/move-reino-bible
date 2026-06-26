import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { OriginalScript } from "../lib/original-language";

export function useChapterOriginal(bookOsisId: string, chapter: number, enabled = true) {
  const availability = useQuery({
    queryKey: ["original-availability", bookOsisId, chapter],
    queryFn: () => api.getChapterOriginalAvailability(bookOsisId, chapter),
    enabled,
    staleTime: 0,
  });

  const tokens = useQuery({
    queryKey: ["original-chapter-tokens", bookOsisId, chapter],
    queryFn: () => api.getChapterOriginalTokens(bookOsisId, chapter),
    enabled: enabled && (availability.data?.totalTokens ?? 0) > 0,
    staleTime: 0,
  });

  const verseSet = new Set(availability.data?.verses ?? []);
  const originalLanguage: OriginalScript | null = availability.data?.language ?? null;

  return {
    hasChapterData: (availability.data?.totalTokens ?? 0) > 0,
    totalTokens: availability.data?.totalTokens ?? 0,
    versesWithData: availability.data?.verses ?? [],
    hasVerseData: (verse: number) => verseSet.has(verse),
    tokensByVerse: tokens.data?.verses ?? {},
    originalLanguage,
    sourceDataset: availability.data?.sourceDataset ?? null,
    isLoading: availability.isLoading,
  };
}