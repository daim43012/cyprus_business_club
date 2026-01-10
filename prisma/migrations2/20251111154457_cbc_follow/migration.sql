-- CreateTable
CREATE TABLE "CbcFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CbcFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CbcFollow_followerId_followingId_key" ON "CbcFollow"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "CbcFollow" ADD CONSTRAINT "CbcFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "CbcUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcFollow" ADD CONSTRAINT "CbcFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "CbcUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
