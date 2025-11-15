import { randomUUID } from "crypto";

import { LeaveStatus, LeaveType, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import { leaveTypeLabelMap, type LeaveTypeValue } from "@/lib/leave-types";
import type {
  CreateLeaveApplicationInput,
  LeaveAttachmentInput,
  LeaveSummaryInput,
} from "./leave.validation";

type EmploymentLeaveBalances = {
  id: string;
  casualLeaveBalance: Prisma.Decimal;
  sickLeaveBalance: Prisma.Decimal;
  annualLeaveBalance: Prisma.Decimal;
  parentalLeaveBalance: Prisma.Decimal;
};

type StoredAttachment = {
  id: string;
  name: string;
  mimeType: string | null;
  sizeBytes: number | null;
  dataUrl: string | null;
  uploadedAt: string | null;
};

export type LeaveAttachmentResponse = {
  id: string;
  name: string;
  mimeType: string | null;
  sizeBytes: number | null;
  dataUrl: string | null;
  uploadedAt: string | null;
};

export type LeaveRequestResponse = {
  id: string;
  leaveType: LeaveType;
  leaveTypeLabel: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveStatus;
  reason: string | null;
  note: string | null;
  attachments: LeaveAttachmentResponse[];
  createdAt: string;
  updatedAt: string;
};

export type LeaveBalanceResponse = {
  type: LeaveType;
  label: string;
  remaining: number;
};

const employmentBalanceSelect = {
  id: true,
  casualLeaveBalance: true,
  sickLeaveBalance: true,
  annualLeaveBalance: true,
  parentalLeaveBalance: true,
} as const;

const leaveBalanceFieldByType: Record<
  LeaveType,
  keyof Omit<EmploymentLeaveBalances, "id">
> = {
  [LeaveType.CASUAL]: "casualLeaveBalance",
  [LeaveType.SICK]: "sickLeaveBalance",
  [LeaveType.ANNUAL]: "annualLeaveBalance",
  [LeaveType.PATERNITY_MATERNITY]: "parentalLeaveBalance",
};

const decimalToNumber = (value?: Prisma.Decimal | null) =>
  value ? Number(value.toString()) : 0;

const normalizeDate = (input: Date) => {
  const result = new Date(input);
  result.setHours(0, 0, 0, 0);
  return result;
};

const calculateInclusiveDays = (start: Date, end: Date) => {
  const startDay = normalizeDate(start);
  const endDay = normalizeDate(end);
  const diffMs = endDay.getTime() - startDay.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.floor(diffMs / dayMs) + 1;
};

const toLeaveTypeValue = (value: LeaveType): LeaveTypeValue =>
  value as LeaveTypeValue;

const serializeAttachment = (attachment: StoredAttachment): LeaveAttachmentResponse => ({
  id: attachment.id,
  name: attachment.name,
  mimeType: attachment.mimeType,
  sizeBytes: attachment.sizeBytes,
  dataUrl: attachment.dataUrl,
  uploadedAt: attachment.uploadedAt,
});

const parseAttachments = (value: Prisma.JsonValue | null): LeaveAttachmentResponse[] => {
  if (!value || !Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        item &&
        typeof item === "object" &&
        "id" in item &&
        "name" in item &&
        typeof (item as Record<string, unknown>).id === "string" &&
        typeof (item as Record<string, unknown>).name === "string"
      ) {
        const raw = item as Record<string, unknown>;
        const stored: StoredAttachment = {
          id: raw.id as string,
          name: raw.name as string,
          mimeType: typeof raw.mimeType === "string" ? raw.mimeType : null,
          sizeBytes: typeof raw.sizeBytes === "number" ? raw.sizeBytes : null,
          dataUrl: typeof raw.dataUrl === "string" ? raw.dataUrl : null,
          uploadedAt: typeof raw.uploadedAt === "string" ? raw.uploadedAt : null,
        };
        return serializeAttachment(stored);
      }
      return null;
    })
    .filter((attachment): attachment is LeaveAttachmentResponse => Boolean(attachment));
};

