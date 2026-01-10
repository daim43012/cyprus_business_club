-- CreateTable
CREATE TABLE "SmartEvent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "coverImage" TEXT,
    "gallery" JSONB,
    "links" JSONB,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmartEvent_slug_key" ON "SmartEvent"("slug");

-- CreateIndex
CREATE INDEX "SmartEvent_eventDate_idx" ON "SmartEvent"("eventDate");

-- CreateIndex
CREATE INDEX "SmartEvent_createdAt_idx" ON "SmartEvent"("createdAt");
