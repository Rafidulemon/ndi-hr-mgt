import {
  AttendanceStatus,
  EmploymentStatus,
  LeaveStatus,
  Prisma,
} from "@prisma/client";

import { leaveTypeLabelMap } from "@/lib/leave-types";
import type { TRPCContext } from "@/server/api/trpc";
import { requireHrAdmin } from "@/server/modules/hr/utils";
import {
  decimalToNumber,
  employmentBalanceSelect,
  leaveBalanceFieldByType,
  toLeaveTypeValue,
} from "@/server/modules/leave/leave.shared";
import type {
  HrDashboardAttendanceBreakdownCard,
  HrDashboardAttendanceLogEntry,
  HrDashboardAttendanceState,
  HrDashboardCoverageSummary,
  HrDashboardEngagementGauge,
  HrDashboardEngagementSnapshotItem,
  HrDashboardQuickAction,
  HrDashboardResponse,
  HrDashboardStatCard,
  HrDashboardWorkforcePoint,
  HrDashboardWorkforceSignal,
} from "@/types/hr-dashboard";
import type { HrDashboardOverviewInput } from "./dashboard.validation";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const countFormatter = new Intl.NumberFormat("en-US");

const employeeSelect = {
  id: true,
  email: true,
  status: true,
  createdAt: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
      preferredName: true,
    },
  },
  employment: {
    select: {
      id: true,
      status: true,
      startDate: true,
      currentProjectId: true,
      currentProject: {
        select: {
          name: true,
        },
      },
      currentProjectNote: true,
      designation: true,
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
    },
  },
} as const satisfies Prisma.UserSelect;

const attendanceRecordSelect = {
  id: true,
  employeeId: true,
  attendanceDate: true,
  checkInAt: true,
  checkOutAt: true,
  status: true,
  location: true,
  source: true,
  updatedAt: true,
  employee: {
    select: {
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
        },
      },
    },
  },
} as const satisfies Prisma.AttendanceRecordSelect;

const leaveRequestSelect = {
  id: true,
  leaveType: true,
  startDate: true,
  endDate: true,
  totalDays: true,
  status: true,
  createdAt: true,
  employee: {
    select: {
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
          designation: true,
          department: {
            select: {
              name: true,
            },
          },
          currentProject: {
            select: {
              name: true,
            },
          },
          currentProjectNote: true,
          ...employmentBalanceSelect,
        },
      },
    },
  },
} as const;

