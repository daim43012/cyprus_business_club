import type { RequestHandler } from "./$types";
import { CustodyAPI } from "$lib/custody";
import { verifyJwt } from "$lib/jwt";
import type { WithdrawRequest } from "$lib/custody/types";
import { createTransferMessage } from "$lib/utils/transferMessage";

export const POST: RequestHandler = async ({ request, cookies }) => {

  const auth = cookies.get("auth_token");
  if (!auth) {
    return new Response(
      JSON.stringify({ ok: false, error: "Not authenticated" }),
      { status: 401 }
    );
  }

  const payload = await verifyJwt(auth);
  if (!payload?.uid) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid token" }), {
      status: 401
    });
  }

  const custodyToken = cookies.get("jwt");
  if (!custodyToken) {
    return new Response(
      JSON.stringify({ ok: false, error: "No custody token found" }),
      { status: 401 }
    );
  }

  const api = new CustodyAPI();
  api.setToken(custodyToken);

  let body: WithdrawRequest & { toUserId?: string | null };

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON payload" }),
      { status: 400 }
    );
  }

  const { amount, currency, chain, to, token, toUserId } = body;

  if (!amount || amount <= 0) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid amount" }),
      { status: 400 }
    );
  }

  if (!to) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing destination address" }),
      { status: 400 }
    );
  }

  if (!token || token.length !== 6) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid 2FA code" }),
      { status: 400 }
    );
  }

  let txHash: string | null = null;

  try {
    txHash = await api.withdraw({ amount, currency, chain, to, token });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : "Withdraw failed"
      }),
      { status: 400 }
    );
  }

  if (toUserId) {
    await createTransferMessage(payload.uid, toUserId, amount, currency);
  }

  return new Response(JSON.stringify({ ok: true, txHash }), { status: 200 });
};
