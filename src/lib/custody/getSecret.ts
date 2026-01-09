import type { APIResult } from "./types";
import { APIClient } from "./apiClient";

export async function getSecret(client: APIClient): Promise<string> {
  const result = await client.request<string>("/wallets/secret", "GET");
  return result;
}
