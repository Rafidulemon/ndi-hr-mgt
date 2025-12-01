-- Drop indexes tied to the leadership columns before removing them.
DROP INDEX IF EXISTS "Organization_ownerId_idx";
DROP INDEX IF EXISTS "Organization_orgAdminId_idx";
DROP INDEX IF EXISTS "Organization_managerId_idx";

-- Remove redundant leadership foreign keys from organizations.
ALTER TABLE "Organization"
  DROP COLUMN IF EXISTS "ownerId",
  DROP COLUMN IF EXISTS "orgAdminId",
  DROP COLUMN IF EXISTS "managerId";
