import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/transactionService";

export const useTransactions = (accountId: string | null) => {
  return useQuery({
    queryKey: ["transactions", accountId],

    queryFn: async () => {
      if (!accountId) return [];

      const res = await transactionService.listByAccount(accountId);

      return res.payload ?? [];
    },

    enabled: !!accountId,
  });
};
