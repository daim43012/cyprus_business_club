import type { RequestEvent } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { hashPassword } from "$lib/crypto";
import { signJwt } from "$lib/jwt";
import { createUniqueReferralCode } from "$lib/utils/createUniqueReferralCode";

export const POST = async ({ request, cookies }: RequestEvent) => {
  try {
    const { email, password, name, referral } = await request.json();

    if (!email || !password) {
      return new Response("Email and password are required", { status: 400 });
    }

    const existingUser = await prisma.cbcUser.findUnique({ where: { email } });
    if (existingUser) {
      return new Response("User already exists", { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const ownReferralCode = await createUniqueReferralCode();

    const user = await prisma.cbcUser.create({
      data: {
        email,
        password: hashedPassword,

        referralId: ownReferralCode,

        invitedBy: referral
          ? { connect: { referralId: referral } }
          : undefined,

        settings: {
          create: {
            isPrivate: false,
            emailSend: false,
            chatBotSend: false,
          },
        },
        info: {
          create: {
            status: "Member",
            name,
          },
        },
      },
      include: {
        settings: true,
        info: true,
      },
    });

    await prisma.cbcUser.update({
      where: { id: user.id },
      data: { infoId: user.info!.id },
    });

    const token = await signJwt({ uid: user.id, email: user.email });

    cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    cookies.delete("ref", { path: "/" });

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          referralId: user.referralId, 
          info: user.info,
          settings: user.settings,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
