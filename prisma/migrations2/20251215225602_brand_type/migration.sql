-- CreateEnum
CREATE TYPE "BrandType" AS ENUM ('PERSONAL', 'COMPANY');

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "type" "BrandType" NOT NULL DEFAULT 'COMPANY';

-- CreateIndex
CREATE INDEX "Brand_type_idx" ON "Brand"("type");
