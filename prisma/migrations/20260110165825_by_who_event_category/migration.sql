-- CreateEnum
CREATE TYPE "ByWho" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "EventCategory" ADD COLUMN     "byWho" "ByWho";
