import type { RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    const token = cookies.get("auth_token");

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload?.uid) {
      return new Response("Invalid token", { status: 401 });
    }

    const userId = payload.uid;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Read-all notifications error:", err);
    return new Response("Internal server error", { status: 500 });
  }
};
