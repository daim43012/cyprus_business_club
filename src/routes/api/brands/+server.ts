import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { verifyJwt } from '$lib/jwt';
import fs from 'fs';
import path from 'path';
import { brandAnswersTemplateV1 } from '$lib/utils/brandAnswersTemplateV1';

const uploadDir = path.resolve('static/uploads/brands');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function deepMerge(t: any, d: any) {
  if (d === undefined) return t;
  if (t === null || typeof t !== 'object') return d;
  if (Array.isArray(t)) return Array.isArray(d) ? d : t;

  const out: any = { ...t };
  for (const k of Object.keys(t)) out[k] = deepMerge(t[k], d?.[k]);
  for (const k of Object.keys(d || {})) if (!(k in out)) out[k] = d[k];
  return out;
}

export const POST: RequestHandler = async ({ cookies, request }: RequestEvent) => {
  console.log('[POST /api/brands] start');

  const token = cookies.get('auth_token');
  if (!token) {
    console.warn('[POST /api/brands] no token');
    return new Response(JSON.stringify({ error: 'Unauthorized: no token' }), { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload?.uid) {
    console.warn('[POST /api/brands] invalid token');
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }

  const user = await prisma.cbcUser.findUnique({ where: { id: payload.uid } });
  if (!user) {
    console.warn('[POST /api/brands] user not found', payload.uid);
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (e) {
    console.error('[POST /api/brands] formData parse error', e);
    return new Response(JSON.stringify({ error: 'Invalid formData' }), { status: 400 });
  }

  const name = String(formData.get('name') || '').trim();
  const website = String(formData.get('website') || '').trim() || null;

  const typeRaw = String(formData.get('type') || '').trim().toUpperCase();
  if (typeRaw !== 'PERSONAL' && typeRaw !== 'COMPANY') {
    return new Response(JSON.stringify({ error: 'Invalid brand type' }), { status: 400 });
  }
  const brandType = typeRaw; 

  const categoryIdsRaw = formData.get('categoryIds');
  const answersRaw = formData.get('answers');
  const tagIdsRaw = formData.get('tagIds'); 

  let categoryIds: string[] = [];
  let tagIds: string[] = [];
  let incomingAnswers: any = {};

  try {
    categoryIds = categoryIdsRaw ? JSON.parse(String(categoryIdsRaw)) : [];
    if (!Array.isArray(categoryIds)) categoryIds = [];
    categoryIds = categoryIds.filter((x) => typeof x === 'string' && x.trim().length > 0);
  } catch (e) {
    console.warn('[POST /api/brands] categoryIds JSON parse error', e);
    return new Response(JSON.stringify({ error: 'categoryIds must be valid JSON array' }), {
      status: 400
    });
  }

  try {
    incomingAnswers = answersRaw ? JSON.parse(String(answersRaw)) : {};
    if (incomingAnswers === null || typeof incomingAnswers !== 'object') incomingAnswers = {};
  } catch (e) {
    console.warn('[POST /api/brands] answers JSON parse error', e);
    return new Response(JSON.stringify({ error: 'answers must be valid JSON object' }), {
      status: 400
    });
  }

  try {
    tagIds = tagIdsRaw ? JSON.parse(String(tagIdsRaw)) : [];
    if (!Array.isArray(tagIds)) tagIds = [];
    tagIds = tagIds
      .filter((x) => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim());

    tagIds = Array.from(new Set(tagIds));
  } catch (e) {
    console.warn('[POST /api/brands] tagIds JSON parse error', e);
    return new Response(JSON.stringify({ error: 'tagIds must be valid JSON array' }), {
      status: 400
    });
  }

  if (!name) {
    console.warn('[POST /api/brands] empty name');
    return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 });
  }

  const file = formData.get('logo') as File | null;

  let logoUrl: string | null = null;

  if (file && file.size > 0) {
    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Logo must be an image' }), { status: 400 });
    }

    const fileExt = path.extname(file.name) || `.${file.type.split('/')[1] || 'png'}`;
    const fileName = `${payload.uid}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    logoUrl = `/uploads/brands/${fileName}`;
  }

  console.log('[POST /api/brands] parsed:', {
    name,
    website,
    type: brandType,
    logoUrl,
    categoryIdsCount: categoryIds.length,
    tagIdsCount: tagIds.length
  });

  const answers = deepMerge(brandAnswersTemplateV1, incomingAnswers);

  try {
    console.log('[POST /api/brands] creating brand in DB...');

    const existingTags = tagIds.length
      ? await prisma.brandTag.findMany({ where: { id: { in: tagIds }, isActive: true }, select: { id: true } })
      : [];
    const safeTagIds = new Set(existingTags.map((t) => t.id));
    const finalTagIds = tagIds.filter((id) => safeTagIds.has(id));

    const brand = await prisma.brand.create({
      data: {
        ownerId: user.id,
        type: brandType as any, 
        name,
        logoUrl,
        website,
        answers,

        categories: categoryIds.length ? { connect: categoryIds.map((id) => ({ id })) } : undefined,

        tags: tagIds.length
          ? {
              createMany: {
                data: tagIds.map((id) => ({ tagId: id })),
                skipDuplicates: true
              }
            }
          : undefined
      },
      include: {
        categories: true,
        tags: { include: { tag: true } } 
      }
    });

    console.log('[POST /api/brands] brand created:', brand.id);

    return new Response(JSON.stringify({ brand }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    console.error('[POST /api/brands] DB error:', {
      message: e?.message,
      code: e?.code,
      meta: e?.meta
    });

    return new Response(JSON.stringify({ error: 'Failed to create brand', details: e?.message }), {
      status: 500
    });
  }
};
