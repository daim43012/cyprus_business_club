-- CreateTable
CREATE TABLE "TrainingVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationSec" INTEGER,
    "price" INTEGER NOT NULL DEFAULT 0,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TrainingVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingVideo_isActive_createdAt_idx" ON "TrainingVideo"("isActive", "createdAt");
