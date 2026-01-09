import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { verifyJwt } from '$lib/jwt';

export const POST = async ({ request, cookies }: RequestEvent) => {
  const token = cookies.get('auth_token');
  if (!token) {
    return new Response('Not authorized', { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload?.uid) {
    return new Response('Invalid token', { status: 401 });
  }

  const clientId = payload.uid;

  const body = await request.json();
  const { hostId, start, end } = body || {};

  if (!hostId || !start || !end) {
    return new Response('hostId, start and end are required', { status: 400 });
  }

  const bookingStart = new Date(start);
  const bookingEnd = new Date(end);

  if (isNaN(bookingStart.getTime()) || isNaN(bookingEnd.getTime())) {
    return new Response('Invalid date format', { status: 400 });
  }

  if (bookingStart >= bookingEnd) {
    return new Response('start must be less than end', { status: 400 });
  }

  const host = await prisma.cbcUser.findUnique({
    where: { id: hostId },
    include: { info: true }
  });

  if (!host || !host.info || host.info.status !== 'Partner') {
    return new Response('Host not found or not a partner', { status: 400 });
  }

  const availability = await prisma.availability.findFirst({
    where: {
      userId: hostId,
      start: { lte: bookingStart },
      end: { gte: bookingEnd }
    }
  });

  if (!availability) {
    return new Response('No availability for this interval', { status: 400 });
  }

  const overlappingSlot = await prisma.meetingSlot.findFirst({
    where: {
      hostId,
      OR: [
        {
          start: { lt: bookingEnd },
          end:   { gt: bookingStart }
        }
      ]
    }
  });

  if (overlappingSlot) {
    return new Response('Time interval already booked', { status: 400 });
  }

  const slot = await prisma.meetingSlot.create({
    data: {
      hostId,
      start: bookingStart,
      end: bookingEnd
    }
  });

  const meeting = await prisma.meeting.create({
    data: {
      hostId,
      clientId,
      slotId: slot.id
    },
    include: {
      host: true,
      client: true,
      slot: true
    }
  });

  const ops = [];

  if (availability.start < bookingStart) {
    ops.push(
      prisma.availability.create({
        data: {
          userId: hostId,
          start: availability.start,
          end: bookingStart
        }
      })
    );
  }

  if (bookingEnd < availability.end) {
    ops.push(
      prisma.availability.create({
        data: {
          userId: hostId,
          start: bookingEnd,
          end: availability.end
        }
      })
    );
  }

  ops.push(
    prisma.availability.delete({
      where: { id: availability.id }
    })
  );

  await Promise.all(ops);

  return new Response(JSON.stringify(meeting), { status: 200 });
};
