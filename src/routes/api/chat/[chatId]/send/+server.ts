import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { verifyJwt } from '$lib/jwt';
import { writeFile } from 'fs/promises';
import path from 'path';

export const POST = async ({ params, request, cookies }: RequestEvent) => {
  try {
    const chatId = params.chatId;
    if (!chatId) return new Response('Missing chatId', { status: 400 });

    const token = cookies.get('auth_token');
    if (!token) return new Response('Unauthorized', { status: 401 });

    const payload = await verifyJwt(token);
    const senderId = payload?.uid;
    if (!senderId) return new Response('Invalid token', { status: 401 });

    // ---- multipart/form-data ----
    const form = await request.formData();

    let content = form.get("content")?.toString() || "";
    const file = form.get("file") as File | null;

    // ---- Сохранение файла ----
    if (file) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const uploadDir = "static/uploads";
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = path.join(uploadDir, fileName);
console.log("CWD:", process.cwd());
console.log("Saving to:", uploadDir);

      await writeFile(filePath, bytes);

      // ВАЖНО: content теперь = URL файла
      content = `/uploads/${fileName}`;
    }

    if (!content.trim()) {
      return new Response("Empty content", { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content
      }
    });

    // ---- непрочитанные ----
    const participants = await prisma.chatParticipant.findMany({
      where: { chatId },
      select: { userId: true }
    });

    const unreadEntries = participants
      .filter(p => p.userId !== senderId)
      .map(p => ({
        messageId: message.id,
        userId: p.userId
      }));

    if (unreadEntries.length > 0) {
      await prisma.messageRead.createMany({ data: unreadEntries });
    }

    return new Response(JSON.stringify({ ok: true }));

  } catch (err) {
    console.error("Message send error:", err);
    return new Response("Internal server error", { status: 500 });
  }
};
