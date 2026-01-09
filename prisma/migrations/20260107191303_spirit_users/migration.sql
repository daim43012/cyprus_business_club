-- CreateTable
CREATE TABLE "SpiritUsers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpiritUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpiritUsers_email_key" ON "SpiritUsers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SpiritUsers_googleId_key" ON "SpiritUsers"("googleId");
