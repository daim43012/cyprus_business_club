-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('OFFLINE', 'ONLINE');

-- CreateTable
CREATE TABLE "SpiritEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "agenda" TEXT,
    "format" "EventFormat" NOT NULL DEFAULT 'OFFLINE',
    "location" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "coverUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpiritEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpiritEvent_isActive_startAt_idx" ON "SpiritEvent"("isActive", "startAt");
