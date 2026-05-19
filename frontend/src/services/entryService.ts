import { api } from "./api";
import type {
  EntriesResponse,
  ReconcilePayload,
  ReconcileResponse,
} from "../types/entry";

export const entryService = {
  listByAccount: async (
    accountId: string,
    limit: number,
    offset: number,
  ): Promise<EntriesResponse> => {
    const { data } = await api.get<EntriesResponse>(
      `/accounts/${accountId}/entries`,
      { params: { limit, offset } },
    );
    return data;
  },

  reconcile: async (payload: ReconcilePayload): Promise<ReconcileResponse> => {
    const { data } = await api.post<ReconcileResponse>(
      "/accounts/reconcile",
      payload,
    );
    return data;
  },
};
