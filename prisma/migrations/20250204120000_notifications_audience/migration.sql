-- Alter enum NotificationType to support new categories
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";

ALTER TABLE "Notification" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT;

CREATE TYPE "NotificationType" AS ENUM ('ANNOUNCEMENT', 'LEAVE', 'ATTENDANCE', 'REPORT');

UPDATE "Notification"
SET "type" = CASE
  WHEN "type" IN ('SYSTEM', 'GENERAL') THEN 'ANNOUNCEMENT'
  WHEN "type" = 'PAYROLL' THEN 'REPORT'
  ELSE "type"
END;

ALTER TABLE "Notification"
  ALTER COLUMN "type" TYPE "NotificationType" USING "type"::"NotificationType",
  ALTER COLUMN "type" SET DEFAULT 'ANNOUNCEMENT';

DROP TYPE "NotificationType_old";

-- Create new enum for notification audience targeting
CREATE TYPE "NotificationAudience" AS ENUM ('ORGANIZATION', 'ROLE', 'INDIVIDUAL');

-- Extend Notification table with targeting fields
ALTER TABLE "Notification"
  ADD COLUMN "audience" "NotificationAudience" NOT NULL DEFAULT 'ORGANIZATION',
  ADD COLUMN "targetRoles" "UserRole"[] NOT NULL DEFAULT ARRAY[]::"UserRole"[],
  ADD COLUMN "targetUserId" TEXT;

-- Index for faster lookup of individual targets
CREATE INDEX "Notification_targetUserId_idx" ON "Notification"("targetUserId");

-- Foreign key to preserve referential integrity with User table
ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
