import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { verifyJwt } from '$lib/jwt';

export const GET = async ({ cookies }: RequestEvent) => {
  try {
    const token = cookies.get('auth_token');
    if (!token) return new Response('Unauthorized', { status: 401 });

    const payload = await verifyJwt(token);
    const userId = payload?.uid;
    if (!userId) return new Response('Invalid token', { status: 401 });

    // считаем непрочитанные
    const unread = await prisma.messageRead.count({
      where: { userId }
    });

    return new Response(JSON.stringify({ unread }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Unread count error:', err);
    return new Response('Internal server error', { status: 500 });
  }
};
