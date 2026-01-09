export interface LoginResponse {
  result: {
    access_token: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    email: string;
    telegramId: string;
    secret: string;
  };
  errorCode: number;
}

export interface Wallet {
  address: string;
  chain: string;
}

export interface WalletsResponse {
  result: Wallet[];
  errorCode: number;
}

export interface APIResult<T> {
  result: T;
  errorCode: number;
}

export interface RegisterResponse {
  result: {
    userId: number;
    createdAt: string;
    updatedAt: string;
    email: string;
    telegramId: string;
    secret: string;
  };
  errorCode: number;
}

export interface WithdrawRequest {
  amount: number;
  currency: string;
  chain: string;
  to: string;
  token: string;
}

export interface WithdrawResponse {
  result: string | null;
  errorCode: number;
}