type EmployeeRecord = Prisma.UserGetPayload<{ select: typeof employeeSelect }>;
type AttendanceRecordWithEmployee = Prisma.AttendanceRecordGetPayload<{
  select: typeof attendanceRecordSelect;
}>;
const startOfDay = (value: Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const parseDateInput = (value?: string) => {
  if (!value) {
    return new Date();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
};

const addDays = (value: Date, amount: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
};

const formatPercent = (value: number, digits = 1) =>
  `${value.toFixed(digits)}%`;

const formatNumber = (value: number) => countFormatter.format(Math.round(value));

const formatTrend = (value: number, suffix: string, digits = 1) => {
  if (!Number.isFinite(value) || Math.abs(value) < 0.01) {
    return `0${suffix}`;
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(digits)}${suffix}`;
};

const formatDelta = (value: number) => {
  if (value === 0) {
    return "No change";
  }
  return `${value > 0 ? "+" : ""}${value} vs yesterday`;
};

const formatTimeLabel = (value?: Date | null) =>
  value ? timeFormatter.format(value) : "--";

const formatRelativeTime = (value: Date | null | undefined) => {
  if (!value) {
    return "moments ago";
  }
  const diffMs = Date.now() - value.getTime();
  const minutes = Math.round(diffMs / (1000 * 60));
  if (minutes < 60) {
    return `${Math.max(minutes, 1)}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const formatDurationLabel = (start: Date, end: Date, totalDays: number) => {
  const label = `${dayFormatter.format(start)} – ${dayFormatter.format(end)}`;
  const roundedDays = Math.max(1, Math.round(totalDays));
  return `${label} (${roundedDays} day${roundedDays === 1 ? "" : "s"})`;
};

const buildName = (record: {
  preferredName: string | null | undefined;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  fallback: string;
}) => {
  if (record.preferredName) {
    return record.preferredName;
  }
  const parts = [record.firstName, record.lastName].filter(Boolean);
  if (parts.length) {
    return parts.join(" ");
  }
  return record.fallback;
};

const buildDepartment = (
  record:
    | {
        department: { name: string | null } | null;
        team: { name: string | null } | null;
      }
    | undefined
    | null,
) => record?.department?.name ?? record?.team?.name ?? "—";

const isRemoteRecord = (record: AttendanceRecordWithEmployee) => {
  const location = record.location?.toLowerCase() ?? "";
  const source = record.source?.toLowerCase() ?? "";
  return (
    record.status === AttendanceStatus.REMOTE ||
    location.includes("remote") ||
    source.includes("vpn") ||
    source.includes("remote")
  );
};

const mapStatusLabel = (record: AttendanceRecordWithEmployee) => {
  switch (record.status) {
    case AttendanceStatus.LATE:
      return "Late";
    case AttendanceStatus.ABSENT:
      return "Missing";
    case AttendanceStatus.HOLIDAY:
      return "Holiday";
    case AttendanceStatus.HALF_DAY:
      return "Half day";
    default:
      return isRemoteRecord(record) ? "Remote" : "On-site";
  }
};

const mapAttendanceState = (
  record: AttendanceRecordWithEmployee,
): HrDashboardAttendanceState => {
  if (record.status === AttendanceStatus.LATE) {
    return "late";
  }
  if (record.status === AttendanceStatus.ABSENT) {
    return "missing";
  }
  if (record.status === AttendanceStatus.HOLIDAY) {
    return "remote";
  }
  if (isRemoteRecord(record)) {
    return "remote";
  }
  return "on-time";
};

const categorizeAttendance = (records: AttendanceRecordWithEmployee[]) => {
  const counts = {
    onsite: 0,
    remote: 0,
    late: 0,
    absent: 0,
  };

  records.forEach((record) => {
    if (record.status === AttendanceStatus.ABSENT) {
      counts.absent += 1;
      return;
    }
    if (record.status === AttendanceStatus.HOLIDAY) {
      counts.absent += 1;
      return;
    }
    if (record.status === AttendanceStatus.LATE) {
      counts.late += 1;
      return;
    }
    if (isRemoteRecord(record)) {
      counts.remote += 1;
      return;
    }
    counts.onsite += 1;
  });

  return counts;
};

const buildAttendanceLog = (
  records: AttendanceRecordWithEmployee[],
): HrDashboardAttendanceLogEntry[] =>
  records.slice(0, 6).map((record) => ({
    id: record.id,
    name: buildName({
      preferredName: record.employee.profile?.preferredName ?? null,
      firstName: record.employee.profile?.firstName ?? null,
      lastName: record.employee.profile?.lastName ?? null,
      fallback: record.employee.email,
    }),
    department: buildDepartment(record.employee.employment),
    checkIn: formatTimeLabel(record.checkInAt),
    status: mapStatusLabel(record),
    method: `${record.source ?? "System"} · ${record.location ?? "N/A"}`,
    state: mapAttendanceState(record),
  }));

const buildAttendanceTrend = (records: AttendanceRecordWithEmployee[]) => {
  const hours = [9, 10, 11, 12, 13, 14];
  return hours.map((hour) => {
    const onsite = records.filter(
      (record) =>
        record.checkInAt &&
        record.checkInAt.getHours() === hour &&
        !isRemoteRecord(record),
    ).length;
    const remote = records.filter(
      (record) =>
        record.checkInAt &&
        record.checkInAt.getHours() === hour &&
        isRemoteRecord(record),
    ).length;
    return {
      hour: hourFormatter.format(new Date(2025, 0, 1, hour)),
      onsite,
      remote,
    };
  });
};

const buildQuickActions = ({
  missing,
  pendingLeaves,
  late,
}: {
  missing: number;
  pendingLeaves: number;
  late: number;
}): HrDashboardQuickAction[] => [
  {
    id: "attendance-reminder",
    title: missing > 0 ? "Follow up on missing check-ins" : "Coverage looks good",
    detail:
      missing > 0
        ? `${missing} people still need to check in.`
        : "Everyone has a record for today.",
    meta: missing > 0 ? "Due soon" : "Status",
    cta: missing > 0 ? "Send Reminder" : "Share Update",
  },
  {
    id: "leave-queue",
    title: "Review leave approvals",
    detail:
      pendingLeaves > 0
        ? `${pendingLeaves} leave requests awaiting HR.`
        : "No leave requests waiting action.",
    meta: pendingLeaves > 0 ? "Queue" : "FYI",
    cta: pendingLeaves > 0 ? "Open Queue" : "View Schedule",
  },
  {
    id: "late-pattern",
    title: late > 0 ? "Investigate late arrivals" : "All on time",
    detail:
      late > 0
        ? `${late} late check-ins logged today.`
        : "Nobody has been flagged late yet.",
    meta: "Insight",
    cta: late > 0 ? "View Log" : "Share Kudos",
  },
];

const buildWorkforceSignals = ({
  pendingApprovals,
  pendingLeaves,
}: {
  pendingApprovals: number;
  pendingLeaves: number;
}): HrDashboardWorkforceSignal[] => [
  {
    label: "Backfills ready",
    value: formatNumber(pendingApprovals),
    detail: "Invites awaiting onboarding",
  },
  {
    label: "Open leave requests",
    value: formatNumber(pendingLeaves),
    detail: "Need HR attention",
  },
];

const buildCoverageSummary = ({
  presentCount,
  totalEmployees,
  previousCoverage,
  latestSync,
}: {
  presentCount: number;
  totalEmployees: number;
  previousCoverage: number;
  latestSync: Date | null;
}): HrDashboardCoverageSummary => {
  const percent = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;
  const change = percent - previousCoverage;
  return {
    presentCount,
    totalEmployees,
    percentLabel: `${percent}% of ${formatNumber(totalEmployees)}`,
    changeLabel: change === 0 ? "No change vs yesterday" : `${change > 0 ? "+" : ""}${change} pts vs yesterday`,
    syncedLabel: `Synced ${formatRelativeTime(latestSync)}`,
  };
};

const buildWorkforceCapacity = (
  employees: EmployeeRecord[],
  months: number,
  pendingApprovals: number,
  targetDate: Date,
): HrDashboardWorkforcePoint[] => {
  const results: HrDashboardWorkforcePoint[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - offset, 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const actual = employees.filter((employee) => {
      const startDate = employee.employment?.startDate;
      if (!startDate) {
        return false;
      }
      return startDate <= monthEnd;
    }).length;

    const plan = actual + pendingApprovals;

    results.push({
      label: monthFormatter.format(monthDate),
      plan,
      actual,
    });
  }

  return results;
};

const buildTeamCapacity = (employees: EmployeeRecord[]) => {
  const byTeam = new Map<
    string,
    { committed: number; available: number }
  >();

  employees.forEach((employee) => {
    const team = employee.employment?.team?.name ?? "Unassigned";
    if (!team) {
      return;
    }
    const entry = byTeam.get(team) ?? { committed: 0, available: 0 };
    entry.available += 1;
    if (employee.employment?.currentProjectId) {
      entry.committed += 1;
    }
    byTeam.set(team, entry);
  });

  return Array.from(byTeam.entries()).map(([team, value]) => ({
    team,
    committed: value.committed,
    available: value.available,
  }));
};

export const hrDashboardService = {
  async overview(
    ctx: TRPCContext,
    input?: HrDashboardOverviewInput,
  ): Promise<HrDashboardResponse> {
    const sessionUser = requireHrAdmin(ctx);
    const organizationId = sessionUser.organizationId;
    const targetDate = startOfDay(parseDateInput(input?.date));
    const previousDate = addDays(targetDate, -1);

    const [employees, attendanceToday, attendanceYesterday, leaveRequests, pendingLeavesCount, pendingApprovalsCount] =
      await Promise.all([
        ctx.prisma.user.findMany({
          where: {
            organizationId,
            employment: {
              isNot: null,
            },
          },
          select: employeeSelect,
        }),
        ctx.prisma.attendanceRecord.findMany({
          where: {
            employee: {
              organizationId,
            },
            attendanceDate: {
              gte: targetDate,
              lt: addDays(targetDate, 1),
            },
          },
          orderBy: {
            checkInAt: "desc",
          },
          select: attendanceRecordSelect,
        }),
        ctx.prisma.attendanceRecord.findMany({
          where: {
            employee: {
              organizationId,
            },
            attendanceDate: {
              gte: previousDate,
              lt: targetDate,
            },
          },
          select: attendanceRecordSelect,
        }),
        ctx.prisma.leaveRequest.findMany({
          where: {
            employee: {
              organizationId,
            },
            status: {
              in: [LeaveStatus.PENDING, LeaveStatus.PROCESSING],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          select: leaveRequestSelect,
        }),
        ctx.prisma.leaveRequest.count({
          where: {
            employee: {
              organizationId,
            },
            status: {
              in: [LeaveStatus.PENDING, LeaveStatus.PROCESSING],
            },
          },
        }),
        ctx.prisma.user.count({
          where: {
            organizationId,
            invitedAt: {
              not: null,
            },
            lastLoginAt: null,
          },
        }),
      ]);

    const allowedStatuses: EmploymentStatus[] = [
      EmploymentStatus.ACTIVE,
      EmploymentStatus.PROBATION,
    ];

    const activeEmployees = employees.filter(
      (employee) => employee.employment && allowedStatuses.includes(employee.employment.status),
    );
    const totalEmployees = activeEmployees.length;
    const headcountPrevMonthPivot = addDays(targetDate, -30);
    const previousHeadcount = activeEmployees.filter(
      (employee) =>
        employee.employment?.startDate &&
        employee.employment.startDate <= headcountPrevMonthPivot,
    ).length;
    const headcountChangePercent =
      previousHeadcount > 0
        ? ((totalEmployees - previousHeadcount) / previousHeadcount) * 100
        : 0;

    const presentStatuses = new Set<AttendanceStatus>([
      AttendanceStatus.PRESENT,
      AttendanceStatus.LATE,
      AttendanceStatus.REMOTE,
      AttendanceStatus.HALF_DAY,
    ]);
    const onTimeStatuses = new Set<AttendanceStatus>([
      AttendanceStatus.PRESENT,
      AttendanceStatus.REMOTE,
      AttendanceStatus.HALF_DAY,
    ]);

    const presentCount = attendanceToday.filter((record) =>
      presentStatuses.has(record.status),
    ).length;
    const previousPresent = attendanceYesterday.filter((record) =>
      presentStatuses.has(record.status),
    ).length;
    const coveragePercent =
      totalEmployees > 0 ? (presentCount / totalEmployees) * 100 : 0;
    const previousCoveragePercent =
      totalEmployees > 0 ? (previousPresent / totalEmployees) * 100 : 0;

    const accuracy =
      attendanceToday.length > 0
        ? (attendanceToday.filter((record) => onTimeStatuses.has(record.status)).length /
            attendanceToday.length) *
          100
        : 100;
    const previousAccuracy =
      attendanceYesterday.length > 0
        ? (attendanceYesterday.filter((record) => onTimeStatuses.has(record.status)).length /
            attendanceYesterday.length) *
          100
        : accuracy;

    const utilizedEmployees = activeEmployees.filter(
      (employee) => employee.employment?.currentProjectId,
    ).length;
    const utilizationPercent =
      totalEmployees > 0 ? (utilizedEmployees / totalEmployees) * 100 : 0;
    const previousEmployeesForUtilization = activeEmployees.filter(
      (employee) =>
        employee.employment?.startDate &&
        employee.employment.startDate <= headcountPrevMonthPivot,
    );
    const previousUtilized =
      previousEmployeesForUtilization.length > 0
        ? previousEmployeesForUtilization.filter(
            (employee) => employee.employment?.currentProjectId,
          ).length
        : utilizedEmployees;
    const previousUtilizationPercent =
      previousEmployeesForUtilization.length > 0
        ? (previousUtilized / previousEmployeesForUtilization.length) * 100
        : utilizationPercent;

    const missingCheckIns = Math.max(totalEmployees - attendanceToday.length, 0);
    const previousMissing = Math.max(totalEmployees - attendanceYesterday.length, 0);
    const openActions = pendingLeavesCount + missingCheckIns;
    const previousOpenActions = pendingLeavesCount + previousMissing;

    const statHighlights: HrDashboardStatCard[] = [
      {
        label: "People Strength",
        value: formatNumber(totalEmployees),
        trend: formatTrend(headcountChangePercent, "%"),
        descriptor: "vs last 30 days",
      },
      {
        label: "Attendance Accuracy",
        value: formatPercent(accuracy, 1),
        trend: formatTrend(accuracy - previousAccuracy, " pts"),
        descriptor: "vs yesterday",
      },
      {
        label: "Average Utilization",
        value: formatPercent(utilizationPercent, 0),
        trend: formatTrend(utilizationPercent - previousUtilizationPercent, " pts"),
        descriptor: "vs last month",
      },
      {
        label: "Open Actions",
        value: formatNumber(openActions),
        trend: formatTrend(openActions - previousOpenActions, "", 0),
        descriptor: "HR service desk",
      },
    ];

    const categoryGradients: Record<
      keyof ReturnType<typeof categorizeAttendance>,
      string
    > = {
      onsite: "from-emerald-400 to-emerald-500",
      remote: "from-sky-400 to-blue-500",
      late: "from-amber-400 to-orange-500",
      absent: "from-rose-400 to-pink-500",
    };

    const currentCategories = categorizeAttendance(attendanceToday);
    const previousCategories = categorizeAttendance(attendanceYesterday);
    const attendanceBreakdown: HrDashboardAttendanceBreakdownCard[] = (Object.keys(
      currentCategories,
    ) as Array<keyof typeof currentCategories>).map((key) => ({
      label:
        key === "onsite"
          ? "On-site"
          : key === "remote"
            ? "Remote"
            : key === "late"
              ? "Late"
              : "Absent",
      value: currentCategories[key],
      delta: formatDelta(currentCategories[key] - previousCategories[key]),
      gradient: categoryGradients[key],
    }));

    const sortedLogs = [...attendanceToday].sort((a, b) => {
      const left = a.checkInAt ? a.checkInAt.getTime() : 0;
      const right = b.checkInAt ? b.checkInAt.getTime() : 0;
      return right - left;
    });
    const attendanceLog = buildAttendanceLog(sortedLogs);
    const attendanceTrend = buildAttendanceTrend(attendanceToday);

    const latestSync = attendanceToday.reduce<Date | null>(
      (latest, record) => {
        if (!latest || record.updatedAt > latest) {
          return record.updatedAt;
        }
        return latest;
      },
      null,
    );

    const coverageSummary = buildCoverageSummary({
      presentCount,
      totalEmployees,
      previousCoverage: Math.round(previousCoveragePercent),
      latestSync,
    });

    const leaveApprovals = leaveRequests.map((request) => {
      const employment = request.employee.employment;
      const name = buildName({
        preferredName: request.employee.profile?.preferredName ?? null,
        firstName: request.employee.profile?.firstName ?? null,
        lastName: request.employee.profile?.lastName ?? null,
        fallback: request.employee.email,
      });
      const role = employment?.designation ?? "Team member";
      const duration = formatDurationLabel(
        request.startDate,
        request.endDate,
        decimalToNumber(request.totalDays),
      );
      const balanceField = leaveBalanceFieldByType[request.leaveType];
      const remaining = employment
        ? decimalToNumber(employment[balanceField])
        : 0;
      const balance = `${remaining} days remaining`;
      const coverage =
        employment?.currentProject?.name
          ? `${employment.currentProject.name} coverage in place`
          : employment?.department?.name
            ? `${employment.department.name} will cover`
            : employment?.currentProjectNote ?? "Coverage plan pending";
      return {
        id: request.id,
        name,
        role,
        type: leaveTypeLabelMap[toLeaveTypeValue(request.leaveType)],
        duration,
        balance,
        coverage,
        submitted: `Requested ${formatRelativeTime(request.createdAt)}`,
      };
    });

    const quickActions = buildQuickActions({
      missing: missingCheckIns,
      pendingLeaves: pendingLeavesCount,
      late: currentCategories.late,
    });

    const workforceCapacity = buildWorkforceCapacity(
      activeEmployees,
      6,
      pendingApprovalsCount,
      targetDate,
    );
    const workforceSignals = buildWorkforceSignals({
      pendingApprovals: pendingApprovalsCount,
      pendingLeaves: pendingLeavesCount,
    });
    const teamCapacity = buildTeamCapacity(activeEmployees);

    const engagementScore = Math.round(
      (coveragePercent + accuracy + utilizationPercent) / 3,
    );
    const previousEngagementScore = Math.round(
      (previousCoveragePercent + previousAccuracy + previousUtilizationPercent) / 3,
    );
    const engagementGauge: HrDashboardEngagementGauge = {
      value: engagementScore,
      change: formatTrend(engagementScore - previousEngagementScore, " pts"),
    };
    const engagementSnapshot: HrDashboardEngagementSnapshotItem[] = [
      {
        label: "Attendance coverage",
        value: formatPercent(Math.round(coveragePercent), 0),
        detail: "Employees checked in today",
      },
      {
        label: "Project utilization",
        value: formatPercent(Math.round(utilizationPercent), 0),
        detail: "Assigned to live projects",
      },
      {
        label: "Pending approvals",
        value: formatNumber(pendingApprovalsCount),
        detail: "Invites awaiting onboarding",
      },
    ];

    return {
      date: targetDate.toISOString(),
      statHighlights,
      coverageSummary,
      attendanceBreakdown,
      attendanceTrend,
      attendanceLog,
      leaveApprovals,
      quickActions,
      workforceCapacity,
      workforceSignals,
      engagementGauge,
      engagementSnapshot,
      teamCapacity,
    };
  },
};
