/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `EventRegistration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CbcPaymentProvider" AS ENUM ('PAYPAL', 'STRIPE', 'CRYPTO');

-- CreateEnum
CREATE TYPE "CbcTransactionStatus" AS ENUM ('CREATED', 'PENDING_CONFIRMATION', 'CAPTURED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CbcTransactionType" AS ENUM ('EVENT_REGISTRATION');

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "transactionId" TEXT;

-- CreateTable
CREATE TABLE "CbcTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CbcTransactionType" NOT NULL DEFAULT 'EVENT_REGISTRATION',
    "provider" "CbcPaymentProvider" NOT NULL,
    "status" "CbcTransactionStatus" NOT NULL DEFAULT 'CREATED',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "providerPaymentId" TEXT,
    "rawDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CbcTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CbcTransaction_userId_idx" ON "CbcTransaction"("userId");

-- CreateIndex
CREATE INDEX "CbcTransaction_provider_providerPaymentId_idx" ON "CbcTransaction"("provider", "providerPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_transactionId_key" ON "EventRegistration"("transactionId");

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "CbcTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcTransaction" ADD CONSTRAINT "CbcTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CbcUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
