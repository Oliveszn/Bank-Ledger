import { useMutation } from "@tanstack/react-query";
import type { ReconcileResult } from "../types/entry";
import { entryService } from "@/services/entryService";

export function useReconcile() {
  return useMutation<
    ReconcileResult,
    Error,
    { accountId: string; expectedBalance: number }
  >({
    mutationFn: async ({ accountId, expectedBalance }) => {
      const res = await entryService.reconcile({
        account_id: accountId,
        expected_balance: expectedBalance,
      });

      return res.payload;
    },
  });
}