const serializeLeaveRequest = (record: {
  id: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: Prisma.Decimal;
  status: LeaveStatus;
  reason: string | null;
  note: string | null;
  attachments: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}): LeaveRequestResponse => ({
  id: record.id,
  leaveType: record.leaveType,
  leaveTypeLabel: leaveTypeLabelMap[toLeaveTypeValue(record.leaveType)],
  startDate: record.startDate.toISOString(),
  endDate: record.endDate.toISOString(),
  totalDays: decimalToNumber(record.totalDays),
  status: record.status,
  reason: record.reason ?? null,
  note: record.note ?? null,
  attachments: parseAttachments(record.attachments),
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

const buildBalanceResponse = (
  employment: EmploymentLeaveBalances,
): LeaveBalanceResponse[] => [
  {
    type: LeaveType.CASUAL,
    label: leaveTypeLabelMap.CASUAL,
    remaining: decimalToNumber(employment.casualLeaveBalance),
  },
  {
    type: LeaveType.SICK,
    label: leaveTypeLabelMap.SICK,
    remaining: decimalToNumber(employment.sickLeaveBalance),
  },
  {
    type: LeaveType.ANNUAL,
    label: leaveTypeLabelMap.ANNUAL,
    remaining: decimalToNumber(employment.annualLeaveBalance),
  },
  {
    type: LeaveType.PATERNITY_MATERNITY,
    label: leaveTypeLabelMap.PATERNITY_MATERNITY,
    remaining: decimalToNumber(employment.parentalLeaveBalance),
  },
];

const toStoredAttachments = (attachments?: LeaveAttachmentInput[]) =>
  attachments?.map<StoredAttachment>((attachment) => ({
    id: randomUUID(),
    name: attachment.name,
    mimeType: attachment.type ?? null,
    sizeBytes: attachment.size ?? null,
    dataUrl: attachment.content,
    uploadedAt: new Date().toISOString(),
  }));

export const leaveService = {
  async summary(ctx: TRPCContext, input?: LeaveSummaryInput) {
    const session = ctx.session;
    if (!session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const limit = input?.limit ?? 25;

    const [employment, requests] = await ctx.prisma.$transaction([
      ctx.prisma.employmentDetail.findUnique({
        where: { userId: session.user.id },
        select: employmentBalanceSelect,
      }),
      ctx.prisma.leaveRequest.findMany({
        where: { employeeId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    if (!employment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employment record not found for this user.",
      });
    }

    return {
      balances: buildBalanceResponse(employment as EmploymentLeaveBalances),
      requests: requests.map(serializeLeaveRequest),
    };
  },

  async submitApplication(ctx: TRPCContext, input: CreateLeaveApplicationInput) {
    const session = ctx.session;
    if (!session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const leaveType = input.leaveType as LeaveType;
    const startDate = input.startDate;
    const endDate = input.endDate;
    const totalDays = calculateInclusiveDays(startDate, endDate);
    if (totalDays <= 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid leave duration.",
      });
    }

    const totalDaysDecimal = new Prisma.Decimal(totalDays);
    const storedAttachments = toStoredAttachments(input.attachments);

    const result = await ctx.prisma.$transaction(async (tx) => {
      const employment = await tx.employmentDetail.findUnique({
        where: { userId: session.user.id },
        select: employmentBalanceSelect,
      });

      if (!employment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employment record not found for this user.",
        });
      }

      const employmentRecord = employment as EmploymentLeaveBalances;
      const balanceField = leaveBalanceFieldByType[leaveType];
      const currentBalance = employmentRecord[balanceField] ?? new Prisma.Decimal(0);

      if (currentBalance.lt(totalDaysDecimal)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You do not have enough ${
            leaveTypeLabelMap[toLeaveTypeValue(leaveType)]
          } remaining for this request.`,
        });
      }

      const balanceUpdateData = {
        [balanceField]: currentBalance.minus(totalDaysDecimal),
      } as Prisma.EmploymentDetailUpdateInput;

      const updatedEmployment = await tx.employmentDetail.update({
        where: { id: employment.id },
        data: balanceUpdateData,
        select: employmentBalanceSelect,
      });

      const createdRequest = await tx.leaveRequest.create({
        data: {
          employeeId: session.user.id,
          leaveType,
          startDate,
          endDate,
          totalDays: totalDaysDecimal,
          reason: input.reason,
          note: input.note,
          attachments: storedAttachments ?? undefined,
        },
      });

      return {
        updatedEmployment: updatedEmployment as EmploymentLeaveBalances,
        request: createdRequest,
      };
    });

    return {
      request: serializeLeaveRequest(result.request),
      balances: buildBalanceResponse(result.updatedEmployment),
    };
  },
};
