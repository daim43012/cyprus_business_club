-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('TRAINING_VIDEO');

-- CreateTable
CREATE TABLE "SpiritTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productType" "ProductType",
    "productId" TEXT,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpiritTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpiritTransaction_userId_createdAt_idx" ON "SpiritTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SpiritTransaction_productType_productId_idx" ON "SpiritTransaction"("productType", "productId");

-- AddForeignKey
ALTER TABLE "SpiritTransaction" ADD CONSTRAINT "SpiritTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SpiritUsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
