import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { verifyJwt } from '$lib/jwt';

export const GET = async ({ cookies }: RequestEvent) => {
  const token = cookies.get('auth_token');

  if (!token) {
    return new Response(
      JSON.stringify({ isPartner: false, availability: [] }),
      { status: 200 }
    );
  }

  const payload = await verifyJwt(token);

  if (!payload || !payload.uid) {
    return new Response(
      JSON.stringify({ isPartner: false, availability: [] }),
      { status: 200 }
    );
  }

  const user = await prisma.cbcUser.findUnique({
    where: { id: payload.uid },
    include: { info: true, availability: true }
  });

  if (!user || !user.info) {
    return new Response(
      JSON.stringify({ isPartner: false, availability: [] }),
      { status: 200 }
    );
  }

  return new Response(
    JSON.stringify({
      isPartner: user.info.status === 'Partner',
      availability: user.availability
    }),
    { status: 200 }
  );
};

export const POST = async ({ request, cookies }: RequestEvent) => {
  const token = cookies.get('auth_token');

  if (!token) {
    return new Response('Not authorized', { status: 401 });
  }

  const payload = await verifyJwt(token);

  if (!payload || !payload.uid) {
    return new Response('Invalid token', { status: 401 });
  }

  const user = await prisma.cbcUser.findUnique({
    where: { id: payload.uid },
    include: { info: true }
  });

  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  if (!user.info || user.info.status !== 'Partner') {
    return new Response('Access denied', { status: 403 });
  }

  const { start, end } = await request.json();

  if (!start || !end) {
    return new Response('start and end are required', { status: 400 });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate >= endDate) {
    return new Response('start must be less than end', { status: 400 });
  }

  const slot = await prisma.availability.create({
    data: {
      userId: user.id,
      start: startDate,
      end: endDate
    }
  });

  return new Response(JSON.stringify(slot), { status: 200 });
};
