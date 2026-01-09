import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { comparePasswords } from '$lib/crypto';
import { signJwt } from '$lib/jwt';

export const POST = async ({ request, cookies }: RequestEvent) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response('Email and password are required', { status: 400 });
    }

    const user = await prisma.cbcUser.findUnique({ where: { email } });

    if (!user || !user.password) {
      return new Response('User not found or no password set (use Google login?)', { status: 401 });
    }

    const isValid = await comparePasswords(password, user.password);

    if (!isValid) {
      return new Response('Incorrect password', { status: 401 });
    }

    const token = await signJwt({ uid: user.id, email: user.email });

    cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return new Response(JSON.stringify({ user: { id: user.id, email: user.email } }), { status: 200 });
  } catch (err) {
    console.error('Login error:', err);
    return new Response('Internal server error', { status: 500 });
  }
};
