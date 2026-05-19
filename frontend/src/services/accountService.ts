import type {
  AccountResponse,
  AccountsResponse,
  CreateAccountPayload,
} from "@/types/accounts";
import { api } from "./api";

export const accountService = {
  list: async (): Promise<AccountsResponse> => {
    const { data } = await api.get<AccountsResponse>("/accounts");
    return data;
  },

  get: async (id: string): Promise<AccountResponse> => {
    const { data } = await api.get<AccountResponse>(`/accounts/${id}`);
    return data;
  },

  create: async (payload: CreateAccountPayload): Promise<AccountResponse> => {
    const { data } = await api.post<AccountResponse>("/accounts", payload);
    return data;
  },

  deactivate: async (id: string): Promise<void> => {
    await api.patch(`/accounts/${id}/deactivate`);
  },
};
