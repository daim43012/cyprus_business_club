import prisma from "../src/lib/prisma.js";

const TICK_MS = 10_000;

function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

function normalizeLevels(levelsJson, achCode = "UNKNOWN") {

  if (!levelsJson) return [];
  if (Array.isArray(levelsJson)) return levelsJson;

  try {
    const parsed = JSON.parse(levelsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.log(`   [levels:${achCode}] parse error:`, e.message);
    return [];
  }
}

async function grantLevels({ userId, achievementId, code, levelsToGrant }) {

  if (!levelsToGrant.length) {
    // console.log(`      [grant:${code}] nothing to grant`);
    return;
  }

  const res = await prisma.userAchievement.createMany({
    data: levelsToGrant.map((lvl) => ({
      userId,
      achievementId,
      level: lvl,
    })),
    skipDuplicates: true,
  });

//   console.log(`      [grant:${code}] createMany result=`, res);
}

async function processUser(user, achievementsByCode) {
  const inviteAch = achievementsByCode["INVITED_FRIENDS"];
  const eventsAch = achievementsByCode["EVENTS_VISITED"];
  const createAch = achievementsByCode["CREATE_WALLET"];

  if (inviteAch) {
    const invitedCount = user._count.invitedUsers ?? 0;

    const levels = normalizeLevels(inviteAch.levelsJson, "INVITED_FRIENDS");

    const shouldHaveLevels = levels
      .filter((l) => invitedCount >= Number(l.target))
      .map((l) => Number(l.level));

    const alreadyLevels = new Set(
      user.achievements
        .filter((ua) => ua.achievementId === inviteAch.id)
        .map((ua) => ua.level)
    );

    const toGrant = shouldHaveLevels.filter((lvl) => !alreadyLevels.has(lvl));

    await grantLevels({
      userId: user.id,
      achievementId: inviteAch.id,
      code: "INVITED_FRIENDS",
      levelsToGrant: toGrant,
    });
  } else {
    // console.log(`\n   [INVITED_FRIENDS] NOT FOUND among active achievements`);
  }

  if (eventsAch) {
    const eventsCount = user._count.registrations ?? 0;

    const levels = normalizeLevels(eventsAch.levelsJson, "EVENTS_VISITED");

    const shouldHaveLevels = levels
      .filter((l) => eventsCount >= Number(l.target))
      .map((l) => Number(l.level));

    const alreadyLevels = new Set(
      user.achievements
        .filter((ua) => ua.achievementId === eventsAch.id)
        .map((ua) => ua.level)
    );

    const toGrant = shouldHaveLevels.filter((lvl) => !alreadyLevels.has(lvl));

    await grantLevels({
      userId: user.id,
      achievementId: eventsAch.id,
      code: "EVENTS_VISITED",
      levelsToGrant: toGrant,
    });
  } else {
    // console.log(`\n   [EVENTS_VISITED] NOT FOUND among active achievements`);
  }

  if (createAch) {
    const hasWallet = !!user.info?.custodyAddress;

    if (hasWallet) {
      const alreadyHas = user.achievements.some(
        (ua) => ua.achievementId === createAch.id && ua.level === 1
      );

      if (!alreadyHas) {
        await grantLevels({
          userId: user.id,
          achievementId: createAch.id,
          code: "CREATE_WALLET",
          levelsToGrant: [1],
        });
      } else {
        // console.log(`   [CREATE_WALLET] skip: already granted`);
      }
    } else {
    //   console.log(`   [CREATE_WALLET] skip: custodyAddress is null`);
    }
  } else {
    // console.log(`\n   [CREATE_WALLET] NOT FOUND among active achievements`);
  }

}

async function tick() {

  try {
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        kind: true,
        tier: true,
        requirement: true,
        levelsJson: true,
      },
    });

    achievements.forEach((a) => {
    
    });

    const achievementsByCode = {};
    for (const a of achievements) {
      achievementsByCode[normalizeCode(a.code)] = a;
    }

    const users = await prisma.cbcUser.findMany({
      select: {
        id: true,
        info: { select: { custodyAddress: true } },
        achievements: {
          select: { achievementId: true, level: true, earnedAt: true },
        },
        _count: {
          select: {
            invitedUsers: true,
            registrations: true,
          },
        },
      },
    });

    for (const user of users) {
      await processUser(user, achievementsByCode);
    }

  } catch (e) {
    console.error(`[error] tick failed:`, e);
  }
}

console.log("Achievements worker started. Interval:", TICK_MS, "ms");
tick();
setInterval(tick, TICK_MS);

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
