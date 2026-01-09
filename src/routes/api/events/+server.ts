import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { verifyJwt } from '$lib/jwt';

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const token = cookies.get("auth_token");
    let userId: string | null = null;

    if (token) {
      const payload = await verifyJwt(token);
      if (payload?.uid) userId = payload.uid;
    }

    const events = await prisma.event.findMany({
      include: {
        categories: true,
        registrations: userId
          ? {
              where: { userId },
              select: { id: true }
            }
          : false
      },
      orderBy: { date: "asc" }
    });

    const enriched = events.map(e => ({
      ...e,
      isRegistered: userId ? e.registrations?.length > 0 : false
    }));

    return new Response(JSON.stringify(enriched), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Error fetching events:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
