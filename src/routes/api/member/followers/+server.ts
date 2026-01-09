import type { RequestEvent } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";

export const GET = async ({ cookies, url }: RequestEvent) => {
  try {
    const token = cookies.get("auth_token");
    if (!token) return new Response("Unauthorized", { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.uid) return new Response("Invalid token", { status: 401 });

    // userId — кого смотрим (если не указан, берём самого себя)
    const userId = url.searchParams.get("userId") || payload.uid;

    // 🔎 followers — кто подписан на userId
    const followers = await prisma.cbcFollow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            email: true,
            info: { select: { name: true, photo: true, status: true } },
          },
        },
      },
    });

    // 🔎 following — на кого подписан userId
    const following = await prisma.cbcFollow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            email: true,
            info: { select: { name: true, photo: true, status: true } },
          },
        },
      },
    });

    // 💡 Считаем количество без лишних запросов
    const counts = {
      followers: followers.length,
      following: following.length,
    };

    return new Response(
      JSON.stringify({
        userId,
        followers: followers.map((f) => f.follower),
        following: following.map((f) => f.following),
        counts,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Followers fetch error:", err);
    return new Response("Internal server error", { status: 500 });
  }
};
