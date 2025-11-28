-- AlterTable
ALTER TABLE "EmploymentDetail"
ADD COLUMN "isTeamLead" BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing leads
UPDATE "EmploymentDetail"
SET "isTeamLead" = true
WHERE "userId" IN (SELECT DISTINCT "leadId" FROM "TeamLead");
