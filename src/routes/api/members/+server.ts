import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/prisma';

export const GET: RequestHandler = async () => {
  try {
    const users = await prisma.cbcUser.findMany({
      where: {
        settings: {
          isPrivate: false, 
        },
      },
      select: {
        id: true,
        email: true,
        info: {
          select: {
            name: true,
            photo: true,
            status: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error fetching members:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
