import { EmploymentStatus, EmploymentType, Prisma, UserRole, WorkModel } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

import type { TRPCContext } from "@/server/api/trpc";
import type {
  EmployeeDirectoryEntry,
  EmployeeStatus,
  HrEmployeeDashboardResponse,
  HrEmployeeForm,
  HrEmployeeFormResponse,
  HrEmployeeInviteInput,
  HrEmployeeInviteResponse,
  HrEmployeeLeaveQuotaResponse,
  HrEmployeeLeaveQuotaUpdateInput,
  HrInviteRoleOption,
  HrManualInviteOptions,
  HrEmployeeProfile,
  HrEmployeeProfileResponse,
  HrEmployeeUpdateInput,
  PendingApproval,
  PendingApprovalStatus,
} from "@/types/hr-admin";

import { requireHrAdmin } from "@/server/modules/hr/utils";
import { addHours, createRandomToken, hashToken } from "@/server/utils/token";

type PrismaTransaction = Prisma.TransactionClient;

const privilegedDeletionRoles: UserRole[] = ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "MANAGER"];
const managerEligibleRoles: UserRole[] = ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "MANAGER", "HR_ADMIN"];

const INVITE_TOKEN_TTL_HOURS =
  Number(
    process.env.NEXT_PUBLIC_INVITE_TOKEN_TTL_HOURS ??
      process.env.INVITE_TOKEN_TTL_HOURS ??
      72,
  ) || 72;

const inviteRoleMatrix: Record<UserRole, UserRole[]> = {
  SUPER_ADMIN: ["ORG_ADMIN", "MANAGER", "HR_ADMIN", "EMPLOYEE"],
  ORG_OWNER: ["ORG_ADMIN", "MANAGER", "HR_ADMIN", "EMPLOYEE"],
  ORG_ADMIN: ["MANAGER", "HR_ADMIN", "EMPLOYEE"],
  MANAGER: ["HR_ADMIN", "EMPLOYEE"],
  HR_ADMIN: ["EMPLOYEE"],
  EMPLOYEE: [],
};

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_OWNER: "Org Owner",
  ORG_ADMIN: "Org Admin",
  HR_ADMIN: "HR Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

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

const getAllowedInviteRoles = (role: UserRole): UserRole[] => inviteRoleMatrix[role] ?? [];

const formatRoleLabel = (role: UserRole) => roleLabels[role] ?? role;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const sanitizeOptional = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const parseStartDateInput = (value?: string | null) => {
  if (!value) {
    return new Date();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid start date." });
  }
  return parsed;
};

const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

