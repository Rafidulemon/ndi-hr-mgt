import { EmploymentStatus, EmploymentType, Prisma, UserRole, WorkModel } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import type {
  EmployeeDirectoryEntry,
  EmployeeStatus,
  HrEmployeeDashboardResponse,
  HrEmployeeForm,
  HrEmployeeFormResponse,
  HrEmployeeProfile,
  HrEmployeeProfileResponse,
  HrEmployeeUpdateInput,
  PendingApproval,
  PendingApprovalStatus,
} from "@/types/hr-admin";

import { requireHrAdmin } from "@/server/modules/hr/utils";

type PrismaTransaction = Prisma.TransactionClient;

const privilegedDeletionRoles: UserRole[] = ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "MANAGER"];

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
      profilePhotoUrl: true,
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

const employeeDetailSelect = {
  id: true,
  email: true,
  phone: true,
  status: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
      preferredName: true,
      workModel: true,
      currentAddress: true,
      permanentAddress: true,
      workEmail: true,
      workPhone: true,
      profilePhotoUrl: true,
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
          id: true,
          name: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      manager: {
        select: {
          id: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              preferredName: true,
            },
          },
        },
      },
      casualLeaveBalance: true,
      sickLeaveBalance: true,
      annualLeaveBalance: true,
    },
  },
  emergencyContacts: {
    select: {
      id: true,
      name: true,
      relationship: true,
      phone: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 1,
  },
} as const satisfies Prisma.UserSelect;

type EmployeeDetailRecord = Prisma.UserGetPayload<{ select: typeof employeeDetailSelect }>;

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
    profilePhotoUrl: profile?.profilePhotoUrl ?? null,
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

const employmentStatusFromLabel = (status: EmployeeStatus): EmploymentStatus => {
  const match = Object.entries(employmentStatusToDirectoryStatus).find(
    ([, label]) => label === status,
  );
  return (match?.[0] as EmploymentStatus) ?? EmploymentStatus.ACTIVE;
};

const decimalToNumber = (value?: Prisma.Decimal | null) =>
  value ? Number(value) : 0;

const findEmploymentTypeByLabel = (label?: string | null) => {
  if (!label) {
    return EmploymentType.FULL_TIME;
  }

  const entry = Object.entries(employmentTypeLabels).find(
    ([, value]) => value.toLowerCase() === label.toLowerCase(),
  );

  return (entry?.[0] as EmploymentType) ?? EmploymentType.FULL_TIME;
};

const findWorkModelByLabel = (label?: string | null) => {
  if (!label) {
    return null;
  }

  const entry = Object.entries(workModelLabels).find(
    ([, value]) => value.toLowerCase() === label.toLowerCase(),
  );

  return (entry?.[0] as WorkModel) ?? null;
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: fullName.trim() || "Employee", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0]!, lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "",
  };
};

const mapEmployeeProfileDetail = (record: EmployeeDetailRecord): HrEmployeeProfile => {
  const profile = record.profile;
  const employment = record.employment;
  const emergencyContact = record.emergencyContacts?.[0];

  return {
    id: record.id,
    employeeCode: employment?.employeeCode ?? null,
    name: buildFullName(profile, record.email),
    role: employment?.designation ?? "Team member",
    department: employment?.department?.name ?? null,
    squad: employment?.team?.name ?? null,
    location: employment?.primaryLocation ?? profile?.currentAddress ?? null,
    status: mapEmploymentStatus(employment?.status ?? record.status),
    startDate: formatDateToIso(employment?.startDate),
    email: profile?.workEmail ?? record.email,
    phone: record.phone ?? profile?.workPhone ?? null,
    manager: formatManagerName(employment?.manager) ?? null,
    employmentType: employment ? employmentTypeLabels[employment.employmentType] : "Full-time",
    workArrangement: profile?.workModel ? workModelLabels[profile.workModel] : null,
    avatarInitials: buildInitials(profile, record.email),
    profilePhotoUrl: profile?.profilePhotoUrl ?? null,
    experience: formatExperience(employment?.startDate),
    address: profile?.currentAddress ?? profile?.permanentAddress ?? null,
    emergencyContact: emergencyContact
      ? {
          name: emergencyContact.name,
          phone: emergencyContact.phone,
          relation: emergencyContact.relationship,
        }
      : null,
    leaveBalances: {
      annual: decimalToNumber(employment?.annualLeaveBalance),
      sick: decimalToNumber(employment?.sickLeaveBalance),
      casual: decimalToNumber(employment?.casualLeaveBalance),
    },
    tags: [],
    skills: [],
    documents: [],
    salaryBand: null,
    annualSalary: null,
    lastReview: null,
    nextReview: null,
  };
};

