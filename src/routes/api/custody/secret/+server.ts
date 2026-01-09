import type { RequestHandler } from "./$types";
import { CustodyAPI } from "$lib/custody";
import { verifyJwt } from "$lib/jwt";
import prisma from "$lib/prisma";

export const GET: RequestHandler = async ({ cookies }) => {
  const auth = cookies.get("auth_token");
  if (!auth) {
    return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), { status: 401 });
  }

  const payload = await verifyJwt(auth);
  if (!payload?.uid) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid token" }), { status: 401 });
  }

  const custodyToken = cookies.get("jwt");
  if (!custodyToken) {
    return new Response(JSON.stringify({ ok: false, error: "No custody token found" }), { status: 401 });
  }

  const api = new CustodyAPI();
  api.setToken(custodyToken);

  try {
    const secret = await api.getSecret();

    return new Response(JSON.stringify({ ok: true, secret }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error"
      }),
      { status: 400 }
    );
  }
};
