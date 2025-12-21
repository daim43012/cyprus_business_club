/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "chatId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_chatId_key" ON "Event"("chatId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