const mapEmployeeForm = (record: EmployeeDetailRecord): HrEmployeeForm => {
  const profile = record.profile;
  const employment = record.employment;
  const emergencyContact = record.emergencyContacts?.[0];

  const fullNameParts = [profile?.firstName, profile?.lastName].filter(Boolean);
  const fullName = fullNameParts.length
    ? fullNameParts.join(" ")
    : buildFullName(profile, record.email);

  return {
    id: record.id,
    employeeCode: employment?.employeeCode ?? null,
    fullName,
    preferredName: profile?.preferredName ?? null,
    email: profile?.workEmail ?? record.email,
    phone: record.phone ?? profile?.workPhone ?? null,
    address: profile?.currentAddress ?? profile?.permanentAddress ?? null,
    role: employment?.designation ?? "",
    department: employment?.department?.name ?? null,
    employmentType: employment
      ? employmentTypeLabels[employment.employmentType]
      : employmentTypeLabels[EmploymentType.FULL_TIME],
    workArrangement: profile?.workModel ? workModelLabels[profile.workModel] : null,
    workLocation: employment?.primaryLocation ?? null,
    startDate: formatDateToIso(employment?.startDate),
    status: mapEmploymentStatus(employment?.status ?? record.status),
    emergencyContact: emergencyContact
      ? {
          name: emergencyContact.name,
          phone: emergencyContact.phone,
          relation: emergencyContact.relationship,
        }
      : null,
    profilePhotoUrl: profile?.profilePhotoUrl ?? null,
  };
};

