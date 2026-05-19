import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/transactionService";
import type {
  DepositPayload,
  TransferPayload,
  WithdrawPayload,
} from "@/types/transaction";

export const useTransactions = (accountId: string | null) => {
  return useQuery({
    queryKey: ["transactions", accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const res = await transactionService.listByAccount(accountId);
      return res.payload ?? [];
    },
    enabled: true,
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DepositPayload) =>
      transactionService.deposit(payload),

    onSuccess: (_, variables) => {
      // refresh accounts + transactions
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.account_id],
      });
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WithdrawPayload) =>
      transactionService.withdraw(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.account_id],
      });
    },
  });
};

export const useTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransferPayload) =>
      transactionService.transfer(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      // optional: if transfer touches two accounts
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.from_account_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.to_account_id],
      });
    },
  });
};
