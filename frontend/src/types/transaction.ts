export type OperationType = "deposit" | "withdrawal" | "transfer";

export interface Entry {
  id: string;
  account_id: string;
  debit: string;
  credit: string;
  description: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  operation_type: OperationType;
  description: string;
  created_at: string;
  entries: Entry[];
}

export interface TransactionsResponse {
  success: boolean;
  status: number;
  message: string;
  payload: Transaction[];
}

export interface TransactionResponse {
  success: boolean;
  status: number;
  message: string;
  payload: Transaction;
}

export interface DepositPayload {
  account_id: string;
  amount: number;
  description?: string;
}

export interface WithdrawPayload {
  account_id: string;
  amount: number;
  description?: string;
}

export interface TransferPayload {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description?: string;
}
