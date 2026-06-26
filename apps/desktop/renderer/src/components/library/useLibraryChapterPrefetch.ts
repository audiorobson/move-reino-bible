import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export function useLibraryChapterPrefetch(
  bookId: string,
  chapterIds: { prev?: string; next?: string }
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetch = (chapterId: string) => {
      void queryClient.prefetchQuery({
        queryKey: ["library-chapter", bookId, chapterId],
        queryFn: () => api.getLibraryChapter(bookId, chapterId),
        staleTime: 5 * 60_000,
      });
    };
    if (chapterIds.prev) prefetch(chapterIds.prev);
    if (chapterIds.next) prefetch(chapterIds.next);
  }, [bookId, chapterIds.prev, chapterIds.next, queryClient]);
}
