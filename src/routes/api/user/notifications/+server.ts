import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { verifyJwt } from '$lib/jwt';

export const GET = async ({ cookies }: RequestEvent) => {
  try {
    const token = cookies.get('auth_token');
    if (!token) return new Response('Unauthorized', { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.uid) return new Response('Invalid token', { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: payload.uid },
      orderBy: { createdAt: 'desc' }
    });

    return new Response(JSON.stringify({ notifications }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Notifications GET error:', err);
    return new Response('Internal server error', { status: 500 });
  }
};


export const POST = async ({ cookies, request }: RequestEvent) => {
  try {
    const token = cookies.get('auth_token');
    if (!token) return new Response('Unauthorized', { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.uid) return new Response('Invalid token', { status: 401 });

    const { id } = await request.json();

    if (!id) return new Response('Notification ID required', { status: 400 });

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (err) {
    console.error('Notifications POST error:', err);
    return new Response('Internal server error', { status: 500 });
  }
};
