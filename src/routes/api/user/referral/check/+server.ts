import type { RequestEvent } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export const GET = async ({ url }: RequestEvent) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response(
      JSON.stringify({ error: "Missing code parameter" }),
      { status: 400 }
    );
  }

  const user = await prisma.cbcUser.findUnique({
    where: { referralId: code }
  });

  return new Response(
    JSON.stringify({ exists: !!user }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
