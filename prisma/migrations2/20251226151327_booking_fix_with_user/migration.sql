/*
  Warnings:

  - You are about to drop the column `clientEmail` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `clientName` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Booking_startAt_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "clientEmail",
DROP COLUMN "clientName",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Booking_userId_startAt_idx" ON "Booking"("userId", "startAt");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SmartComplianceUsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
