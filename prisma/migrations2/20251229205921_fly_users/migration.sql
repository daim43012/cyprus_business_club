-- CreateTable
CREATE TABLE "FlyUsers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlyUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlyUsers_email_key" ON "FlyUsers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FlyUsers_googleId_key" ON "FlyUsers"("googleId");
