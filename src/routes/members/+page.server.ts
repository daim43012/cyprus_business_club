import type { PageServerLoad } from "./$types";
import prisma from "$lib/prisma";
import { error as kitError } from "@sveltejs/kit";
import { verifyJwt } from "$lib/jwt";

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    // 1) Основной список публичных пользователей
    const members = await prisma.cbcUser.findMany({
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
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
      orderBy: {
        // можешь поменять сортировку как хочешь
        // например по популярности:
        followers: { _count: "desc" } as any,
      },
    });

    let recommendedMembers: typeof members = [];

    const token = cookies.get("auth_token");
    if (token) {
      const payload = await verifyJwt(token).catch(() => null);

      if (payload?.uid) {
        const me = await prisma.cbcUser.findUnique({
          where: { id: payload.uid },
          select: {
            id: true,
            interests: {
              select: { id: true },
            },
          },
        });

        const myInterestIds = (me?.interests ?? []).map((i) => i.id);

        if (myInterestIds.length > 0) {
          recommendedMembers = await prisma.cbcUser.findMany({
            where: {
              id: { not: payload.uid }, 
              settings: { isPrivate: false },
              interests: {
                some: {
                  id: { in: myInterestIds },
                },
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
              _count: {
                select: {
                  followers: true,
                  following: true,
                },
              },
            },
            take: 8, 
            orderBy: {
              followers: { _count: "desc" } as any,
            },
          });
        }
      }
    }

    return { members, recommendedMembers };
  } catch (e) {
    console.error("Error fetching members:", e);
    throw kitError(500, "Internal server error");
  }
};
