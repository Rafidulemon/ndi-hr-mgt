/*
  Warnings:

  - You are about to drop the column `leaveTypeId` on the `LeaveRequest` table. All the data in the column will be lost.
  - You are about to drop the column `legalName` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Organization` table. All the data it contains will be lost.
  - You are about to drop the `AttendanceBreak` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CareerEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeaveAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeaveBalance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeaveType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationReceipt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payslip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayslipComponent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPreference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkReport` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `leaveType` to the `LeaveRequest` table without a default value. This is not possible if the table is not empty.

*/

-- DropForeignKey
ALTER TABLE "AttendanceBreak" DROP CONSTRAINT "AttendanceBreak_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "CareerEvent" DROP CONSTRAINT "CareerEvent_userId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeSkill" DROP CONSTRAINT "EmployeeSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeSkill" DROP CONSTRAINT "EmployeeSkill_userId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveAttachment" DROP CONSTRAINT "LeaveAttachment_leaveRequestId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveBalance" DROP CONSTRAINT "LeaveBalance_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveBalance" DROP CONSTRAINT "LeaveBalance_leaveTypeId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveRequest" DROP CONSTRAINT "LeaveRequest_leaveTypeId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveType" DROP CONSTRAINT "LeaveType_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationReceipt" DROP CONSTRAINT "NotificationReceipt_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationReceipt" DROP CONSTRAINT "NotificationReceipt_userId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollRun" DROP CONSTRAINT "PayrollRun_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollRun" DROP CONSTRAINT "PayrollRun_submittedById_fkey";

-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_payrollRunId_fkey";

-- DropForeignKey
ALTER TABLE "PayslipComponent" DROP CONSTRAINT "PayslipComponent_payslipId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkItem" DROP CONSTRAINT "WorkItem_projectId_fkey";

-- DropForeignKey
ALTER TABLE "WorkItem" DROP CONSTRAINT "WorkItem_reportId_fkey";

-- DropForeignKey
ALTER TABLE "WorkReport" DROP CONSTRAINT "WorkReport_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "WorkReport" DROP CONSTRAINT "WorkReport_employeeId_fkey";

-- DropTable
DROP TABLE "LeaveType";

-- CreateEnum
DROP TYPE IF EXISTS "LeaveType" CASCADE;
CREATE TYPE "LeaveType" AS ENUM ('CASUAL', 'SICK', 'ANNUAL', 'PATERNITY_MATERNITY');

-- AlterTable
ALTER TABLE "EmploymentDetail" ADD COLUMN     "annualLeaveBalance" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "casualLeaveBalance" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "parentalLeaveBalance" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sickLeaveBalance" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "LeaveRequest" DROP COLUMN "leaveTypeId",
ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "leaveType" "LeaveType" NOT NULL;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "legalName",
DROP COLUMN "metadata";

-- DropTable
DROP TABLE "AttendanceBreak";

-- DropTable
DROP TABLE "CareerEvent";

-- DropTable
DROP TABLE "EmployeeSkill";

-- DropTable
DROP TABLE "LeaveAttachment";

-- DropTable
DROP TABLE "LeaveBalance";

-- DropTable
DROP TABLE "NotificationReceipt";

-- DropTable
DROP TABLE "PayrollRun";

-- DropTable
DROP TABLE "Payslip";

-- DropTable
DROP TABLE "PayslipComponent";

-- DropTable
DROP TABLE "ProjectMember";

-- DropTable
DROP TABLE "Skill";

-- DropTable
DROP TABLE "TeamMember";

-- DropTable
DROP TABLE "UserPreference";

-- DropTable
DROP TABLE "WorkItem";

-- DropTable
DROP TABLE "WorkReport";

-- DropEnum
DROP TYPE "BreakType";

-- DropEnum
DROP TYPE "CompensationComponentType";

-- DropEnum
DROP TYPE "NotificationDeliveryStatus";

-- DropEnum
DROP TYPE "PayrollStatus";

-- DropEnum
DROP TYPE "PayslipStatus";

-- DropEnum
DROP TYPE "ReportStatus";

-- DropEnum
DROP TYPE "SkillLevel";

-- DropEnum
DROP TYPE "ThemePreference";

-- DropEnum
DROP TYPE "WorkType";
