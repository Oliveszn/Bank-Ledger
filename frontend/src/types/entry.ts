import type { OperationType } from "./transaction";

export interface Entry {
  id: string;
  account_id: string;
  debit: string;
  credit: string;
  transaction_id: string;
  operation_type: OperationType;
  description: string;
  created_at: string;
}

export interface EntriesResponse {
  success: boolean;
  status: number;
  message: string;
  payload: Entry[];
}

export interface ReconcilePayload {
  account_id: string;
  expected_balance: number;
}

export interface ReconcileResult {
  account_id: string;
  expected_balance: string;
  calculated_balance: string;
  reconciled: boolean;
  discrepancy: string;
}

export interface ReconcileResponse {
  success: boolean;
  status: number;
  message: string;
  payload: ReconcileResult;
}
