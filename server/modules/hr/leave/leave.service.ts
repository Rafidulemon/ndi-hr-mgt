import { LeaveStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import { leaveTypeLabelMap } from "@/lib/leave-types";
import { requireHrAdmin } from "@/server/modules/hr/utils";
import {
  buildBalanceResponse,
  decimalToNumber,
  employmentBalanceSelect,
  leaveBalanceFieldByType,
  parseAttachments,
  toLeaveTypeValue,
  type EmploymentLeaveBalances,
} from "@/server/modules/leave/leave.shared";
import type { HrLeaveRequest, HrLeaveRequestListResponse } from "@/types/hr-leave";
import type {
  HrLeaveListInput,
  HrLeaveUpdateStatusInput,
} from "./leave.validation";

const employmentSummarySelect = {
  employeeCode: true,
  designation: true,
  department: {
    select: { name: true },
  },
  team: {
    select: { name: true },
  },
  ...employmentBalanceSelect,
} as const;

const leaveRequestSelect = {
  id: true,
  leaveType: true,
  startDate: true,
  endDate: true,
  totalDays: true,
  status: true,
  reason: true,
  note: true,
  attachments: true,
  createdAt: true,
  employee: {
    select: {
      id: true,
      email: true,
      phone: true,
      organizationId: true,
      organization: {
        select: {
          name: true,
        },
      },
      profile: {
        select: {
          firstName: true,
          lastName: true,
          preferredName: true,
        },
      },
      employment: {
        select: employmentSummarySelect,
      },
    },
  },
} as const;

type LeaveRequestWithEmployee = Prisma.LeaveRequestGetPayload<{
  select: typeof leaveRequestSelect;
}>;

const formatEmployeeName = (record: {
  preferredName: string | null | undefined;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  fallback: string;
}) => {
  if (record.preferredName) return record.preferredName;
  const parts = [record.firstName, record.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return record.fallback;
};

const restoresBalanceOnStatus = (status: LeaveStatus) => status === LeaveStatus.DENIED;

const mapLeaveRequest = (record: LeaveRequestWithEmployee): HrLeaveRequest => {
  const employment = record.employee.employment;

  if (!employment) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Employment details missing for this leave request.",
    });
  }

  const balances = buildBalanceResponse(employment as EmploymentLeaveBalances);
  const remainingBalance =
    balances.find((balance) => balance.type === record.leaveType) ?? {
      type: record.leaveType,
      label: leaveTypeLabelMap[toLeaveTypeValue(record.leaveType)],
      remaining: 0,
    };

  return {
    id: record.id,
    leaveType: record.leaveType,
    leaveTypeLabel: leaveTypeLabelMap[toLeaveTypeValue(record.leaveType)],
    startDate: record.startDate.toISOString(),
    endDate: record.endDate.toISOString(),
    totalDays: decimalToNumber(record.totalDays),
    status: record.status,
    reason: record.reason ?? null,
    note: record.note ?? null,
    submittedAt: record.createdAt.toISOString(),
    attachments: parseAttachments(record.attachments),
    employee: {
      id: record.employee.id,
      name: formatEmployeeName({
        preferredName: record.employee.profile?.preferredName ?? null,
        firstName: record.employee.profile?.firstName ?? null,
        lastName: record.employee.profile?.lastName ?? null,
        fallback: record.employee.email,
      }),
      email: record.employee.email,
      phone: record.employee.phone ?? null,
      employeeCode: record.employee.employment?.employeeCode ?? null,
      designation: record.employee.employment?.designation ?? null,
      department: record.employee.employment?.department?.name ?? null,
      team: record.employee.employment?.team?.name ?? null,
      organization: record.employee.organization?.name ?? null,
    },
    balances,
    remainingBalance,
  };
};

