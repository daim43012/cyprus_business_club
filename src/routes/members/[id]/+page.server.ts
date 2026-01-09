import prisma from "$lib/prisma";
import type { PageServerLoad } from "./$types";
import { verifyJwt } from "$lib/jwt";

export const load: PageServerLoad = async ({ params, cookies }) => {
  const { id } = params;

  if (!id) {
    return { status: 400, error: new Error("Missing member ID") };
  }

  const token = cookies.get("auth_token");
  let currentUserId: string | null = null;

  if (token) {
    const payload = await verifyJwt(token);
    if (payload?.uid) {
      currentUserId = payload.uid;
    }
  }

  try {
    const member = await prisma.cbcUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        lastOnline: true,
        info: {
          select: {
            name: true,
            photo: true,
            status: true,
            bio: true,
            location: true,
            dateOfBirth: true,
          },
        },
      },
    });

    if (!member) {
      return { status: 404, error: new Error("Member not found") };
    }

    let availability: any[] = [];
    if (member.info?.status === "Partner") {
      availability = await prisma.availability.findMany({
        where: { userId: id },
        orderBy: { start: "asc" },
      });
    }

    // События
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: id },
      include: { event: true },
    });

    const now = new Date();
    const registeredEvents = registrations.map((r) => r.event);

    const visitedEvents = registeredEvents.filter((ev) => ev.date < now);
    const upcomingEvents = registeredEvents.filter((ev) => ev.date >= now);

    const createdEvents = await prisma.event.findMany({
      where: { organizerId: id },
    });

    return {
      member,
      registeredEvents,
      visitedEvents,
      upcomingEvents,
      createdEvents,
      currentUserId,
      availability,
    };
  } catch (err) {
    console.error("Error loading member:", err);
    return { status: 500, error: new Error("Internal server error") };
  }
};
