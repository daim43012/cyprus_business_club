-- CreateTable
CREATE TABLE "CbcUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastOnline" TIMESTAMP(3),

    CONSTRAINT "CbcUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CbcUser_email_key" ON "CbcUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CbcUser_googleId_key" ON "CbcUser"("googleId");
