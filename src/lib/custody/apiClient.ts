import type { APIResult } from "./types";

const API_BASE = "https://auth.pay-defi.com/api/v1";

export class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  async request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const data: APIResult<T> = await res.json();

    if (data.errorCode !== 0) {
      throw new Error(`API error: ${data.errorCode}`);
    }

    return data.result;
  }
  
}