const deleteUserCascade = async (tx: PrismaTransaction, userId: string) => {
  await tx.department.updateMany({
    where: { headId: userId },
    data: { headId: null },
  });

  await tx.notification.updateMany({
    where: { senderId: userId },
    data: { senderId: null },
  });

  await tx.emergencyContact.deleteMany({ where: { userId } });
  await tx.employeeBankAccount.deleteMany({ where: { userId } });
  await tx.attendanceRecord.deleteMany({ where: { employeeId: userId } });
  await tx.leaveRequest.deleteMany({
    where: {
      OR: [{ employeeId: userId }, { reviewerId: userId }],
    },
  });
  await tx.employeeProfile.deleteMany({ where: { userId } });
  await tx.employmentDetail.deleteMany({ where: { userId } });
  await tx.session.deleteMany({ where: { userId } });
  await tx.passwordResetToken.deleteMany({ where: { userId } });
  await tx.user.delete({ where: { id: userId } });
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
          status: EmploymentStatus.INACTIVE,
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
      viewerRole: user.role as UserRole,
      directory: employees.map(mapEmployeeRecord),
      pendingApprovals: pendingApprovals.map(mapPendingRecord),
    };
  },

  async getEmployeeProfile(
    ctx: TRPCContext,
    employeeId: string,
  ): Promise<HrEmployeeProfileResponse> {
    const sessionUser = requireHrAdmin(ctx);

    const record = await ctx.prisma.user.findFirst({
      where: {
        id: employeeId,
        organizationId: sessionUser.organizationId,
      },
      select: employeeDetailSelect,
    });

    if (!record) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    return { profile: mapEmployeeProfileDetail(record) };
  },

  async getEmployeeForm(
    ctx: TRPCContext,
    employeeId: string,
  ): Promise<HrEmployeeFormResponse> {
    const sessionUser = requireHrAdmin(ctx);

    const record = await ctx.prisma.user.findFirst({
      where: {
        id: employeeId,
        organizationId: sessionUser.organizationId,
      },
      select: employeeDetailSelect,
    });

    if (!record) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    return { form: mapEmployeeForm(record) };
  },

  async updateEmployee(
    ctx: TRPCContext,
    input: HrEmployeeUpdateInput,
  ): Promise<HrEmployeeFormResponse> {
    const sessionUser = requireHrAdmin(ctx);
    const existing = await ctx.prisma.user.findFirst({
      where: {
        id: input.employeeId,
        organizationId: sessionUser.organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    const { firstName, lastName } = splitFullName(input.fullName);
    const employmentType = findEmploymentTypeByLabel(input.employmentType);
    const workModel = findWorkModelByLabel(input.workArrangement);
    const employmentStatus = employmentStatusFromLabel(input.status);

    let departmentId: string | null = null;
    const normalizedDepartment = input.department?.trim();
    if (normalizedDepartment) {
      const department = await ctx.prisma.department.findFirst({
        where: {
          organizationId: sessionUser.organizationId,
          name: normalizedDepartment,
        },
      });

      if (department) {
        departmentId = department.id;
      } else {
        const createdDepartment = await ctx.prisma.department.create({
          data: {
            organizationId: sessionUser.organizationId,
            name: normalizedDepartment,
          },
        });
        departmentId = createdDepartment.id;
      }
    }

    let parsedStartDate: Date | null = null;
    if (input.startDate) {
      const candidate = new Date(input.startDate);
      if (Number.isNaN(candidate.getTime())) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid start date." });
      }
      parsedStartDate = candidate;
    }

    await ctx.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: input.employeeId },
        data: {
          email: input.email,
          phone: input.phone,
        },
      });

      await tx.employeeProfile.update({
        where: { userId: input.employeeId },
        data: {
          firstName,
          lastName,
          preferredName: input.preferredName,
          workEmail: input.email,
          workPhone: input.phone,
          currentAddress: input.address,
          workModel,
        },
      });

      await tx.employmentDetail.update({
        where: { userId: input.employeeId },
        data: {
          designation: input.role,
          employmentType,
          primaryLocation: input.workLocation,
          startDate: parsedStartDate ?? undefined,
          departmentId,
          status: employmentStatus,
        },
      });

      const hasEmergencyValues =
        Boolean(input.emergencyName?.trim()) ||
        Boolean(input.emergencyPhone?.trim()) ||
        Boolean(input.emergencyRelation?.trim());

      if (hasEmergencyValues) {
        const existingContact = await tx.emergencyContact.findFirst({
          where: { userId: input.employeeId },
        });

        const emergencyData = {
          name: input.emergencyName?.trim() || "Emergency contact",
          phone: input.emergencyPhone?.trim() || "",
          relationship: input.emergencyRelation?.trim() || "Family",
        };

        if (existingContact) {
          await tx.emergencyContact.update({
            where: { id: existingContact.id },
            data: emergencyData,
          });
        } else {
          await tx.emergencyContact.create({
            data: {
              userId: input.employeeId,
              ...emergencyData,
            },
          });
        }
      } else {
        await tx.emergencyContact.deleteMany({
          where: { userId: input.employeeId },
        });
      }
    });

    return this.getEmployeeForm(ctx, input.employeeId);
  },

  async approvePendingEmployee(ctx: TRPCContext, employeeId: string) {
    const sessionUser = requireHrAdmin(ctx);
    const employee = await ctx.prisma.user.findFirst({
      where: {
        id: employeeId,
        ...(sessionUser.role === "SUPER_ADMIN"
          ? {}
          : { organizationId: sessionUser.organizationId }),
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!employee) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    if (employee.status !== EmploymentStatus.INACTIVE) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only pending signups can be approved.",
      });
    }

    await ctx.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: employeeId },
        data: {
          status: EmploymentStatus.ACTIVE,
          invitedAt: null,
        },
      });

      await tx.employmentDetail.updateMany({
        where: { userId: employeeId },
        data: {
          status: EmploymentStatus.ACTIVE,
        },
      });
    });

    return { message: "Signup request approved." };
  },

  async rejectPendingEmployee(ctx: TRPCContext, employeeId: string) {
    const sessionUser = requireHrAdmin(ctx);
    const employee = await ctx.prisma.user.findFirst({
      where: {
        id: employeeId,
        ...(sessionUser.role === "SUPER_ADMIN"
          ? {}
          : { organizationId: sessionUser.organizationId }),
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!employee) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    if (employee.status !== EmploymentStatus.INACTIVE) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only pending signups can be rejected.",
      });
    }

    await ctx.prisma.$transaction(async (tx) => {
      await deleteUserCascade(tx, employeeId);
    });

    return { message: "Signup request rejected." };
  },

  async deleteEmployee(ctx: TRPCContext, employeeId: string) {
    const sessionUser = requireHrAdmin(ctx);
    const viewerRole = sessionUser.role as UserRole;

    if (!privilegedDeletionRoles.includes(viewerRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to delete employee accounts.",
      });
    }

    if (sessionUser.id === employeeId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot delete your own account.",
      });
    }

    const employee = await ctx.prisma.user.findFirst({
      where: {
        id: employeeId,
        ...(viewerRole === "SUPER_ADMIN"
          ? {}
          : { organizationId: sessionUser.organizationId }),
      },
      select: {
        id: true,
      },
    });

    if (!employee) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    await ctx.prisma.$transaction(async (tx) => {
      await deleteUserCascade(tx, employeeId);
    });

    return { message: "Employee deleted." };
  },
};
