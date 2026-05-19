export interface Account {
  id: string;
  owner_id: string;
  name: string;
  balance: string;
  currency: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CreateAccountPayload {
  name: string;
  currency: string;
}

export interface AccountsResponse {
  success: boolean;
  status: number;
  message: string;
  payload: Account[];
}

export interface AccountResponse {
  success: boolean;
  status: number;
  message: string;
  payload: Account;
}

export interface BalanceResponse {
  success: boolean;
  status: number;
  message: string;
  payload: {
    account_id: string;
    calculated_balance: string;
  };
}
