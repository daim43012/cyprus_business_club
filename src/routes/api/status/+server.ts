import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/prisma';

// GET — получить всех пользователей
export const GET: RequestHandler = async () => {
  try {
    const users = await prisma.cbcUser.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        info: true
      }
    });

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST — изменить статус пользователя
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userId, status } = await request.json();

    if (!userId || !status) {
      return new Response(
        JSON.stringify({ error: 'userId and status are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Проверяем, что пользователь существует
    const existingUser = await prisma.cbcUser.findUnique({
      where: { id: userId },
      include: { info: true }
    });

    if (!existingUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Если инфо не существует — создаём
    if (!existingUser.info) {
      await prisma.cbcUserInfo.create({
        data: {
          user: { connect: { id: userId } },
          status
        }
      });
    } else {
      // Обновляем только статус
      await prisma.cbcUserInfo.update({
        where: { id: existingUser.info.id },
        data: { status }
      });
    }

    return new Response(
      JSON.stringify({ success: true, userId, status }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error updating user status:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
