import type { RegisterResponse } from "./types";
import { APIClient } from "./apiClient";

export async function register(
  client: APIClient,
  email: string,
  password: string
): Promise<RegisterResponse["result"]> {
  const data = await client.request<RegisterResponse["result"]>(
    "/users",
    "POST",
    {
      email,
      password,
      telegramId: "",
    }
  );

  return data;
}
