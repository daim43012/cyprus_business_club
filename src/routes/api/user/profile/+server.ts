import type { RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";
import fs from "fs";
import path from "path";

const uploadDir = path.resolve("static/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const GET: RequestHandler = async ({ cookies }) => {
  const token = cookies.get("auth_token");
  if (!token) return json({ error: "Unauthorized: no token" }, 401);

  const payload = await verifyJwt(token);
  if (!payload?.uid) return json({ error: "Invalid token" }, 401);

  try {
    const [user, categories] = await Promise.all([
      prisma.cbcUser.findUnique({
        where: { id: payload.uid },
        select: {
          id: true,
          email: true,
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
          // ✅ добавили interests
          interests: {
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          },
        },
      }),
      // ✅ добавили список категорий для dropdown
      prisma.eventCategory.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    if (!user) return json({ error: "User not found" }, 404);

    // ✅ не ломаем старый контракт: возвращаем user как раньше,
    // и ДОБАВЛЯЕМ categories (новое поле)
    return json({ ...user, categories });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return json({ error: "Internal server error" }, 500);
  }
};

export const POST: RequestHandler = async ({ cookies, request }) => {
  const token = cookies.get("auth_token");
  if (!token) return json({ error: "Unauthorized: no token" }, 401);

  const payload = await verifyJwt(token);
  if (!payload?.uid) return json({ error: "Invalid token" }, 401);

  const formData = await request.formData();

  // ✅ поля могут не прийти (например, ты сохраняешь только interests)
  const fullName = formData.get("fullName");
  const dob = formData.get("dob");
  const location = formData.get("location");
  const phone = formData.get("phone");
  const bio = formData.get("bio");
  const isPrivateRaw = formData.get("isPrivate"); // "true"/"false"/null
  const file = formData.get("photo") as File | null;

  // ✅ categoryIds: JSON строка '["id1","id2"]' (или может не прийти)
  const categoryIdsRaw = formData.get("categoryIds") as string | null;
  let categoryIds: string[] | null = null;
  if (categoryIdsRaw) {
    try {
      const parsed = JSON.parse(categoryIdsRaw);
      if (Array.isArray(parsed)) {
        categoryIds = parsed
          .filter((x) => typeof x === "string" && x.length > 0);
      }
    } catch {
      categoryIds = null; // игнорируем мусор
    }
  }

  let photoUrl: string | null = null;

  if (file && file.size > 0) {
    const fileExt = path.extname(file.name);
    const fileName = `${payload.uid}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    photoUrl = `/uploads/${fileName}`;
  }

  // ✅ Собираем update так, чтобы НЕ перетирать старые поля, если их не передали
  const infoCreateUpdate: any = {};
  if (typeof fullName === "string") infoCreateUpdate.name = fullName;
  if (typeof dob === "string") infoCreateUpdate.dateOfBirth = dob ? new Date(dob) : null;
  if (typeof location === "string") infoCreateUpdate.location = location;
  if (typeof phone === "string") infoCreateUpdate.phoneNumber = phone;
  if (typeof bio === "string") infoCreateUpdate.bio = bio;
  if (photoUrl) infoCreateUpdate.photo = photoUrl;

  const dataToUpdate: any = {};

  // ✅ info upsert только если реально есть что обновлять/создавать
  if (Object.keys(infoCreateUpdate).length > 0) {
    dataToUpdate.info = {
      upsert: {
        create: infoCreateUpdate,
        update: infoCreateUpdate,
      },
    };
  }

  // ✅ settings: обновляем isPrivate только если его прислали
  if (typeof isPrivateRaw === "string") {
    const isPrivate = isPrivateRaw === "true";
    dataToUpdate.settings = {
      upsert: {
        create: { isPrivate },
        update: { isPrivate },
      },
    };
  }

  // ✅ interests: обновляем только если прислали categoryIds
  if (categoryIds !== null) {
    dataToUpdate.interests = {
      set: categoryIds.map((id) => ({ id })),
    };
  }

  // Если вообще ничего не прислали — возвращаем текущего юзера (чтобы фронт не падал)
  if (Object.keys(dataToUpdate).length === 0) {
    const current = await prisma.cbcUser.findUnique({
      where: { id: payload.uid },
      select: {
        id: true,
        email: true,
        info: true,
        settings: true,
        interests: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
    });
    return json(current);
  }

  try {
    const updated = await prisma.cbcUser.update({
      where: { id: payload.uid },
      data: dataToUpdate,
      include: {
        info: true,
        settings: true,
        interests: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
    });

    return json(updated);
  } catch (err) {
    console.error("Error updating user profile:", err);
    return json({ error: "Internal server error" }, 500);
  }
};
