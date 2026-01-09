import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete("jwt", { path: "/" });

  return new Response(JSON.stringify({ ok: true }));
};
