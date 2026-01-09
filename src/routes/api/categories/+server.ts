import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/prisma';

export const GET: RequestHandler = async () => {
  try {
    const categories = await prisma.eventCategory.findMany({
      orderBy: { name: 'asc' }
    });

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Category name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = await prisma.eventCategory.findUnique({
      where: { name }
    });

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Category already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const category = await prisma.eventCategory.create({
      data: { name }
    });

    return new Response(JSON.stringify(category), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error creating category:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
