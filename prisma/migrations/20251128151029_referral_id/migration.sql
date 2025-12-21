/*
  Warnings:

  - A unique constraint covering the columns `[referralId]` on the table `CbcUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CbcUser" ADD COLUMN     "invitedById" TEXT,
ADD COLUMN     "referralId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CbcUser_referralId_key" ON "CbcUser"("referralId");

-- AddForeignKey
ALTER TABLE "CbcUser" ADD CONSTRAINT "CbcUser_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "CbcUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
