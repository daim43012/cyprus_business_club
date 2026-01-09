/*
  Warnings:

  - Added the required column `imageUrl` to the `TrainingVideo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TrainingVideo" ADD COLUMN     "imageUrl" TEXT NOT NULL;
