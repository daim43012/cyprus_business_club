/*
  Warnings:

  - A unique constraint covering the columns `[bcgameid]` on the table `KrasavaUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "KrasavaUsers" ADD COLUMN     "bcgameid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "KrasavaUsers_bcgameid_key" ON "KrasavaUsers"("bcgameid");
