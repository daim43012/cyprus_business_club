import type { RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get("auth_token");
  if (!token) return new Response("Unauthorized", { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload?.uid) return new Response("Invalid token", { status: 401 });

  try {
    await prisma.cbcUser.update({
      where: { id: payload.uid },
      data: { lastOnline: new Date() },
    });
    return new Response("Updated", { status: 200 });
  } catch (err) {
    console.error("❌ Error updating lastOnline:", err);
    return new Response("Internal error", { status: 500 });
  }
};
