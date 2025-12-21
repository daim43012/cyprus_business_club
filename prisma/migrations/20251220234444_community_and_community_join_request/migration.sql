-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityJoinRequest" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CommunityOwners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CommunityOwners_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CommunityMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CommunityMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Community_isPrivate_idx" ON "Community"("isPrivate");

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "Community"("name");

-- CreateIndex
CREATE INDEX "CommunityJoinRequest_communityId_idx" ON "CommunityJoinRequest"("communityId");

-- CreateIndex
CREATE INDEX "CommunityJoinRequest_userId_idx" ON "CommunityJoinRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityJoinRequest_communityId_userId_key" ON "CommunityJoinRequest"("communityId", "userId");

-- CreateIndex
CREATE INDEX "_CommunityOwners_B_index" ON "_CommunityOwners"("B");

-- CreateIndex
CREATE INDEX "_CommunityMembers_B_index" ON "_CommunityMembers"("B");

-- AddForeignKey
ALTER TABLE "CommunityJoinRequest" ADD CONSTRAINT "CommunityJoinRequest_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityJoinRequest" ADD CONSTRAINT "CommunityJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CbcUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityOwners" ADD CONSTRAINT "_CommunityOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "CbcUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityOwners" ADD CONSTRAINT "_CommunityOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityMembers" ADD CONSTRAINT "_CommunityMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "CbcUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityMembers" ADD CONSTRAINT "_CommunityMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
