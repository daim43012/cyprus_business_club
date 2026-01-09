import type { PageServerLoad } from './$types';
import prisma from '$lib/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { id } = params;

  if (!id) {
    return {
      status: 400,
      error: new Error('Event ID is required'),
    };
  }

  // 1. Загружаем сам ивент
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      categories: true,
      organizer: {
        include: {
          info: true
        }
      },
      // 🔥 Добавляем участников
      registrations: {
        include: {
          user: {
            include: { info: true }
          }
        }
      }
    }
  });

  if (!event) {
    return {
      status: 404,
      error: new Error('Event not found'),
    };
  }

  // 2. Количество участников
  const attendeesCount = event.registrations.length;

  // 3. Определяем, зарегистрирован ли текущий пользователь
  let isRegistered = false;

  if (locals.user) {
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: locals.user.id,
          eventId: id
        }
      }
    });

    isRegistered = Boolean(registration);
  }

  return {
    event,
    attendees: event.registrations.map((r) => r.user),
    attendeesCount,
    isRegistered
  };
};
