import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useVersificationAlignment(
  bookOsisId: string,
  chapter: number,
  enabled: boolean,
  from: "english" | "hebrew" | "greek" = "english",
  to: "english" | "hebrew" | "greek" = "hebrew"
) {
  const query = useQuery({
    queryKey: ["versification-chapter", bookOsisId, chapter, from, to],
    queryFn: () => api.getChapterVersification(bookOsisId, chapter, from, to),
    enabled,
    staleTime: 300_000,
  });

  const verseMap = new Map<number, number>();
  for (const m of query.data?.mappings ?? []) {
    verseMap.set(m.sourceVerse, m.targetVerse);
  }

  return {
    hasDifferences: query.data?.hasDifferences ?? false,
    verseMap,
    isLoading: query.isLoading,
  };
}
