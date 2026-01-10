/*
  Warnings:

  - A unique constraint covering the columns `[custodyAddress]` on the table `CbcUserInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CbcUserInfo" ADD COLUMN     "custodyAddress" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CbcUserInfo_custodyAddress_key" ON "CbcUserInfo"("custodyAddress");
