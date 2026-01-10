-- CreateTable
CREATE TABLE "SmartComplianceUsers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartComplianceUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmartComplianceUsers_email_key" ON "SmartComplianceUsers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SmartComplianceUsers_googleId_key" ON "SmartComplianceUsers"("googleId");
