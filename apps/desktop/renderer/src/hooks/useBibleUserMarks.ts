import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { DEMO_STUDY_USER } from "../lib/study-utils";

export function useBibleUserMarks(bookId: string, chapter: number) {
  const { data: notes = [] } = useQuery({
    queryKey: ["bible-notes", DEMO_STUDY_USER],
    queryFn: () => api.getNotes(DEMO_STUDY_USER),
    staleTime: 30_000,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["bible-favorites", DEMO_STUDY_USER],
    queryFn: () => api.getBibleFavorites(DEMO_STUDY_USER),
    staleTime: 30_000,
  });

  const noteByVerse = (verse: number) =>
    notes.find((n) => n.bookId === bookId && n.chapter === chapter && n.verse === verse);

  const isFavoriteVerse = (verse: number) =>
    favorites.some((f) => f.bookId === bookId && f.chapter === chapter && f.verse === verse);

  return { notes, favorites, noteByVerse, isFavoriteVerse };
}
