import type { RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";

const allowedTypes = new Set(["AUDIENCE", "PAIN", "SOLUTION", "MONETIZATION", "CLIENT"]);

function authOrThrow(cookies: any) {
  const token = cookies.get("auth_token");
  if (!token) return null;
  return token;
}

export const GET: RequestHandler = async ({ url, cookies }) => {
  const token = authOrThrow(cookies);
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload?.uid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const type = String(url.searchParams.get("type") || "").trim().toUpperCase();
  if (!allowedTypes.has(type)) {
    return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
  }

  const items = await prisma.brandTag.findMany({
    where: { type: type as any, isActive: true },
    orderBy: { title: "asc" },
    select: { id: true, type: true, title: true },
  });

  return new Response(JSON.stringify(items), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
