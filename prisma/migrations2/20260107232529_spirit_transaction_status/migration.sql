-- AlterTable
ALTER TABLE "SpiritTransaction" ADD COLUMN     "providerPaymentId" TEXT,
ADD COLUMN     "rawDetails" JSONB,
ADD COLUMN     "status" TEXT;

-- CreateIndex
CREATE INDEX "SpiritTransaction_providerPaymentId_idx" ON "SpiritTransaction"("providerPaymentId");
