import { UserInfoParam } from "@/app/(auth)/auth/registration/[email]/[token]/page";
import { nextAuthOptions } from "@/app/utils/next-auth-options";
import { prisma } from "@/prisma";
import { EmploymentStatus, EmploymentType, Prisma } from "@prisma/client";
import { type UserPasswordUpdateType } from "@/types/types";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import type { RegisterInput } from "./auth.validation";

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeText = (value: string) => value.trim();
const sanitizeUrl = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const getDomainFromEmail = (email: string) => {
  const [, domain] = email.split("@");
  return domain ? domain.trim().toLowerCase().replace(/^www\./, "") : null;
};

const findOrganizationForEmail = async (email: string) => {
  const domain = getDomainFromEmail(email);

  if (domain) {
    const matchedOrganization = await prisma.organization.findFirst({
      where: {
        domain: {
          equals: domain,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        domain: true,
      },
    });

    if (matchedOrganization) {
      return matchedOrganization;
    }
  }

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      domain: true,
    },
    take: 2,
  });

  if (!organizations.length) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "No organization is configured for sign ups yet.",
    });
  }

  if (domain && organizations.length > 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "We couldn't match your email domain to a workspace. Please use your company email or ask your administrator to invite you.",
    });
  }

  return organizations[0]!;
};

const findOrCreateDepartment = async (
  client: PrismaClientOrTx,
  organizationId: string,
  departmentName?: string,
) => {
  const normalizedDepartment = departmentName?.trim();
  if (!normalizedDepartment) {
    return null;
  }

  const existingDepartment = await client.department.findFirst({
    where: {
      organizationId,
      name: {
        equals: normalizedDepartment,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  if (existingDepartment) {
    return existingDepartment.id;
  }

  const createdDepartment = await client.department.create({
    data: {
      organizationId,
      name: normalizedDepartment,
    },
    select: {
      id: true,
    },
  });

  return createdDepartment.id;
};

const registerUser = async (input: RegisterInput) => {
  const email = normalizeEmail(input.email);
  const firstName = normalizeText(input.firstName);
  const lastName = normalizeText(input.lastName);
  const designation = normalizeText(input.designation);
  const departmentName = normalizeText(input.department);
  const employeeCode = normalizeText(input.employeeId);
  const profilePhotoUrl = sanitizeUrl(input.profilePhotoUrl);

  if (!firstName || !lastName || !designation || !departmentName || !employeeCode) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "All fields are required.",
    });
  }

  try {
    const organization = await findOrganizationForEmail(email);

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "An account already exists for this email address.",
      });
    }

    const duplicateEmployee = await prisma.employmentDetail.findFirst({
      where: {
        organizationId: organization.id,
        employeeCode,
      },
      select: { id: true },
    });

    if (duplicateEmployee) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This employee ID is already registered in your workspace.",
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const createdUser = await prisma.$transaction(async (tx) => {
      const departmentId = await findOrCreateDepartment(tx, organization.id, departmentName);

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email,
          passwordHash,
          role: "EMPLOYEE",
          status: EmploymentStatus.PROBATION,
        },
        select: {
          id: true,
        },
      });

      await tx.employeeProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          preferredName: firstName,
          workEmail: email,
          profilePhotoUrl,
        },
      });

      await tx.employmentDetail.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          employeeCode,
          designation,
          employmentType: EmploymentType.FULL_TIME,
          status: EmploymentStatus.PROBATION,
          startDate: new Date(),
          departmentId: departmentId ?? undefined,
        },
      });

      return user;
    });

    return {
      userId: createdUser.id,
      email,
      organizationId: organization.id,
      organizationName: organization.name,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This email or employee ID is already registered.",
      });
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to create account right now.",
    });
  }
};

const sendResetPasswordLinkService = async (email: string) => {
  if (!email) {
    return null;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
      select: {
        email: true,
        id: true,
      },
    });

    return user;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send email!",
    });
  }
};

const updateUserPassworIntoDb = async (input: UserPasswordUpdateType) => {
  const { userId, password } = input;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedAccount = await prisma.user.updateMany({
      where: {
        id: userId,
      },
      data: {
        passwordHash: hashedPassword,
      },
    });

    if (updatedAccount.count === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `User with id ${userId} not found`,
      });
    }

    return { message: "Password updated successfully" };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update password into db",
    });
  }
};

const tokenValidate = async ({ token }: { token: string }) => {
  try {
    const JWT_SECRET =
      process.env.NEXT_PUBLIC_JWT_SECRET || process.env.JWT_SECRET || "Nw3oRAt7GSozu9";
    const decoded = jwt.verify(token, JWT_SECRET) as UserInfoParam;

    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Token has expired",
      });
    }
    return decoded;
  } catch (error) {
    void error;
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }
};

const isAuthorisationChange = async () => {
  const session = await getServerSession(nextAuthOptions);

  if (!session?.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to perform this action",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return session.user.role !== user.role;
};

const isTrialExpired = async (email: string) => {
  const trialDurationDays = Number(process.env.NEXT_PUBLIC_TRIAL_DURATION_DAYS ?? 10);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      updatedAt: true,
      organization: {
        select: {
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  const contractDate = user.organization?.createdAt ?? user.updatedAt ?? new Date();
  const trialEndDate = new Date(contractDate.getTime() + trialDurationDays * MILLISECONDS_IN_DAY);

  const isTrialExpiredFlag = trialEndDate.getTime() < Date.now();
  const isVisibilityPrivate = process.env.NEXT_PUBLIC_ACCOUNT_VISIBILITY === "PRIVATE";

  return {
    isTrialExpired: isTrialExpiredFlag || isVisibilityPrivate,
    role: user.role,
    id: user.id,
    updated_at: user.updatedAt,
    twoFactor: false,
  };
};

export const AuthService = {
  registerUser,
  sendResetPasswordLinkService,
  updateUserPassworIntoDb,
  tokenValidate,
  isAuthorisationChange,
  isTrialExpired,
};
