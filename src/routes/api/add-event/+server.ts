import type { RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import type { Prisma } from "@prisma/client";

type AgendaItem = {
  index: number;
  start: string;
  end?: string;
  title: string;
  description?: string;
};

function isValidTimeHHMM(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeAgenda(raw: unknown): AgendaItem[] {
  if (!Array.isArray(raw)) throw new Error("agenda must be an array");

  const items: AgendaItem[] = raw.map((x, i) => {
    if (typeof x !== "object" || x === null) throw new Error(`agenda[${i}] invalid`);

    const obj = x as Record<string, unknown>;

    const index =
      typeof obj.index === "number" && Number.isFinite(obj.index) ? obj.index : i + 1;

    const start = String(obj.start ?? "").trim();
    const endRaw = obj.end == null ? "" : String(obj.end).trim();
    const end = endRaw ? endRaw : undefined;

    const title = String(obj.title ?? "").trim();
    const descriptionRaw = obj.description == null ? "" : String(obj.description).trim();
    const description = descriptionRaw ? descriptionRaw : undefined;

    if (!isValidTimeHHMM(start)) throw new Error(`agenda[${i}].start invalid`);
    if (end && !isValidTimeHHMM(end)) throw new Error(`agenda[${i}].end invalid`);
    if (!title) throw new Error(`agenda[${i}].title invalid`);

    return { index, start, end, title, description };
  });

  items.sort((a, b) => a.index - b.index);
  return items.map((it, idx) => ({ ...it, index: idx + 1 }));
}

function safeFloat(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get("auth_token");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload || !payload.uid) {
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
  }

  try {
    const formData = await request.formData();

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const dateStr = String(formData.get("date") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();

    const price = safeFloat(formData.get("price"));
    const latitude = safeFloat(formData.get("latitude"));
    const longitude = safeFloat(formData.get("longitude"));

    const categories = formData.getAll("categories").map(String).filter(Boolean);

    let agendaJson: Prisma.InputJsonValue | undefined = undefined;
    const agendaRaw = formData.get("agenda");
    if (agendaRaw != null && String(agendaRaw).trim()) {
      try {
        const parsed = JSON.parse(String(agendaRaw));
        const normalized = normalizeAgenda(parsed);
        agendaJson = normalized as unknown as Prisma.InputJsonValue;
      } catch {
        return new Response(JSON.stringify({ error: "Invalid agenda JSON" }), { status: 400 });
      }
    }

    if (!title || !description || !dateStr || !location || categories.length === 0) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const eventDate = new Date(dateStr);
    if (Number.isNaN(eventDate.getTime())) {
      return new Response(JSON.stringify({ error: "Invalid date" }), { status: 400 });
    }

    const photoFile = formData.get("photo") as File | null;
    const documentFile = formData.get("document") as File | null;

    let photoPath: string | null = null;
    let documentPath: string | null = null;

    if (photoFile && photoFile.size > 0) {
      const bytes = Buffer.from(await photoFile.arrayBuffer());
      const fileName = `${randomUUID()}-${photoFile.name}`;
      const uploadDir = path.join(process.cwd(), "static", "uploads", "events");
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, fileName), bytes);
      photoPath = `/uploads/events/${fileName}`;
    }

    if (documentFile && documentFile.size > 0) {
      const bytes = Buffer.from(await documentFile.arrayBuffer());
      const fileName = `${randomUUID()}-${documentFile.name}`;
      const uploadDir = path.join(process.cwd(), "static", "uploads", "docs");
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, fileName), bytes);
      documentPath = `/uploads/docs/${fileName}`;
    }

    // ✅ Создаём чат + ивент + добавляем организатора в чат в одной транзакции
    const result = await prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {}
      });

      const event = await tx.event.create({
        data: {
          title,
          description,
          date: eventDate,
          location,
          price,
          photo: photoPath,
          documentPath,
          organizerId: payload.uid,
          latitude,
          longitude,

          // ✅ привязка к чату
          chatId: chat.id,

          ...(agendaJson !== undefined ? { agenda: agendaJson } : {}),

          categories: {
            connect: categories.map((id) => ({ id }))
          }
        },
        include: { categories: true }
      });

      // ✅ организатор сразу участник чата (admin)
      await tx.chatParticipant.create({
        data: {
          chatId: chat.id,
          userId: payload.uid,
          role: "admin"
        }
      });

      return { chat, event };
    });

    return new Response(
      JSON.stringify({ success: true, event: result.event, chatId: result.chat.id }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating event:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
