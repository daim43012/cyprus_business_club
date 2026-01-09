import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { verifyJwt } from '$lib/jwt';

export const GET = async ({ url, cookies }: RequestEvent) => {
  try {
    const token = cookies.get('auth_token');
    if (!token) return new Response(JSON.stringify({ following: false }), { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.uid) return new Response(JSON.stringify({ following: false }), { status: 401 });

    const userId = url.searchParams.get('userId');
    if (!userId) return new Response('Missing userId', { status: 400 });

    const follow = await prisma.cbcFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: payload.uid,
          followingId: userId
        }
      }
    });

    return new Response(JSON.stringify({ following: !!follow }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Follow status error:', err);
    return new Response('Internal server error', { status: 500 });
  }
};

export const POST = async ({ request, cookies }: RequestEvent) => {
  try {
    const token = cookies.get('auth_token');
    if (!token) return new Response('Unauthorized', { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.uid) return new Response('Invalid token', { status: 401 });

    const { userId } = await request.json();
    if (!userId) return new Response('Missing userId', { status: 400 });

    if (payload.uid === userId) {
      return new Response('You cannot follow yourself', { status: 400 });
    }

    const existing = await prisma.cbcFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: payload.uid,
          followingId: userId
        }
      }
    });

    if (existing) {
      return new Response('Already following', { status: 409 });
    }

    await prisma.cbcFollow.create({
      data: {
        followerId: payload.uid,
        followingId: userId
      }
    });

    return new Response('Followed successfully', { status: 201 });
  } catch (err) {
    console.error('Follow error:', err);
    return new Response('Internal server error', { status: 500 });
  }
};

export const DELETE = async ({ request, cookies }: RequestEvent) => {
  try {
    const token = cookies.get('auth_token');
    if (!token) return new Response('Unauthorized', { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.uid) return new Response('Invalid token', { status: 401 });

    const { userId } = await request.json();
    if (!userId) return new Response('Missing userId', { status: 400 });

    await prisma.cbcFollow.deleteMany({
      where: {
        followerId: payload.uid,
        followingId: userId
      }
    });

    return new Response('Unfollowed successfully', { status: 200 });
  } catch (err) {
    console.error('Unfollow error:', err);
    return new Response('Internal server error', { status: 500 });
  }
};
