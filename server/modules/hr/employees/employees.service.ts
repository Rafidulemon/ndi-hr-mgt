import { EmploymentStatus, EmploymentType, Prisma, WorkModel } from "@prisma/client";

import type { TRPCContext } from "@/server/api/trpc";
import type {
  EmployeeDirectoryEntry,
  EmployeeStatus,
  HrEmployeeDashboardResponse,
  PendingApproval,
  PendingApprovalStatus,
} from "@/types/hr-admin";

import { requireHrAdmin } from "@/server/modules/hr/utils";

const employmentStatusToDirectoryStatus: Record<
  EmploymentStatus,
  EmployeeStatus
> = {
  [EmploymentStatus.ACTIVE]: "Active",
  [EmploymentStatus.PROBATION]: "Probation",
  [EmploymentStatus.SABBATICAL]: "On Leave",
  [EmploymentStatus.INACTIVE]: "Pending",
  [EmploymentStatus.TERMINATED]: "Pending",
};

const workModelLabels: Record<WorkModel, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERN: "Intern",
};

const employeeSelect = {
  id: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
      preferredName: true,
      workModel: true,
      currentAddress: true,
    },
  },
  employment: {
    select: {
      employeeCode: true,
      designation: true,
      employmentType: true,
      status: true,
      startDate: true,
      primaryLocation: true,
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
    },
  },
} as const satisfies Prisma.UserSelect;

type EmployeeRecord = Prisma.UserGetPayload<{ select: typeof employeeSelect }>;

const pendingApprovalSelect = {
  id: true,
  email: true,
  invitedAt: true,
  createdAt: true,
  status: true,
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
      startDate: true,
      department: {
        select: {
          name: true,
        },
      },
    },
  },
} as const satisfies Prisma.UserSelect;

type PendingRecord = Prisma.UserGetPayload<{ select: typeof pendingApprovalSelect }>;

type NameLikeProfile = {
  firstName: string | null;
  lastName: string | null;
  preferredName: string | null;
} | null | undefined;

const buildFullName = (profile: NameLikeProfile, fallback?: string) => {
  if (!profile) {
    return fallback ?? "Team member";
  }

  if (profile.preferredName) {
    return profile.preferredName;
  }

  const nameParts = [profile.firstName, profile.lastName].filter(Boolean);
  if (nameParts.length) {
    return nameParts.join(" ");
  }

  return fallback ?? "Team member";
};

const buildInitials = (
  profile?: EmployeeRecord["profile"] | PendingRecord["profile"] | null,
  fallback?: string,
) => {
  const createFromString = (value: string) =>
    value
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "HR";

  if (profile?.preferredName) {
    return createFromString(profile.preferredName);
  }

  const initials = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .map((part) => part![0]?.toUpperCase())
    .join("");

  if (initials) {
    return initials.slice(0, 2);
  }

  if (profile?.firstName) {
    return profile.firstName[0]?.toUpperCase() ?? "HR";
  }

  if (fallback) {
    return createFromString(fallback);
  }

  return "HR";
};

const mapEmploymentStatus = (status: EmploymentStatus): EmployeeStatus =>
  employmentStatusToDirectoryStatus[status] ?? "Active";

const formatExperience = (startDate?: Date | null) => {
  if (!startDate) {
    return "—";
  }

  const now = Date.now();
  const diffMs = now - startDate.getTime();
  if (diffMs <= 0) {
    return "—";
  }

  const years = diffMs / (1000 * 60 * 60 * 24 * 365);
  if (years < 1) {
    const months = Math.floor(years * 12);
    return months <= 1 ? "< 1 mo" : `${months} mo`;
  }

  const wholeYears = Math.floor(years);
  return `${wholeYears} yr${wholeYears > 1 ? "s" : ""}`;
};

const formatManagerName = (
  record: NonNullable<EmployeeRecord["employment"]>["manager"] | null | undefined,
) => {
  const profile = record?.profile;
  if (!profile) {
    return null;
  }

  if (profile.preferredName) {
    return profile.preferredName;
  }

  const nameParts = [profile.firstName, profile.lastName].filter(Boolean);
  return nameParts.length ? nameParts.join(" ") : null;
};

const formatDateToIso = (date?: Date | null) => (date ? date.toISOString() : null);

const mapEmployeeRecord = (record: EmployeeRecord): EmployeeDirectoryEntry => {
  const profile = record.profile;
  const employment = record.employment;

  const statusSource = employment?.status ?? record.status;

  return {
    id: record.id,
    employeeCode: employment?.employeeCode ?? null,
    name: buildFullName(profile, record.email),
    role: employment?.designation ?? "Team member",
    department: employment?.department?.name ?? null,
    squad: employment?.team?.name ?? null,
    location: employment?.primaryLocation ?? profile?.currentAddress ?? null,
    status: mapEmploymentStatus(statusSource),
    startDate: formatDateToIso(employment?.startDate),
    email: record.email,
    phone: record.phone ?? null,
    manager: formatManagerName(employment?.manager) ?? null,
    employmentType: employment
      ? employmentTypeLabels[employment.employmentType]
      : "—",
    workArrangement: profile?.workModel ? workModelLabels[profile.workModel] : null,
    avatarInitials: buildInitials(profile, record.email),
    experience: formatExperience(employment?.startDate),
  };
};

const mapPendingStatus = (status: EmploymentStatus): PendingApprovalStatus => {
  if (status === EmploymentStatus.ACTIVE) {
    return "Ready";
  }
  if (status === EmploymentStatus.PROBATION) {
    return "Awaiting Review";
  }
  return "Documents Pending";
};

const mapPendingRecord = (record: PendingRecord): PendingApproval => {
  const requestedAt = record.invitedAt ?? record.createdAt;
  const role = record.employment?.designation ?? "Pending assignment";

  return {
    id: record.id,
    name: buildFullName(record.profile, record.email),
    role,
    department: record.employment?.department?.name ?? null,
    requestedAt: formatDateToIso(requestedAt) ?? new Date().toISOString(),
    experience: formatExperience(record.employment?.startDate),
    email: record.email,
    channel: "Manual signup",
    note: `${role} is awaiting HR approval.`,
    status: mapPendingStatus(record.status),
  };
};

export const hrEmployeesService = {
  async getDashboard(ctx: TRPCContext): Promise<HrEmployeeDashboardResponse> {
    const user = requireHrAdmin(ctx);

    const [employees, pendingApprovals] = await Promise.all([
      ctx.prisma.user.findMany({
        where: {
          organizationId: user.organizationId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: employeeSelect,
      }),
      ctx.prisma.user.findMany({
        where: {
          organizationId: user.organizationId,
          invitedAt: {
            not: null,
          },
          lastLoginAt: null,
        },
        orderBy: {
          invitedAt: "desc",
        },
        select: pendingApprovalSelect,
      }),
    ]);

    return {
      directory: employees.map(mapEmployeeRecord),
      pendingApprovals: pendingApprovals.map(mapPendingRecord),
    };
  },
};
