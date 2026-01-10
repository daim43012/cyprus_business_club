-- CreateEnum
CREATE TYPE "BrandTagType" AS ENUM ('AUDIENCE', 'PAIN', 'SOLUTION', 'MONETIZATION', 'CLIENT');

-- CreateTable
CREATE TABLE "BrandTag" (
    "id" TEXT NOT NULL,
    "type" "BrandTagType" NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandTagOnBrand" (
    "brandId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BrandTagOnBrand_pkey" PRIMARY KEY ("brandId","tagId")
);

-- CreateIndex
CREATE INDEX "BrandTag_type_idx" ON "BrandTag"("type");

-- CreateIndex
CREATE UNIQUE INDEX "BrandTag_type_title_key" ON "BrandTag"("type", "title");

-- CreateIndex
CREATE INDEX "BrandTagOnBrand_tagId_idx" ON "BrandTagOnBrand"("tagId");

-- AddForeignKey
ALTER TABLE "BrandTagOnBrand" ADD CONSTRAINT "BrandTagOnBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandTagOnBrand" ADD CONSTRAINT "BrandTagOnBrand_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BrandTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
