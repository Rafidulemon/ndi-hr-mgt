import {
  AttendanceStatus,
  LeaveStatus,
  NotificationStatus,
  Prisma,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import { leaveTypeLabelMap } from "@/lib/leave-types";
import {
  buildBalanceResponse,
  decimalToNumber,
  employmentBalanceSelect,
  toLeaveTypeValue,
  type EmploymentLeaveBalances,
} from "@/server/modules/leave/leave.shared";
import type {
  DashboardAttendanceTrendPoint,
  EmployeeDashboardResponse,
} from "@/types/employee-dashboard";

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_DAYS = 10;

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const workedStatuses = new Set<AttendanceStatus>([
  AttendanceStatus.PRESENT,
  AttendanceStatus.LATE,
  AttendanceStatus.HALF_DAY,
  AttendanceStatus.REMOTE,
]);

const onTimeStatuses = new Set<AttendanceStatus>([
  AttendanceStatus.PRESENT,
  AttendanceStatus.REMOTE,
]);

const startOfDay = (value: Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (value: Date, delta: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + delta);
  return date;
};

const formatDateKey = (value: Date) => startOfDay(value).toISOString();

const buildStatusCounts = (): Record<AttendanceStatus, number> => ({
  [AttendanceStatus.PRESENT]: 0,
  [AttendanceStatus.LATE]: 0,
  [AttendanceStatus.HALF_DAY]: 0,
  [AttendanceStatus.ABSENT]: 0,
  [AttendanceStatus.REMOTE]: 0,
  [AttendanceStatus.HOLIDAY]: 0,
});

const minutesToLabel = (totalMinutes: number) => {
  if (!Number.isFinite(totalMinutes)) {
    return null;
  }
  const normalized =
    ((Math.round(totalMinutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const paddedHour = hour12.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${paddedHour}:${paddedMinutes} ${period}`;
};

const inclusiveOverlapDays = (
  containerStart: Date,
  containerEnd: Date,
  rangeStart: Date,
  rangeEnd: Date,
) => {
  const start = Math.max(startOfDay(containerStart).getTime(), startOfDay(rangeStart).getTime());
  const end = Math.min(startOfDay(containerEnd).getTime(), startOfDay(rangeEnd).getTime());
  if (end < start) {
    return 0;
  }
  return Math.floor((end - start) / DAY_MS) + 1;
};

const employmentSelect = {
  ...employmentBalanceSelect,
  employeeCode: true,
  designation: true,
  employmentType: true,
  status: true,
  startDate: true,
  workHours: true,
  primaryLocation: true,
  currentProjectNote: true,
  department: {
    select: {
      name: true,
    },
  },
  team: {
    select: {
      name: true,
    },
  },
  manager: {
    select: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
          preferredName: true,
        },
      },
    },
  },
  currentProject: {
    select: {
      name: true,
    },
  },
} as const satisfies Prisma.EmploymentDetailSelect;

const userDashboardSelect = {
  id: true,
  email: true,
  phone: true,
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
      profilePhotoUrl: true,
      gender: true,
      workModel: true,
      dateOfBirth: true,
      nationality: true,
      currentAddress: true,
      permanentAddress: true,
      workEmail: true,
      personalEmail: true,
      workPhone: true,
      personalPhone: true,
    },
  },
  employment: {
    select: employmentSelect,
  },
} as const satisfies Prisma.UserSelect;

const attendanceRecordSelect = {
  attendanceDate: true,
  status: true,
  totalWorkSeconds: true,
  checkInAt: true,
  checkOutAt: true,
} as const satisfies Prisma.AttendanceRecordSelect;

const leaveRequestSelect = {
  id: true,
  leaveType: true,
  status: true,
  startDate: true,
  endDate: true,
  totalDays: true,
} as const satisfies Prisma.LeaveRequestSelect;

export const employeeDashboardService = {
  async overview(ctx: TRPCContext): Promise<EmployeeDashboardResponse> {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const organizationId =
      ctx.session.user.organization?.id ?? ctx.session.user.organizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Missing organization context for dashboard.",
      });
    }

    const userId = ctx.session.user.id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthEndInclusive = addDays(monthEnd, -1);
    const trendStart = addDays(todayStart, -(TREND_DAYS - 1));
    const attendanceRangeStart =
      monthStart.getTime() <= trendStart.getTime() ? monthStart : trendStart;

    const [
      userRecord,
      attendanceRecords,
      monthlyLeaveRequests,
      upcomingLeaves,
      notifications,
      pendingCount,
    ] = await ctx.prisma.$transaction([
      ctx.prisma.user.findUnique({
        where: { id: userId },
        select: userDashboardSelect,
      }),
      ctx.prisma.attendanceRecord.findMany({
        where: {
          employeeId: userId,
          attendanceDate: {
            gte: attendanceRangeStart,
            lt: monthEnd,
          },
        },
        select: attendanceRecordSelect,
        orderBy: {
          attendanceDate: "asc",
        },
      }),
      ctx.prisma.leaveRequest.findMany({
        where: {
          employeeId: userId,
          startDate: { lt: monthEnd },
          endDate: { gte: monthStart },
        },
        select: leaveRequestSelect,
        orderBy: {
          startDate: "asc",
        },
      }),
      ctx.prisma.leaveRequest.findMany({
        where: {
          employeeId: userId,
          startDate: { gte: todayStart },
          status: {
            in: [
              LeaveStatus.PENDING,
              LeaveStatus.PROCESSING,
              LeaveStatus.APPROVED,
            ],
          },
        },
        select: leaveRequestSelect,
        orderBy: { startDate: "asc" },
        take: 4,
      }),
      ctx.prisma.notification.findMany({
        where: {
          organizationId,
          status: {
            in: [
              NotificationStatus.SENT,
              NotificationStatus.SCHEDULED,
              NotificationStatus.DRAFT,
            ],
          },
        },
        select: {
          id: true,
          title: true,
          body: true,
          type: true,
          status: true,
          actionUrl: true,
          sentAt: true,
          scheduledAt: true,
          createdAt: true,
        },
        orderBy: [
          { sentAt: "desc" },
          { scheduledAt: "desc" },
          { createdAt: "desc" },
        ],
        take: 5,
      }),
      ctx.prisma.leaveRequest.count({
        where: {
          employeeId: userId,
          status: {
            in: [LeaveStatus.PENDING, LeaveStatus.PROCESSING],
          },
        },
      }),
    ]);

    if (!userRecord) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Unable to load dashboard for this user.",
      });
    }

    const attendanceByKey = attendanceRecords.reduce<
      Record<string, (typeof attendanceRecords)[number]>
    >((acc, record) => {
      acc[formatDateKey(record.attendanceDate)] = record;
      return acc;
    }, {});

    const attendanceTrend: DashboardAttendanceTrendPoint[] = [];
    for (let index = 0; index < TREND_DAYS; index += 1) {
      const date = addDays(trendStart, index);
      const key = formatDateKey(date);
      const record = attendanceByKey[key];
      attendanceTrend.push({
        date: date.toISOString(),
        status: record?.status ?? AttendanceStatus.ABSENT,
        workedSeconds: record?.totalWorkSeconds ?? 0,
        checkInAt: record?.checkInAt
          ? record.checkInAt.toISOString()
          : null,
        checkOutAt: record?.checkOutAt
          ? record.checkOutAt.toISOString()
          : null,
      });
    }

    const monthRecords = attendanceRecords.filter(
      (record) => record.attendanceDate >= monthStart,
    );
    const statusCounts = buildStatusCounts();
    let workSecondsTotal = 0;
    let workSecondsSamples = 0;
    const checkInMinutes: number[] = [];

    monthRecords.forEach((record) => {
      statusCounts[record.status] += 1;
      if (typeof record.totalWorkSeconds === "number") {
        workSecondsTotal += record.totalWorkSeconds;
        workSecondsSamples += 1;
      }
      if (record.checkInAt) {
        const datetime = record.checkInAt;
        checkInMinutes.push(datetime.getHours() * 60 + datetime.getMinutes());
      }
    });

    const daysWorked = monthRecords.filter((record) =>
      workedStatuses.has(record.status),
    ).length;
    const onTimeCount = monthRecords.filter((record) =>
      onTimeStatuses.has(record.status),
    ).length;
    const onTimePercentage = monthRecords.length
      ? (onTimeCount / monthRecords.length) * 100
      : 0;
    const averageCheckIn =
      checkInMinutes.length > 0
        ? minutesToLabel(
            checkInMinutes.reduce((total, entry) => total + entry, 0) /
              checkInMinutes.length,
          )
        : null;
    const averageWorkSeconds =
      workSecondsSamples > 0
        ? Math.round(workSecondsTotal / workSecondsSamples)
        : 0;

    const leaveBalances = userRecord.employment
      ? buildBalanceResponse(userRecord.employment as EmploymentLeaveBalances)
      : [];
    const totalLeaveBalance = leaveBalances.reduce(
      (total, entry) => total + entry.remaining,
      0,
    );
    const leaveLeader = leaveBalances.reduce(
      (leader, entry) =>
        !leader || entry.remaining > leader.remaining ? entry : leader,
      leaveBalances[0] ?? null,
    );

    const leavesTaken = monthlyLeaveRequests.reduce((total, request) => {
      if (
        request.status !== LeaveStatus.APPROVED &&
        request.status !== LeaveStatus.PROCESSING
      ) {
        return total;
      }
      return (
        total +
        inclusiveOverlapDays(
          monthStart,
          monthEndInclusive,
          request.startDate,
          request.endDate,
        )
      );
    }, 0);

    const upcomingHighlights = upcomingLeaves.map((leave) => ({
      id: leave.id,
      leaveType: leave.leaveType,
      leaveTypeLabel: leaveTypeLabelMap[toLeaveTypeValue(leave.leaveType)],
      status: leave.status,
      startDate: leave.startDate.toISOString(),
      endDate: leave.endDate.toISOString(),
      totalDays: decimalToNumber(leave.totalDays),
    }));
    const nextLeaveDate =
      upcomingLeaves.length > 0 ? upcomingLeaves[0].startDate.toISOString() : null;

    const notificationsSummary = notifications.map((record) => ({
      id: record.id,
      title: record.title,
      body: record.body,
      type: record.type,
      status: record.status,
      actionUrl: record.actionUrl ?? null,
      timestamp: (
        record.sentAt ?? record.scheduledAt ?? record.createdAt
      ).toISOString(),
    }));

    const profile = userRecord.profile;
    const employment = userRecord.employment;
    const baseName = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const fullName = baseName || profile?.preferredName || userRecord.email;
    const managerName = employment?.manager?.profile
      ? [
          employment.manager.profile.preferredName,
          employment.manager.profile.firstName,
          employment.manager.profile.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() || null
      : null;
    const organizationName =
      ctx.session.user.organization?.name ??
      userRecord.organization?.name ??
      "Workspace";
    const tags = [
      employment?.team?.name,
      employment?.employmentType,
      profile?.workModel,
    ]
      .filter((tag): tag is string => Boolean(tag))
      .map((tag) => tag.trim());

    const personalDetails = [
      { label: "Work Email", value: profile?.workEmail ?? userRecord.email },
      { label: "Personal Email", value: profile?.personalEmail ?? null },
      { label: "Work Phone", value: profile?.workPhone ?? userRecord.phone ?? null },
      {
        label: "Personal Phone",
        value: profile?.personalPhone ?? null,
      },
      {
        label: "Work Model",
        value: profile?.workModel ?? null,
      },
      {
        label: "Date of Birth",
        value: profile?.dateOfBirth
          ? profile.dateOfBirth.toISOString()
          : null,
      },
      {
        label: "Current Address",
        value: profile?.currentAddress ?? null,
      },
      {
        label: "Permanent Address",
        value: profile?.permanentAddress ?? null,
      },
      {
        label: "Nationality",
        value: profile?.nationality ?? null,
      },
    ];

    const companyDetails = [
      {
        label: "Employee ID",
        value: employment?.employeeCode ?? null,
      },
      {
        label: "Department",
        value: employment?.department?.name ?? null,
      },
      {
        label: "Team",
        value: employment?.team?.name ?? null,
      },
      {
        label: "Designation",
        value: employment?.designation ?? null,
      },
      {
        label: "Reporting Manager",
        value: managerName,
      },
      {
        label: "Employment Type",
        value: employment?.employmentType ?? null,
      },
      {
        label: "Status",
        value: employment?.status ?? null,
      },
      {
        label: "Work Hours",
        value: employment?.workHours ?? null,
      },
      {
        label: "Location",
        value: employment?.primaryLocation ?? null,
      },
      {
        label: "Project",
        value:
          employment?.currentProject?.name ??
          employment?.currentProjectNote ??
          null,
      },
      {
        label: "Joined",
        value: employment?.startDate
          ? employment.startDate.toISOString()
          : null,
      },
    ];

    const monthSnapshot = {
      daysWorked,
      hoursLogged: Math.round((workSecondsTotal / 3600) * 10) / 10,
      leavesTaken,
    };

    const pendingHelper =
      pendingCount > 0
        ? `${organizationName} needs a response`
        : "All caught up";

    const quickStats = [
      {
        id: "leave-balance",
        label: "Leave balance",
        value: `${Math.round(totalLeaveBalance * 10) / 10}d`,
        helper: leaveLeader
          ? `${leaveLeader.label} most remaining`
          : "No leave data yet",
      },
      {
        id: "attendance",
        label: "Attendance",
        value: `${Math.round(onTimePercentage)}%`,
        helper: "On-time this month",
      },
      {
        id: "pending",
        label: "Pending actions",
        value: pendingCount.toString(),
        helper: pendingHelper,
      },
      {
        id: "upcoming",
        label: "Next time off",
        value: nextLeaveDate
          ? shortDateFormatter.format(new Date(nextLeaveDate))
          : "—",
        helper: nextLeaveDate ? "Scheduled leave" : "No upcoming leave",
      },
    ];

    return {
      profile: {
        fullName,
        preferredName: profile?.preferredName ?? null,
        designation: employment?.designation ?? null,
        avatarUrl: profile?.profilePhotoUrl ?? null,
        joiningDate: employment?.startDate
          ? employment.startDate.toISOString()
          : null,
        teamName: employment?.team?.name ?? null,
        departmentName: employment?.department?.name ?? null,
        managerName,
        employmentType: employment?.employmentType ?? null,
        employmentStatus: employment?.status ?? null,
        workModel: profile?.workModel ?? null,
        workHours: employment?.workHours ?? null,
        currentProject: employment?.currentProject?.name ?? null,
        currentProjectNote: employment?.currentProjectNote ?? null,
        primaryLocation: employment?.primaryLocation ?? null,
        tags,
      },
      monthSnapshot,
      quickStats,
      personalDetails,
      companyDetails,
      attendanceSummary: {
        monthLabel: monthFormatter.format(monthStart),
        totalRecords: monthRecords.length,
        onTimePercentage: Math.round(onTimePercentage * 10) / 10,
        averageCheckIn,
        averageWorkSeconds,
        statusCounts,
      },
      attendanceTrend,
      leaveBalances,
      leaveHighlights: {
        pendingCount,
        upcoming: upcomingHighlights,
        nextLeaveDate,
      },
      notifications: notificationsSummary,
    };
  },
};
