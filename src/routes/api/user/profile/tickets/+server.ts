import type { RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";

export const GET: RequestHandler = async ({ cookies }) => {
  const token = cookies.get("auth_token");
  if (!token) return new Response("Unauthorized", { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload?.uid) return new Response("Invalid token", { status: 401 });

  try {
    const tickets = await prisma.eventRegistration.findMany({
      where: {
        userId: payload.uid,
        event: {
          date: { gt: new Date() }
        }
      },
      include: {
        event: true
      },
      orderBy: { createdAt: "desc" }
    });

    return new Response(JSON.stringify(tickets), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Tickets API error:", err);
    return new Response("Internal error", { status: 500 });
  }
};
