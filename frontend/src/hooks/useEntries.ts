import { useQuery } from "@tanstack/react-query";
import type { Entry } from "../types/entry";
import { entryService } from "@/services/entryService";

const PAGE_SIZE = 20;

export function useEntries(accountId: string | null, page: number) {
  return useQuery<Entry[], Error>({
    queryKey: ["entries", accountId, page],

    queryFn: async () => {
      if (!accountId) return [];

      const offset = (page - 1) * PAGE_SIZE;

      const res = await entryService.listByAccount(
        accountId,
        PAGE_SIZE,
        offset,
      );

      return res.payload ?? [];
    },

    enabled: !!accountId,
  });
}
