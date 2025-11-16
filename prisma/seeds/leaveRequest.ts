import { Prisma, PrismaClient } from "@prisma/client";

const leaveRequests = [
  {
    id: "leave-1",
    employeeId: "4",
    leaveType: "SICK" as const,
    startDate: new Date("2025-01-11"),
    endDate: new Date("2025-01-12"),
    totalDays: new Prisma.Decimal(2),
    status: "APPROVED" as const,
    reason: "Fever and doctor consultation.",
    reviewerId: "2",
    reviewedAt: new Date("2025-01-10T16:00:00+06:00"),
  },
  {
    id: "leave-2",
    employeeId: "5",
    leaveType: "CASUAL" as const,
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-01-15"),
    totalDays: new Prisma.Decimal(1),
    status: "PENDING" as const,
    reason: "Family engagement.",
    note: "Needs manager review.",
    reviewerId: "3",
  },
  {
    id: "leave-3",
    employeeId: "3",
    leaveType: "ANNUAL" as const,
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-02-05"),
    totalDays: new Prisma.Decimal(5),
    status: "PROCESSING" as const,
    reason: "Travel plan with family.",
    reviewerId: "1",
  },
];

export const seedLeaveRequests = async (prisma: PrismaClient) => {
  await prisma.leaveRequest.createMany({ data: leaveRequests });
};
