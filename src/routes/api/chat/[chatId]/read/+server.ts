import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { verifyJwt } from '$lib/jwt';

export const POST = async ({ params, cookies }: RequestEvent) => {
  try {
    const chatId = params.chatId;

    const token = cookies.get('auth_token');
    if (!token) return new Response('Unauthorized', { status: 401 });

    const payload = await verifyJwt(token);
    const userId = payload?.uid;
    if (!userId) return new Response('Invalid token', { status: 401 });

    await prisma.messageRead.deleteMany({
      where: {
        userId,
        message: {
          chatId
        }
      }
    });

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('Message read error:', err);
    return new Response('Internal server error', { status: 500 });
  }
};
