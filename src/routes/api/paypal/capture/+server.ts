import type { RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { verifyJwt } from "$lib/jwt";
import { capturePaypalOrder } from "$lib/server/paypal";
import { createNotification } from "$lib/services/notifications";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get("auth_token");
  if (!token) return new Response("Unauthorized", { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload?.uid) return new Response("Invalid token", { status: 401 });

  const { paypalOrderId, eventId } = await request.json();
  if (!paypalOrderId) return new Response("Missing paypalOrderId", { status: 400 });
  if (!eventId) return new Response("Missing eventId", { status: 400 });

  // берём цену из базы (источник истины)
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: { include: { info: true } } },
  });
  if (!event) return new Response("Event not found", { status: 404 });

  const price = event.price ?? 0;
  if (price <= 0) {
    // если ивент бесплатный — можно сразу создать регистрацию без PayPal
    const reg = await prisma.eventRegistration.upsert({
      where: { userId_eventId: { userId: payload.uid, eventId } },
      update: {},
      create: { userId: payload.uid, eventId },
    });

    return new Response(JSON.stringify({ success: true, registrationId: reg.id, already: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Идемпотентность по providerPaymentId:
  // если этот orderId уже был записан — просто вернём success
  const existingTx = await prisma.cbcTransaction.findFirst({
    where: {
      userId: payload.uid,
      provider: "PAYPAL",
      providerPaymentId: paypalOrderId,
      status: "CAPTURED",
    },
  });

  if (existingTx) {
    const existingReg = await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId: payload.uid, eventId } },
    });

    return new Response(
      JSON.stringify({
        success: true,
        registrationId: existingReg?.id ?? null,
        already: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Capture
  const capRes = await capturePaypalOrder(paypalOrderId);
  console.log("🟢 PAYPAL CAPTURE RESULT:", capRes.json);

  const completed = capRes.ok && capRes.json?.status === "COMPLETED";
  if (!completed) {
    return new Response(JSON.stringify({ success: false, paypal: capRes.json }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ✅ СРАЗУ создаём CAPTURED transaction + регистрацию
  const out = await prisma.$transaction(async (p) => {
    // создаём транзакцию CAPTURED
    const tx = await p.cbcTransaction.create({
      data: {
        userId: payload.uid,
        type: "EVENT_REGISTRATION",
        provider: "PAYPAL",
        status: "CAPTURED",
        amount: price,
        currency: "EUR",
        providerPaymentId: paypalOrderId,
        rawDetails: { eventId, paypalCapture: capRes.json },
      },
    });

    // регистрация (idempotent по @@unique([userId,eventId]))
    const reg = await p.eventRegistration.upsert({
      where: { userId_eventId: { userId: payload.uid, eventId } },
      update: { transactionId: tx.id },
      create: { userId: payload.uid, eventId, transactionId: tx.id },
    });

    return { txId: tx.id, registrationId: reg.id };
  });

  // Notifications
  await createNotification({
    userId: payload.uid,
    emoji: "📅",
    textKey: `You successfully registered for the event "${event.title}"`,
    link: `/events/${eventId}`,
    type: "event_registration",
  });

  if (event.organizerId && event.organizerId !== payload.uid) {
    const participant = await prisma.cbcUser.findUnique({
      where: { id: payload.uid },
      include: { info: true },
    });

    const participantName = participant?.info?.name || participant?.email || "New User";

    await createNotification({
      userId: event.organizerId,
      emoji: "🙋‍♂️",
      textKey: `${participantName} registered for your event "${event.title}"`,
      link: `/events/${eventId}`,
      type: "new_participant",
    });
  }

  return new Response(JSON.stringify({ success: true, ...out }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
