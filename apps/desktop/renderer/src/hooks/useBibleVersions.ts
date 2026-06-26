import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface BibleVersionOption {
  id: string;
  abbreviation: string;
  name: string;
  language?: string;
}

export function useBibleVersions() {
  return useQuery({
    queryKey: ["bible-versions"],
    queryFn: () => api.getVersions(),
    staleTime: 60_000,
    select: (versions) =>
      versions.filter((v) => v.abbreviation !== "DEMO") as BibleVersionOption[],
  });
}
