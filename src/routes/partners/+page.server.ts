import type { PageServerLoad } from './$types';
import prisma from '$lib/prisma';

export const load: PageServerLoad = async () => {
  const brands = await prisma.brand.findMany({
    where: {
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      logoUrl: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return { brands };
};
