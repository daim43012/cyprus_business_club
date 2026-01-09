import type { RequestEvent } from '@sveltejs/kit';
import { getGoogleAuthUrl } from '$lib/google';

export const GET = async ({ url, cookies }: RequestEvent) => {
  let state: string | undefined = url.searchParams.get("state") ?? undefined;

  if (!state) {
    const refCookie = cookies.get("ref");
    if (refCookie) {
      state = refCookie;
    }
  }

  const authUrl = getGoogleAuthUrl(state);

  return new Response(null, {
    status: 302,
    headers: { Location: authUrl }
  });
};
