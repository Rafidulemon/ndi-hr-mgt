import { AttendanceStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import type {
  AttendanceHistoryInput,
  CompleteDayInput,
} from "./attendance.validation";

export type AttendanceRecordResponse = {
  id: string;
  attendanceDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  totalWorkSeconds: number;
  totalBreakSeconds: number;
  status: AttendanceStatus;
  note: string | null;
};

const formatRecord = (record: {
  id: string;
  attendanceDate: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  totalWorkSeconds: number | null;
  totalBreakSeconds: number | null;
  status: AttendanceStatus;
  note: string | null;
}): AttendanceRecordResponse => ({
  id: record.id,
  attendanceDate: record.attendanceDate.toISOString(),
  checkInAt: record.checkInAt ? record.checkInAt.toISOString() : null,
  checkOutAt: record.checkOutAt ? record.checkOutAt.toISOString() : null,
  totalWorkSeconds: record.totalWorkSeconds ?? 0,
  totalBreakSeconds: record.totalBreakSeconds ?? 0,
  status: record.status,
  note: record.note ?? null,
});

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const resolveHistoryRange = (input?: AttendanceHistoryInput) => {
  const today = new Date();
  const month = input?.month ?? today.getMonth();
  const year = input?.year ?? today.getFullYear();
  const rangeStart = new Date(year, month, 1);
  const rangeEnd = new Date(year, month + 1, 1);
  return { rangeStart, rangeEnd };
};

export const attendanceService = {
  async today(ctx: TRPCContext) {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const attendanceDate = startOfDay(new Date());
    const record = await ctx.prisma.attendanceRecord.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId: ctx.session.user.id,
          attendanceDate,
        },
      },
    });

    return {
      record: record ? formatRecord(record) : null,
    };
  },

  async startDay(ctx: TRPCContext) {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const now = new Date();
    const attendanceDate = startOfDay(now);
    const employeeId = ctx.session.user.id;

    const existing = await ctx.prisma.attendanceRecord.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId,
          attendanceDate,
        },
      },
    });

    if (existing) {
      if (!existing.checkInAt) {
        const updated = await ctx.prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: {
            checkInAt: now,
          },
        });
        return formatRecord(updated);
      }
      return formatRecord(existing);
    }

    const created = await ctx.prisma.attendanceRecord.create({
      data: {
        employeeId,
        attendanceDate,
        checkInAt: now,
        status: AttendanceStatus.PRESENT,
        source: "WEB",
        totalWorkSeconds: 0,
        totalBreakSeconds: 0,
      },
    });

    return formatRecord(created);
  },

  async completeDay(ctx: TRPCContext, input: CompleteDayInput) {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const employeeId = ctx.session.user.id;

    const activeRecord = await ctx.prisma.attendanceRecord.findFirst({
      where: {
        employeeId,
        checkInAt: {
          not: null,
        },
        checkOutAt: null,
      },
      orderBy: {
        attendanceDate: "desc",
      },
    });

    if (!activeRecord) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active attendance record found for completion.",
      });
    }

    const updated = await ctx.prisma.attendanceRecord.update({
      where: { id: activeRecord.id },
      data: {
        checkOutAt: new Date(),
        totalWorkSeconds: input.workSeconds,
        totalBreakSeconds: input.breakSeconds,
      },
    });

    return formatRecord(updated);
  },

  async history(ctx: TRPCContext, input?: AttendanceHistoryInput) {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const { rangeStart, rangeEnd } = resolveHistoryRange(input);

    const records = await ctx.prisma.attendanceRecord.findMany({
      where: {
        employeeId: ctx.session.user.id,
        attendanceDate: {
          gte: rangeStart,
          lt: rangeEnd,
        },
      },
      orderBy: {
        attendanceDate: "desc",
      },
    });

    return {
      records: records.map(formatRecord),
    };
  },
};
