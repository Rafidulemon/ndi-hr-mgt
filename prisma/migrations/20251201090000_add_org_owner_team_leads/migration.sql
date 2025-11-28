-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ORG_OWNER';

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_leadId_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "leadId";

-- CreateTable
CREATE TABLE "TeamLead" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamLead_leadId_idx" ON "TeamLead"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamLead_teamId_leadId_key" ON "TeamLead"("teamId", "leadId");

-- CreateIndex
CREATE INDEX "Organization_ownerId_idx" ON "Organization"("ownerId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamLead" ADD CONSTRAINT "TeamLead_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamLead" ADD CONSTRAINT "TeamLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

