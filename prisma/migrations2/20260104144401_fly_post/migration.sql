-- CreateTable
CREATE TABLE "FlyPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "image" TEXT,
    "speakers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlyPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlyPost_slug_key" ON "FlyPost"("slug");

-- CreateIndex
CREATE INDEX "FlyPost_createdAt_idx" ON "FlyPost"("createdAt");
