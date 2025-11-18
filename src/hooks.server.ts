import { verifyJwt } from "$lib/jwt";
import type { Handle } from "@sveltejs/kit";
import "dotenv/config";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("auth_token");

  if (token) {
    try {
      const payload = await verifyJwt(token);

      if (payload?.uid) {
        event.locals.user = {
          id: payload.uid,
          email: payload.email
        };
      }
    } catch (err) {
      console.error("JWT verification error:", err);
      event.locals.user = undefined;
    }
  } else {
    event.locals.user = undefined;
  }

  const response = await resolve(event);
  return response;
};
