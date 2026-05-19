import { api } from "./api";
import type {
  TransactionsResponse,
  TransactionResponse,
  DepositPayload,
  WithdrawPayload,
  TransferPayload,
} from "../types/transaction";

export const transactionService = {
  listByAccount: async (accountId: string): Promise<TransactionsResponse> => {
    const { data } = await api.get<TransactionsResponse>(
      `/accounts/${accountId}/transactions`,
    );
    return data;
  },

  getById: async (id: string): Promise<TransactionResponse> => {
    const { data } = await api.get<TransactionResponse>(`/transactions/${id}`);
    return data;
  },

  deposit: async (payload: DepositPayload): Promise<TransactionResponse> => {
    const { data } = await api.post<TransactionResponse>(
      "/transactions/deposit",
      payload,
    );
    return data;
  },

  withdraw: async (payload: WithdrawPayload): Promise<TransactionResponse> => {
    const { data } = await api.post<TransactionResponse>(
      "/transactions/withdraw",
      payload,
    );
    return data;
  },

  transfer: async (payload: TransferPayload): Promise<TransactionResponse> => {
    const { data } = await api.post<TransactionResponse>(
      "/transactions/transfer",
      payload,
    );
    return data;
  },
};