const buildInviteLink = (token: string, email: string) =>
  `${getSiteUrl()}/auth/signup?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

const createPlaceholderPasswordHash = async () => {
  const randomSecret = createRandomToken(24);
  return bcrypt.hash(randomSecret, 10);
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
      parentalLeaveBalance: true,
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

const sendInvitationEmail = async ({
  to,
  inviteLink,
  organizationName,
  invitedRole,
  recipientName,
  expiresAt,
  senderName,
}: {
  to: string;
  inviteLink: string;
  organizationName: string;
  invitedRole: UserRole;
  recipientName: string;
  expiresAt: Date;
  senderName?: string | null;
}) => {
  const emailUser = process.env.NEXT_PUBLIC_EMAIL_USER;
  const emailPass = process.env.NEXT_PUBLIC_EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("Email credentials are not configured. Skipping invite email.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const greeting = recipientName ? `Hi ${recipientName},` : "Hi there,";
  const expiresLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(expiresAt);
  const senderDisplay = senderName?.trim()?.length ? senderName : "NDI HR team";
  const roleLabel = formatRoleLabel(invitedRole);

  const textBody = [
    greeting,
    "",
    `${senderDisplay} invited you to join ${organizationName} on NDI HR as ${roleLabel}.`,
    "Use the secure link below to finish setting up your account and choose a password.",
    "",
    inviteLink,
    "",
    `For security, your invitation link will expire on ${expiresLabel}.`,
    "",
    "See you inside,",
    senderDisplay,
  ].join("\n");

  await transporter.sendMail({
    from: `"${organizationName} HR" <${emailUser}>`,
    to,
    subject: `You're invited to ${organizationName} on NDI HR`,
    text: textBody,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <p>${greeting}</p>
        <p>${senderDisplay} invited you to join <strong>${organizationName}</strong> on NDI HR as <strong>${roleLabel}</strong>.</p>
        <p>Use the secure link below to finish setting up your account and choose a password. The link will expire on <strong>${expiresLabel}</strong>.</p>
        <p style="margin: 24px 0;">
          <a
            href="${inviteLink}"
            style="background: #4f46e5; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;"
          >
            Get started
          </a>
        </p>
        <p style="margin-bottom: 16px;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${inviteLink}">${inviteLink}</a></p>
        <p>See you inside,<br />${senderDisplay}</p>
      </div>
    `,
  });

  return true;
};

const buildManualInviteOptions = async ({
  prisma,
  organizationId,
  viewerRole,
}: {
  prisma: TRPCContext["prisma"];
  organizationId: string;
  viewerRole: UserRole;
}): Promise<HrManualInviteOptions> => {
  const [organization, departments, managerRecords, locationRecords] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        domain: true,
      },
    }),
    prisma.department.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: {
        organizationId,
        role: {
          in: managerEligibleRoles,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        email: true,
        role: true,
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
          },
        },
      },
    }),
    prisma.employmentDetail.findMany({
      where: {
        organizationId,
        primaryLocation: {
          not: null,
        },
      },
      distinct: ["primaryLocation"],
      select: {
        primaryLocation: true,
      },
    }),
  ]);

  const employmentTypes = (Object.keys(employmentTypeLabels) as EmploymentType[]).map((type) => ({
    value: type,
    label: employmentTypeLabels[type],
  }));

  const locations = locationRecords
    .map((record) => record.primaryLocation?.trim())
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => a.localeCompare(b));

  const managers = managerRecords.map((record) => ({
    id: record.id,
    name: buildFullName(record.profile, record.email),
    role: record.role,
    designation: record.employment?.designation ?? null,
  }));

  const allowedRoles: HrInviteRoleOption[] = getAllowedInviteRoles(viewerRole).map((role) => ({
    value: role,
    label: formatRoleLabel(role),
  }));

  return {
    organizationDomain: organization?.domain ?? null,
    organizationName: organization?.name ?? "Your organization",
    departments,
    managers,
    locations,
    employmentTypes,
    allowedRoles,
  };
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
      parental: decimalToNumber(employment?.parentalLeaveBalance),
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
    leaveBalances: {
      annual: decimalToNumber(employment?.annualLeaveBalance),
      sick: decimalToNumber(employment?.sickLeaveBalance),
      casual: decimalToNumber(employment?.casualLeaveBalance),
      parental: decimalToNumber(employment?.parentalLeaveBalance),
    },
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

    const [employees, pendingApprovals, manualInvite] = await Promise.all([
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
      buildManualInviteOptions({
        prisma: ctx.prisma,
        organizationId: user.organizationId,
        viewerRole: user.role as UserRole,
      }),
    ]);

    return {
      viewerRole: user.role as UserRole,
      directory: employees.map(mapEmployeeRecord),
      pendingApprovals: pendingApprovals.map(mapPendingRecord),
      manualInvite,
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

  async updateLeaveBalances(
    ctx: TRPCContext,
    input: HrEmployeeLeaveQuotaUpdateInput,
  ): Promise<HrEmployeeLeaveQuotaResponse> {
    const sessionUser = requireHrAdmin(ctx);
    const employment = await ctx.prisma.employmentDetail.findFirst({
      where: {
        userId: input.employeeId,
        user: {
          organizationId: sessionUser.organizationId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!employment) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    const clampBalance = (value: number) =>
      Number(Math.max(0, Math.min(value, 365)).toFixed(2));

    const updated = await ctx.prisma.employmentDetail.update({
      where: { id: employment.id },
      data: {
        annualLeaveBalance: clampBalance(input.annual),
        sickLeaveBalance: clampBalance(input.sick),
        casualLeaveBalance: clampBalance(input.casual),
        parentalLeaveBalance: clampBalance(input.parental),
      },
      select: {
        annualLeaveBalance: true,
        sickLeaveBalance: true,
        casualLeaveBalance: true,
        parentalLeaveBalance: true,
      },
    });

    return {
      leaveBalances: {
        annual: decimalToNumber(updated.annualLeaveBalance),
        sick: decimalToNumber(updated.sickLeaveBalance),
        casual: decimalToNumber(updated.casualLeaveBalance),
        parental: decimalToNumber(updated.parentalLeaveBalance),
      },
    };
  },

  async inviteEmployee(
    ctx: TRPCContext,
    input: HrEmployeeInviteInput,
  ): Promise<HrEmployeeInviteResponse> {
    const sessionUser = requireHrAdmin(ctx);
    const viewerRole = sessionUser.role as UserRole;
    const allowedRoles = getAllowedInviteRoles(viewerRole);

    if (!allowedRoles.includes(input.inviteRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to invite that role.",
      });
    }

    const organization = await ctx.prisma.organization.findUnique({
      where: { id: sessionUser.organizationId },
      select: {
        id: true,
        name: true,
        domain: true,
      },
    });

    if (!organization) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Your organization is not available.",
      });
    }

    const normalizedEmail = normalizeEmail(input.workEmail);
    const departmentId = sanitizeOptional(input.departmentId);
    const managerId = sanitizeOptional(input.managerId);

    if (departmentId) {
      const departmentExists = await ctx.prisma.department.findFirst({
        where: {
          id: departmentId,
          organizationId: organization.id,
        },
        select: { id: true },
      });
      if (!departmentExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Selected department does not exist.",
        });
      }
    }

    if (managerId) {
      const managerExists = await ctx.prisma.user.findFirst({
        where: {
          id: managerId,
          organizationId: organization.id,
        },
        select: { id: true },
      });
      if (!managerExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Selected manager does not exist.",
        });
      }
    }

    const designation = input.designation.trim();
    if (!designation) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Role/title cannot be empty.",
      });
    }

    const { firstName, lastName } = splitFullName(input.fullName);
    const startDate = parseStartDateInput(input.startDate);
    const placeholderPasswordHash = await createPlaceholderPasswordHash();

    const invitation = await ctx.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account already exists for that email address.",
        });
      }

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email: normalizedEmail,
          passwordHash: placeholderPasswordHash,
          role: input.inviteRole,
          status: EmploymentStatus.INACTIVE,
          invitedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
        },
      });

      await tx.employeeProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          preferredName: firstName,
          workEmail: normalizedEmail,
        },
      });

      await tx.employmentDetail.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          designation,
          employmentType: input.employmentType,
          status: EmploymentStatus.INACTIVE,
          startDate,
          departmentId: departmentId ?? undefined,
          primaryLocation: sanitizeOptional(input.workLocation),
          reportingManagerId: managerId ?? undefined,
          currentProjectNote: sanitizeOptional(input.notes),
        },
      });

      await tx.invitationToken.deleteMany({
        where: { userId: user.id },
      });

      const rawToken = createRandomToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = addHours(INVITE_TOKEN_TTL_HOURS);

      await tx.invitationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      return {
        user,
        rawToken,
        expiresAt,
      };
    });

    const inviteLink = buildInviteLink(invitation.rawToken, normalizedEmail);
    const senderDisplayName =
      ctx.session?.user?.profile?.preferredName ??
      ctx.session?.user?.profile?.firstName ??
      ctx.session?.user?.email ??
      sessionUser.email ??
      null;
    let invitationSent = false;

    if (input.sendInvite ?? true) {
      try {
        invitationSent = await sendInvitationEmail({
          to: normalizedEmail,
          inviteLink,
          organizationName: organization.name,
          invitedRole: input.inviteRole,
          recipientName: firstName,
          expiresAt: invitation.expiresAt,
          senderName: senderDisplayName,
        });
      } catch (error) {
        console.error("Failed to send invite email:", error);
        invitationSent = false;
      }
    }

    return {
      userId: invitation.user.id,
      email: normalizedEmail,
      role: input.inviteRole,
      invitationSent,
      inviteUrl: inviteLink,
    };
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
