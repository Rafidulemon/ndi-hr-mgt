import { AttendanceStatus, type WorkModel } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { prisma } from "@/server/db";
import type {
  AttendanceHistoryInput,
  CompleteDayInput,
  StartDayInput,
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
  source: string | null;
  location: string | null;
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
  source: string | null;
  location: string | null;
}): AttendanceRecordResponse => ({
  id: record.id,
  attendanceDate: record.attendanceDate.toISOString(),
  checkInAt: record.checkInAt ? record.checkInAt.toISOString() : null,
  checkOutAt: record.checkOutAt ? record.checkOutAt.toISOString() : null,
  totalWorkSeconds: record.totalWorkSeconds ?? 0,
  totalBreakSeconds: record.totalBreakSeconds ?? 0,
  status: record.status,
  note: record.note ?? null,
  source: record.source ?? null,
  location: record.location ?? null,
});

const DEFAULT_POLICY_TIMINGS = {
  onsiteStartTime: "09:00",
  remoteStartTime: "08:00",
} as const;

const LOCATION_LABELS: Record<StartDayInput["location"], string> = {
  REMOTE: "Remote",
  ONSITE: "On-site",
};

const LATE_TOLERANCE_MS = 10 * 60 * 1000;
const MAX_DAILY_WORK_SECONDS = 8 * 60 * 60;

type PolicyTimings = {
  onsiteStartTime: string;
  remoteStartTime: string;
};

const resolvePolicyTimings = (record?: PolicyTimings | null): PolicyTimings => ({
  onsiteStartTime: record?.onsiteStartTime ?? DEFAULT_POLICY_TIMINGS.onsiteStartTime,
  remoteStartTime: record?.remoteStartTime ?? DEFAULT_POLICY_TIMINGS.remoteStartTime,
});

const buildScheduledStart = (timeValue: string, fallbackValue: string, reference: Date) => {
  const scheduled = new Date(reference);
  const [hourStr, minuteStr] = timeValue.split(":");
  const hour = Number.parseInt(hourStr ?? "", 10);
  const minute = Number.parseInt(minuteStr ?? "", 10);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    const [fallbackHourStr, fallbackMinuteStr] = fallbackValue.split(":");
    const fallbackHour = Number.parseInt(fallbackHourStr ?? "", 10) || 0;
    const fallbackMinute = Number.parseInt(fallbackMinuteStr ?? "", 10) || 0;
    scheduled.setHours(fallbackHour, fallbackMinute, 0, 0);
    return scheduled;
  }

  scheduled.setHours(hour, minute, 0, 0);
  return scheduled;
};

const resolveAttendanceStatus = (actual: Date, scheduled: Date) =>
  actual.getTime() > scheduled.getTime() + LATE_TOLERANCE_MS
    ? AttendanceStatus.LATE
    : AttendanceStatus.PRESENT;

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
  organizationId: string;
};

type StartDayServiceInput = AttendanceServiceInput & {
  input: StartDayInput;
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
    const [record, profile] = await Promise.all([
      prisma.attendanceRecord.findUnique({
        where: {
          employeeId_attendanceDate: {
            employeeId: userId,
            attendanceDate,
          },
        },
      }),
      prisma.employeeProfile.findUnique({
        where: { userId },
        select: { workModel: true },
      }),
    ]);

    return {
      record: record ? formatRecord(record) : null,
      workModel: (profile?.workModel as WorkModel | null) ?? null,
    };
  },

  async startDay({ userId, organizationId, input }: StartDayServiceInput) {
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (!organizationId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Organization context missing." });
    }

    const now = new Date();
    const attendanceDate = startOfDay(now);

    const [existing, policyRecord] = await Promise.all([
      prisma.attendanceRecord.findUnique({
        where: {
          employeeId_attendanceDate: {
            employeeId: userId,
            attendanceDate,
          },
        },
      }),
      prisma.workPolicy.findUnique({
        where: { organizationId },
        select: {
          onsiteStartTime: true,
          remoteStartTime: true,
        },
      }),
    ]);

    if (existing) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Attendance has already been recorded for today. Please contact HR if you need to make a change.",
      });
    }

    const timings = resolvePolicyTimings(policyRecord);
    const scheduledStart =
      input.location === "REMOTE"
        ? buildScheduledStart(
            timings.remoteStartTime,
            DEFAULT_POLICY_TIMINGS.remoteStartTime,
            now,
          )
        : buildScheduledStart(
            timings.onsiteStartTime,
            DEFAULT_POLICY_TIMINGS.onsiteStartTime,
            now,
          );
    const status = resolveAttendanceStatus(now, scheduledStart);
    const locationLabel = LOCATION_LABELS[input.location];

    const created = await prisma.attendanceRecord.create({
      data: {
        employeeId: userId,
        attendanceDate,
        checkInAt: now,
        status,
        source: "WEB",
        totalWorkSeconds: 0,
        totalBreakSeconds: 0,
        location: locationLabel,
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

    const sanitizedWorkSeconds = Math.max(0, Math.min(input.workSeconds, MAX_DAILY_WORK_SECONDS));

    const updated = await prisma.attendanceRecord.update({
      where: { id: activeRecord.id },
      data: {
        checkOutAt: new Date(),
        totalWorkSeconds: sanitizedWorkSeconds,
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