export const hrLeaveService = {
  async listRequests(
    ctx: TRPCContext,
    input?: HrLeaveListInput,
  ): Promise<HrLeaveRequestListResponse> {
    const sessionUser = requireHrAdmin(ctx);
    const limit = input?.limit ?? 100;
    const searchValue = input?.search?.trim();

    const employeeFilter: Prisma.UserWhereInput = {
      organizationId: sessionUser.organizationId,
    };

    if (searchValue) {
      employeeFilter.OR = [
        {
          profile: {
            preferredName: { contains: searchValue, mode: "insensitive" },
          },
        },
        {
          profile: { firstName: { contains: searchValue, mode: "insensitive" } },
        },
        {
          profile: { lastName: { contains: searchValue, mode: "insensitive" } },
        },
        {
          email: { contains: searchValue, mode: "insensitive" },
        },
        {
          employment: {
            employeeCode: { contains: searchValue, mode: "insensitive" },
          },
        },
      ];
    }

    const where: Prisma.LeaveRequestWhereInput = {
      employee: employeeFilter,
    };

    if (input?.status) {
      where.status = input.status;
    }

    if (input?.leaveType) {
      where.leaveType = input.leaveType;
    }

    if (input?.month && input?.year) {
      const monthIndex = input.month - 1;
      const rangeStart = new Date(input.year, monthIndex, 1);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date(input.year, monthIndex + 1, 0);
      rangeEnd.setHours(23, 59, 59, 999);
      where.createdAt = {
        gte: rangeStart,
        lte: rangeEnd,
      };
    }

    const sortField = input?.sortField ?? "submittedAt";
    const sortOrder = input?.sortOrder ?? "desc";
    const orderBy: Prisma.LeaveRequestOrderByWithRelationInput =
      sortField === "startDate"
        ? { startDate: sortOrder }
        : sortField === "leaveType"
          ? { leaveType: sortOrder }
          : sortField === "status"
            ? { status: sortOrder }
            : { createdAt: sortOrder };

    const requests = await ctx.prisma.leaveRequest.findMany({
      where,
      orderBy,
      take: limit,
      select: leaveRequestSelect,
    });

    return {
      requests: requests.map(mapLeaveRequest),
    };
  },

  async updateStatus(ctx: TRPCContext, input: HrLeaveUpdateStatusInput): Promise<HrLeaveRequest> {
    const sessionUser = requireHrAdmin(ctx);

    const result = await ctx.prisma.$transaction(async (tx) => {
      const existing = await tx.leaveRequest.findUnique({
        where: { id: input.requestId },
        select: leaveRequestSelect,
      });

      if (!existing || existing.employee.organizationId !== sessionUser.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Leave request not found." });
      }

      const employment = existing.employee.employment;
      if (!employment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Employment record missing for this employee.",
        });
      }

      const balanceField = leaveBalanceFieldByType[existing.leaveType];
      const previousRefunded = restoresBalanceOnStatus(existing.status);
      const nextRefunded = restoresBalanceOnStatus(input.status as LeaveStatus);
      const totalDaysDecimal = existing.totalDays as Prisma.Decimal;

      if (previousRefunded !== nextRefunded) {
        const currentBalance = employment[balanceField] ?? new Prisma.Decimal(0);
        const nextBalance = nextRefunded
          ? currentBalance.plus(totalDaysDecimal)
          : currentBalance.minus(totalDaysDecimal);

        if (!nextRefunded && nextBalance.lt(0)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient balance to approve this request.",
          });
        }

        await tx.employmentDetail.update({
          where: { id: employment.id },
          data: {
            [balanceField]: nextBalance,
          },
        });
      }

      const updated = await tx.leaveRequest.update({
        where: { id: input.requestId },
        data: {
          status: input.status as LeaveStatus,
          note: input.note ?? existing.note,
          reviewerId: sessionUser.id,
          reviewedAt: new Date(),
        },
        select: leaveRequestSelect,
      });

      return updated;
    });

    return mapLeaveRequest(result);
  },
};
