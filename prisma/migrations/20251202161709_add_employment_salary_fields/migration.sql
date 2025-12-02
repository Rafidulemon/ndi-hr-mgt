-- AlterTable
ALTER TABLE "EmploymentDetail" ADD COLUMN     "grossSalary" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "incomeTax" DECIMAL(12,2) NOT NULL DEFAULT 0;
