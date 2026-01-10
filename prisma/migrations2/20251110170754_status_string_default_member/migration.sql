/*
  Warnings:

  - Made the column `status` on table `CbcUserInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CbcUserInfo" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Member';
