import { AttendanceStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { prisma } from "@/server/db";
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

type AttendanceServiceInput = {
  userId: string;
};

type CompleteDayServiceInput = AttendanceServiceInput & {
  input: CompleteDayInput;
};

type AttendanceHistoryServiceInput = AttendanceServiceInput & {
  params?: AttendanceHistoryInput;
};

export const attendanceService = {
  async today({ userId }: AttendanceServiceInput) {
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const attendanceDate = startOfDay(new Date());
    const record = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId: userId,
          attendanceDate,
        },
      },
    });

    return {
      record: record ? formatRecord(record) : null,
    };
  },

  async startDay({ userId }: AttendanceServiceInput) {
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const now = new Date();
    const attendanceDate = startOfDay(now);

    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId: userId,
          attendanceDate,
        },
      },
    });

    if (existing) {
      if (!existing.checkInAt) {
        const updated = await prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: {
            checkInAt: now,
          },
        });
        return formatRecord(updated);
      }
      return formatRecord(existing);
    }

    const created = await prisma.attendanceRecord.create({
      data: {
        employeeId: userId,
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

  async completeDay({ userId, input }: CompleteDayServiceInput) {
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const activeRecord = await prisma.attendanceRecord.findFirst({
      where: {
        employeeId: userId,
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

    const updated = await prisma.attendanceRecord.update({
      where: { id: activeRecord.id },
      data: {
        checkOutAt: new Date(),
        totalWorkSeconds: input.workSeconds,
        totalBreakSeconds: input.breakSeconds,
      },
    });

    return formatRecord(updated);
  },

  async history({ userId, params }: AttendanceHistoryServiceInput) {
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const { rangeStart, rangeEnd } = resolveHistoryRange(params);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        employeeId: userId,
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
