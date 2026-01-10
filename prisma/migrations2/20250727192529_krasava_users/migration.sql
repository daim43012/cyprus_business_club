-- CreateTable
CREATE TABLE "KrasavaUsers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KrasavaUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KrasavaUsers_email_key" ON "KrasavaUsers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KrasavaUsers_googleId_key" ON "KrasavaUsers"("googleId");
