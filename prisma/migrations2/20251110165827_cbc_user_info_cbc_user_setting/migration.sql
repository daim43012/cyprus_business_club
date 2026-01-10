/*
  Warnings:

  - You are about to drop the column `name` on the `CbcUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[infoId]` on the table `CbcUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CbcUser" DROP COLUMN "name",
ADD COLUMN     "infoId" TEXT;

-- CreateTable
CREATE TABLE "CbcUserInfo" (
    "id" TEXT NOT NULL,
    "status" TEXT,
    "photo" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "name" TEXT,
    "location" TEXT,
    "phoneNumber" TEXT,

    CONSTRAINT "CbcUserInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CbcUserSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "emailSend" BOOLEAN NOT NULL DEFAULT false,
    "chatBotSend" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CbcUserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CbcUserSetting_userId_key" ON "CbcUserSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CbcUser_infoId_key" ON "CbcUser"("infoId");

-- AddForeignKey
ALTER TABLE "CbcUser" ADD CONSTRAINT "CbcUser_infoId_fkey" FOREIGN KEY ("infoId") REFERENCES "CbcUserInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcUserSetting" ADD CONSTRAINT "CbcUserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CbcUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
