export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  status: number;
  message: string;
  payload: {
    user_id: string;
    email: string;
    token: string;
  };
}

export interface AuthUser {
  user_id: string;
  email: string;
  token: string;
}