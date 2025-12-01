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

const TIMEZONE_TOKEN_REGEX = /([A-Za-z]+\/[A-Za-z0-9_\-+]+(?:\/[A-Za-z0-9_\-+]+)?)/;

const LOCATION_TIMEZONE_HINTS: Array<{ pattern: RegExp; timeZone: string }> = [
  { pattern: /\bdhaka\b/i, timeZone: "Asia/Dhaka" },
  { pattern: /\bsingapore\b/i, timeZone: "Asia/Singapore" },
  { pattern: /\btokyo\b/i, timeZone: "Asia/Tokyo" },
  { pattern: /\bseoul\b/i, timeZone: "Asia/Seoul" },
  { pattern: /\bkolkata\b/i, timeZone: "Asia/Kolkata" },
  { pattern: /\bbangalore\b/i, timeZone: "Asia/Kolkata" },
  { pattern: /\bmumbai\b/i, timeZone: "Asia/Kolkata" },
  { pattern: /\bdelhi\b/i, timeZone: "Asia/Kolkata" },
  { pattern: /\bdubai\b/i, timeZone: "Asia/Dubai" },
  { pattern: /\bdoha\b/i, timeZone: "Asia/Qatar" },
  { pattern: /\blondon\b/i, timeZone: "Europe/London" },
  { pattern: /\bberlin\b/i, timeZone: "Europe/Berlin" },
  { pattern: /\bparis\b/i, timeZone: "Europe/Paris" },
  { pattern: /\btoronto\b/i, timeZone: "America/Toronto" },
  { pattern: /\bnew york\b/i, timeZone: "America/New_York" },
  { pattern: /\bsan francisco\b/i, timeZone: "America/Los_Angeles" },
  { pattern: /\blos angeles\b/i, timeZone: "America/Los_Angeles" },
  { pattern: /\baustin\b/i, timeZone: "America/Chicago" },
  { pattern: /\bsydney\b/i, timeZone: "Australia/Sydney" },
  { pattern: /\bmelbourne\b/i, timeZone: "Australia/Melbourne" },
  { pattern: /\bbrisbane\b/i, timeZone: "Australia/Brisbane" },
];

const timezoneValidationCache = new Map<string, boolean>();
const timezoneFormatterCache = new Map<string, Intl.DateTimeFormat>();

const isValidTimeZone = (value: string | null | undefined): value is string => {
  if (!value) {
    return false;
  }
  if (timezoneValidationCache.has(value)) {
    return timezoneValidationCache.get(value) ?? false;
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    timezoneValidationCache.set(value, true);
    return true;
  } catch {
    timezoneValidationCache.set(value, false);
    return false;
  }
};

const extractTimeZoneFromText = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed as string;
  if (isValidTimeZone(normalized)) {
    return normalized;
  }
  const tokenMatch = TIMEZONE_TOKEN_REGEX.exec(normalized);
  if (tokenMatch && isValidTimeZone(tokenMatch[1])) {
    return tokenMatch[1];
  }
  return null;
};

const resolveTimeZoneFromLocation = (
  primaryLocation: string | null | undefined,
  fallback: string | null | undefined,
): string | null => {
  const extracted = extractTimeZoneFromText(primaryLocation);
  if (extracted) {
    return extracted;
  }

  const normalized = primaryLocation?.trim().toLowerCase() ?? "";
  if (normalized) {
    for (const hint of LOCATION_TIMEZONE_HINTS) {
      if (hint.pattern.test(normalized)) {
        return hint.timeZone;
      }
    }
  }

  const fallbackTimezone = fallback?.trim() ?? null;
  if (isValidTimeZone(fallbackTimezone)) {
    return fallbackTimezone;
  }

  return null;
};

const parseTimeToDate = (
  timeValue: string | null | undefined,
  day: Date,
  options?: { timeZone?: string | null },
) => {
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
  if (options?.timeZone) {
    return convertLocalTimeToUtc(day, hours, minutes, options.timeZone);
  }
  const date = new Date(day);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const convertLocalTimeToUtc = (day: Date, hours: number, minutes: number, timeZone: string) => {
  const base = new Date(
    `${formatDateKey(day)}T${padTimeUnit(hours)}:${padTimeUnit(minutes)}:00.000Z`,
  );
  const initialOffset = getTimeZoneOffsetMs(base, timeZone);
  const candidate = new Date(base.getTime() - initialOffset);
  const verifiedOffset = getTimeZoneOffsetMs(candidate, timeZone);
  if (verifiedOffset !== initialOffset) {
    return new Date(base.getTime() - verifiedOffset);
  }
  return candidate;
};

const getTimeZoneOffsetMs = (date: Date, timeZone: string) => {
  const formatter = getTimeZoneFormatter(timeZone);
  const parts = formatter.formatToParts(date);
  const filled = parts.reduce<Record<string, number>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = Number(part.value);
    }
    return acc;
  }, {});

  const asUtc = Date.UTC(
    filled.year ?? date.getUTCFullYear(),
    (filled.month ?? date.getUTCMonth() + 1) - 1,
    filled.day ?? date.getUTCDate(),
    filled.hour ?? 0,
    filled.minute ?? 0,
    filled.second ?? 0,
    0,
  );

  return asUtc - date.getTime();
};

const getTimeZoneFormatter = (timeZone: string) => {
  let formatter = timezoneFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    timezoneFormatterCache.set(timeZone, formatter);
  }
  return formatter;
};

const padTimeUnit = (value: number) => value.toString().padStart(2, "0");

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
        employment: {
          select: {
            primaryLocation: true,
          },
        },
        organization: {
          select: {
            timezone: true,
          },
        },
      },
    });

    if (!employee) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    const locationTimeZone = resolveTimeZoneFromLocation(
      employee.employment?.primaryLocation ?? null,
      employee.organization?.timezone ?? null,
    );

    const checkInAt = parseTimeToDate(input.checkIn ?? null, attendanceDate, {
      timeZone: locationTimeZone,
    });
    const checkOutAt = parseTimeToDate(input.checkOut ?? null, attendanceDate, {
      timeZone: locationTimeZone,
    });
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
