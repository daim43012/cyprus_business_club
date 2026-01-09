import type { PageServerLoad } from "./$types";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get("auth_token");
  if (!token) throw redirect(302, "/login");

  const payload = await verifyJwt(token);
  if (!payload?.uid) throw redirect(302, "/login");

  const uid = payload.uid;

  const [user, categories, tickets] = await Promise.all([
    prisma.cbcUser.findUnique({
      where: { id: uid },
      select: {
        id: true,
        email: true,
        createdAt: true,
        info: {
          select: {
            name: true,
            photo: true,
            dateOfBirth: true,
            location: true,
            phoneNumber: true,
            status: true,
            bio: true,
          },
        },
        settings: {
          select: { isPrivate: true, emailSend: true, chatBotSend: true },
        },
        interests: {
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        },
      },
    }),

    prisma.eventCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),

    prisma.eventRegistration.findMany({
      where: {
        userId: uid,
        event: { date: { gt: new Date() } },
      },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) throw redirect(302, "/login");

  return {
    user,
    categories,
    tickets,
  };
};
