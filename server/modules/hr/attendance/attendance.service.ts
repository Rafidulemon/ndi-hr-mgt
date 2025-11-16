import {
  AttendanceStatus,
  EmploymentStatus,
  Prisma,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import {
  type HrAttendanceCalendarDay,
  type HrAttendanceCalendarSignal,
  type HrAttendanceEmployeeOption,
  type HrAttendanceHistoryResponse,
  type HrAttendanceLog,
  type HrAttendanceOverviewResponse,
  type HrAttendanceStatus,
  type HrAttendanceStatusCounts,
  type HrAttendanceWeeklyTrendPoint,
} from "@/types/hr-attendance";
import { requireHrAdmin } from "@/server/modules/hr/utils";
import type {
  HrAttendanceHistoryInput,
  HrAttendanceManualEntryInput,
  HrAttendanceOverviewInput,
} from "./attendance.validation";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

const formatTimeLabel = (value?: Date | null) => (value ? timeFormatter.format(value) : "—");

const formatDateKey = (date: Date) => date.toISOString().split("T")[0]!;

const startOfDay = (input: Date) => {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (input: Date, days: number) => {
  const date = new Date(input);
  date.setDate(date.getDate() + days);
  return date;
};

const hrStatusByAttendance: Record<AttendanceStatus, HrAttendanceStatus> = {
  [AttendanceStatus.PRESENT]: "On time",
  [AttendanceStatus.LATE]: "Late",
  [AttendanceStatus.HALF_DAY]: "On leave",
  [AttendanceStatus.ABSENT]: "Absent",
  [AttendanceStatus.REMOTE]: "On time",
  [AttendanceStatus.HOLIDAY]: "On leave",
};

const attendanceStatusByHr: Record<HrAttendanceStatus, AttendanceStatus> = {
  "On time": AttendanceStatus.PRESENT,
  Late: AttendanceStatus.LATE,
  "On leave": AttendanceStatus.HOLIDAY,
  Absent: AttendanceStatus.ABSENT,
};

const toHrStatus = (status: AttendanceStatus): HrAttendanceStatus =>
  hrStatusByAttendance[status] ?? "On time";

const toAttendanceStatus = (status: HrAttendanceStatus): AttendanceStatus =>
  attendanceStatusByHr[status] ?? AttendanceStatus.PRESENT;

const emptyStatusCounts = (): HrAttendanceStatusCounts => ({
  "On time": 0,
  Late: 0,
  "On leave": 0,
  Absent: 0,
});

const isManualSource = (source?: string | null) =>
  source ? source.toLowerCase().includes("manual") : false;

const formatEmployeeName = (record: {
  preferredName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}) => {
  if (record.preferredName) return record.preferredName;
  const parts = [record.firstName, record.lastName].filter(Boolean);
  if (parts.length) {
    return parts.join(" ");
  }
  return record.email;
};

const attendanceRecordSelect = {
  id: true,
  employeeId: true,
  attendanceDate: true,
  checkInAt: true,
  checkOutAt: true,
  status: true,
  source: true,
  employee: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          preferredName: true,
        },
      },
      employment: {
        select: {
          team: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
} as const;

type AttendanceRecordWithEmployee = Prisma.AttendanceRecordGetPayload<{
  select: typeof attendanceRecordSelect;
}>;

const mapLog = (record: AttendanceRecordWithEmployee): HrAttendanceLog => ({
  id: record.id,
  employeeId: record.employeeId,
  name: formatEmployeeName({
    preferredName: record.employee.profile?.preferredName ?? null,
    firstName: record.employee.profile?.firstName ?? null,
    lastName: record.employee.profile?.lastName ?? null,
    email: record.employee.email,
  }),
  squad: record.employee.employment?.team?.name ?? null,
  checkIn: formatTimeLabel(record.checkInAt),
  checkOut: formatTimeLabel(record.checkOutAt),
  status: toHrStatus(record.status),
  source: isManualSource(record.source) ? "Manual" : "System",
});

const buildCalendar = (
  monthStart: Date,
  monthEnd: Date,
  records: AttendanceRecordWithEmployee[],
): HrAttendanceCalendarDay[] => {
  const statusByDate = new Map<string, Set<HrAttendanceStatus>>();

  records.forEach((record) => {
    const dateKey = formatDateKey(record.attendanceDate);
    const status = toHrStatus(record.status);
    const collection = statusByDate.get(dateKey) ?? new Set<HrAttendanceStatus>();
    collection.add(status);
    statusByDate.set(dateKey, collection);
  });

  const calendar: HrAttendanceCalendarDay[] = [];
  const cursor = new Date(monthStart);

  while (cursor < monthEnd) {
    const key = formatDateKey(cursor);
    const statuses = statusByDate.get(key) ?? new Set<HrAttendanceStatus>();
    const signal = determineSignal(statuses);
    calendar.push({ date: key, signal });
    cursor.setDate(cursor.getDate() + 1);
  }

  return calendar;
};

const determineSignal = (statuses: Set<HrAttendanceStatus>): HrAttendanceCalendarSignal => {
  if (!statuses.size) return "none";
  if (statuses.has("Absent")) return "absent";
  if (statuses.has("Late")) return "late";
  if (statuses.has("On leave")) return "leave";
  if (statuses.has("On time")) return "ontime";
  return "none";
};

const buildWeeklyTrend = (
  trendStart: Date,
  days: number,
  records: AttendanceRecordWithEmployee[],
  totalEmployees: number,
): HrAttendanceWeeklyTrendPoint[] => {
  const presentByDate = new Map<string, number>();

  records.forEach((record) => {
    const key = formatDateKey(record.attendanceDate);
    const status = toHrStatus(record.status);
    if (status === "On time") {
      presentByDate.set(key, (presentByDate.get(key) ?? 0) + 1);
    }
  });

  return Array.from({ length: days }).map((_, index) => {
    const day = addDays(trendStart, index);
    const key = formatDateKey(day);
    const presentCount = presentByDate.get(key) ?? 0;
    const presentPercentage =
      totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

    return {
      date: key,
      label: weekdayFormatter.format(day),
      presentCount,
      presentPercentage,
    };
  });
};

const parseDateOrThrow = (value: string, message: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TRPCError({ code: "BAD_REQUEST", message });
  }
  return date;
};

const parseTimeToDate = (timeValue: string | null | undefined, day: Date) => {
  if (!timeValue) return null;
  const [hours, minutes] = timeValue.split(":").map((part) => Number(part));
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  const date = new Date(day);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const calculateTotalSeconds = (checkInAt: Date | null, checkOutAt: Date | null) => {
  if (!checkInAt || !checkOutAt) return null;
  const diff = Math.max(0, checkOutAt.getTime() - checkInAt.getTime());
  return Math.floor(diff / 1000);
};

const buildEmployees = (
  users: Array<
    Prisma.UserGetPayload<{
      select: {
        id: true;
        email: true;
        profile: { select: { firstName: true; lastName: true; preferredName: true } };
        employment: { select: { team: { select: { name: true } } } };
      };
    }>
  >,
): HrAttendanceEmployeeOption[] =>
  users.map((user) => ({
    id: user.id,
    name: formatEmployeeName({
      preferredName: user.profile?.preferredName ?? null,
      firstName: user.profile?.firstName ?? null,
      lastName: user.profile?.lastName ?? null,
      email: user.email,
    }),
    squad: user.employment?.team?.name ?? null,
  }));

export const hrAttendanceService = {
  async overview(ctx: TRPCContext, input: HrAttendanceOverviewInput): Promise<HrAttendanceOverviewResponse> {
    const sessionUser = requireHrAdmin(ctx);
    const organizationId = sessionUser.organizationId;
    const targetDate = startOfDay(parseDateOrThrow(input.date, "Invalid date provided."));

    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

    const trendDays = 5;
    const trendStart = startOfDay(addDays(targetDate, -(trendDays - 1)));
    const trendEnd = addDays(targetDate, 1);

    const [employees, dayRecords, monthRecords, trendRecords] = await Promise.all([
      ctx.prisma.user.findMany({
        where: {
          organizationId,
          status: {
            in: [EmploymentStatus.ACTIVE, EmploymentStatus.PROBATION],
          },
        },
        orderBy: [
          { profile: { firstName: "asc" } },
          { email: "asc" },
        ],
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              preferredName: true,
            },
          },
          employment: {
            select: {
              team: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      ctx.prisma.attendanceRecord.findMany({
        where: {
          attendanceDate: {
            gte: targetDate,
            lt: addDays(targetDate, 1),
          },
          employee: {
            organizationId,
          },
        },
        orderBy: {
          employee: {
            profile: {
              firstName: "asc",
            },
          },
        },
        select: attendanceRecordSelect,
      }),
      ctx.prisma.attendanceRecord.findMany({
        where: {
          attendanceDate: {
            gte: monthStart,
            lt: monthEnd,
          },
          employee: {
            organizationId,
          },
        },
        select: attendanceRecordSelect,
      }),
      ctx.prisma.attendanceRecord.findMany({
        where: {
          attendanceDate: {
            gte: trendStart,
            lt: trendEnd,
          },
          employee: {
            organizationId,
          },
        },
        select: attendanceRecordSelect,
      }),
    ]);

    const employeesOptions = buildEmployees(employees);
    const dayLogs = dayRecords.map(mapLog);
    const statusCounts = dayLogs.reduce((acc, log) => {
      acc[log.status] += 1;
      return acc;
    }, emptyStatusCounts());

    const calendar = buildCalendar(monthStart, monthEnd, monthRecords);
    const weeklyTrend = buildWeeklyTrend(
      trendStart,
      trendDays,
      trendRecords,
      employeesOptions.length,
    );

    return {
      date: formatDateKey(targetDate),
      employees: employeesOptions,
      dayLogs,
      statusCounts,
      calendar,
      weeklyTrend,
    };
  },

  async history(ctx: TRPCContext, input: HrAttendanceHistoryInput): Promise<HrAttendanceHistoryResponse> {
    const sessionUser = requireHrAdmin(ctx);
    const organizationId = sessionUser.organizationId;

    const monthStart = new Date(input.year, input.month, 1);
    const monthEnd = new Date(input.year, input.month + 1, 1);

    const rows = await ctx.prisma.attendanceRecord.findMany({
      where: {
        employeeId: input.employeeId,
        attendanceDate: {
          gte: monthStart,
          lt: monthEnd,
        },
        employee: {
          organizationId,
        },
      },
      orderBy: {
        attendanceDate: "desc",
      },
      select: attendanceRecordSelect,
    });

    return {
      employeeId: input.employeeId,
      month: input.month,
      year: input.year,
      rows: rows.map((record) => ({
        date: formatDateKey(record.attendanceDate),
        checkIn: formatTimeLabel(record.checkInAt),
        checkOut: formatTimeLabel(record.checkOutAt),
        status: toHrStatus(record.status),
        source: isManualSource(record.source) ? "Manual" : "System",
      })),
    };
  },

  async recordManualEntry(ctx: TRPCContext, input: HrAttendanceManualEntryInput): Promise<HrAttendanceLog> {
    const sessionUser = requireHrAdmin(ctx);
    const organizationId = sessionUser.organizationId;
    const attendanceDate = startOfDay(parseDateOrThrow(input.date, "Invalid date provided."));

    const employee = await ctx.prisma.user.findFirst({
      where: {
        id: input.employeeId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!employee) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    const checkInAt = parseTimeToDate(input.checkIn ?? null, attendanceDate);
    const checkOutAt = parseTimeToDate(input.checkOut ?? null, attendanceDate);
    const totalWorkSeconds = calculateTotalSeconds(checkInAt, checkOutAt);

    const record = await ctx.prisma.attendanceRecord.upsert({
      where: {
        employeeId_attendanceDate: {
          employeeId: input.employeeId,
          attendanceDate,
        },
      },
      update: {
        checkInAt,
        checkOutAt,
        totalWorkSeconds: totalWorkSeconds ?? undefined,
        status: toAttendanceStatus(input.status),
        source: "HR_MANUAL",
      },
      create: {
        employeeId: input.employeeId,
        attendanceDate,
        checkInAt,
        checkOutAt,
        totalWorkSeconds: totalWorkSeconds ?? undefined,
        status: toAttendanceStatus(input.status),
        source: "HR_MANUAL",
      },
      select: attendanceRecordSelect,
    });

    return mapLog(record);
  },
};
