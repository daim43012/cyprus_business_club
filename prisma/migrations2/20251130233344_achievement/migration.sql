-- CreateEnum
CREATE TYPE "AchievementKind" AS ENUM ('ONE_OFF', 'PROGRESS', 'SEASONAL');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('Common', 'Rare', 'Epic', 'Legendary', 'Mythic');

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "kind" "AchievementKind" NOT NULL DEFAULT 'PROGRESS',
    "tier" "Tier",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requirement" TEXT,
    "levelsJson" JSONB,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE INDEX "Achievement_kind_idx" ON "Achievement"("kind");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_achievementId_idx" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_level_idx" ON "UserAchievement"("achievementId", "level");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_level_key" ON "UserAchievement"("userId", "achievementId", "level");

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CbcUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
