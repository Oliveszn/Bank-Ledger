import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateAccountPayload } from "@/types/accounts";
import { accountService } from "@/services/accountService";

export const useAccounts = () => {
  return useQuery({
    queryKey: ["accounts"],

    queryFn: async () => {
      const res = await accountService.list();
      return res.payload ?? [];
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      accountService.create(payload),

    onSuccess: (res) => {
      queryClient.setQueryData(["accounts"], (old: any[] = []) => {
        return [res.payload, ...old];
      });
    },
  });
};
