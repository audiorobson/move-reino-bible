import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface BibleBookOption {
  id: string;
  osisId: string;
  namePt: string;
  nameEn: string;
  testament: "OT" | "NT";
  canonOrder: number;
  chapterCount: number;
}

export function useBibleBooks() {
  return useQuery({
    queryKey: ["bible-books"],
    queryFn: () => api.getBooks(),
    staleTime: 300_000,
    select: (books) =>
      [...books].sort((a, b) => a.canonOrder - b.canonOrder) as BibleBookOption[],
  });
}
