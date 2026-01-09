import prisma from "$lib/prisma";
import { generateReferralCode } from "./generateReferral";

export async function createUniqueReferralCode() {
  while (true) {
    const code = generateReferralCode(6);

    const existing = await prisma.cbcUser.findFirst({
      where: { referralId: code }
    });

    if (!existing) return code;
  }
}
