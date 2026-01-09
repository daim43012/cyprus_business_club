// src/routes/api/wallets/+server.ts
import type { RequestHandler } from "./$types";
import { CustodyAPI } from "$lib/custody";

export const GET: RequestHandler = async ({ cookies }) => {
  const token = cookies.get("jwt");

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const api = new CustodyAPI();
  api.setToken(token);

  try {
    const wallets = await api.getWallets();
    return new Response(JSON.stringify(wallets));
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 400 }
    );
  }
};
