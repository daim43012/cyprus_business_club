import type { RequestHandler } from "./$types";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";

export const GET: RequestHandler = async ({ cookies }) => {
  const auth = cookies.get("auth_token");
  if (!auth) {
    return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), { status: 401 });
  }

  const payload = await verifyJwt(auth);
  if (!payload?.uid) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid token" }), { status: 401 });
  }

  const follows = await prisma.cbcFollow.findMany({
    where: { followerId: payload.uid },
    include: {
      following: {
        include: { info: true }
      }
    }
  });

  const users = follows
    .filter((f) => f.following.info?.custodyAddress)
    .map((f) => ({
      id: f.following.id,
      email: f.following.email,
      custodyAddress: f.following.info!.custodyAddress,
      photo: f.following.info?.photo ?? null 
    }));

  return new Response(JSON.stringify({ ok: true, users }), { status: 200 });
};
