import type { LoginResponse } from "./types";
import { APIClient } from "./apiClient";

export async function login(client: APIClient, email: string, password: string): Promise<string> {
  const data = await client.request<LoginResponse["result"]>(
    "/auth/login",
    "POST",
    { email, password }
  );

  client.setToken(data.access_token);
  return data.access_token;
}
