/*
  Warnings:

  - A unique constraint covering the columns `[telegram]` on the table `SpiritUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SpiritUsers" ADD COLUMN     "telegram" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SpiritUsers_telegram_key" ON "SpiritUsers"("telegram");
