import type { WithdrawRequest, WithdrawResponse } from "./types";
import { APIClient } from "./apiClient";

export async function withdraw(
  client: APIClient,
  payload: WithdrawRequest
): Promise<string | null> {
  const result = await client.request<WithdrawResponse["result"]>(
    "/wallets/withdraw",
    "POST",
    payload
  );

  return result;
}
