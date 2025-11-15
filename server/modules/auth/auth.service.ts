import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import { authUserSelect, type AuthUser } from "@/server/auth/selection";
import {
  buildSessionRemovalCookie,
  createSession,
  deleteSessionById,
} from "@/server/auth/session";
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "@/server/auth/password-reset";
import type { PrismaDB } from "@/server/db";
import {
  loginSchema,
  registerSchema,
  requestResetSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type RequestResetInput,
  type ResetPasswordInput,
} from "./auth.validation";

const sanitizeUser = (user: AuthUser) => user;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toTitleCase = (value: string) =>
  value
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

async function resolveOrganization(prisma: PrismaDB, email: string, fallbackName: string) {
  const [, rawDomain] = email.split("@");
  const normalizedDomain = rawDomain?.toLowerCase() ?? null;

  if (normalizedDomain) {
    const existing = await prisma.organization.findUnique({
      where: { domain: normalizedDomain },
    });

    if (existing) {
      return existing;
    }
  }

  const orgName = normalizedDomain
    ? toTitleCase(normalizedDomain.split(".")[0] ?? fallbackName)
    : `${fallbackName} Workspace`;

  return prisma.organization.create({
    data: {
      name: orgName,
      domain: normalizedDomain,
    },
  });
}

export const authService = {
  async login(ctx: TRPCContext, input: LoginInput) {
    const parsed = loginSchema.parse(input);
    const email = normalizeEmail(parsed.email);

    const userRecord = await ctx.prisma.user.findUnique({
      where: { email },
      select: {
        passwordHash: true,
        ...authUserSelect,
      },
    });

    if (!userRecord) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(parsed.password, userRecord.passwordHash);
    if (!isValidPassword) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }

    const { cookie } = await createSession(userRecord.id, parsed.remember ?? false);

    await ctx.prisma.user.update({
      where: { id: userRecord.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _ignoredPassword, ...safeUser } = userRecord;
    void _ignoredPassword;

    return {
      user: sanitizeUser(safeUser),
      cookie,
    };
  },

  async logout(ctx: TRPCContext) {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    await deleteSessionById(ctx.session.id);

    return {
      cookie: buildSessionRemovalCookie(),
    };
  },

  async register(ctx: TRPCContext, input: RegisterInput) {
    const parsed = registerSchema.parse(input);
    const email = normalizeEmail(parsed.email);

    const existingUser = await ctx.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
    }

    const organization = await resolveOrganization(
      ctx.prisma,
      email,
      `${parsed.firstName} ${parsed.lastName}`.trim() || "New Workspace",
    );

    const passwordHash = await bcrypt.hash(parsed.password, 12);

    const userId = await ctx.prisma.$transaction(async (tx) => {
      const department = await tx.department.upsert({
        where: {
          organizationId_name: {
            organizationId: organization.id,
            name: parsed.department,
          },
        },
        update: {},
        create: {
          organizationId: organization.id,
          name: parsed.department,
        },
      });

      const userRecord = await tx.user.create({
        data: {
          email,
          passwordHash,
          organizationId: organization.id,
          role: "EMPLOYEE",
          status: "ACTIVE",
        },
      });

      await tx.employeeProfile.create({
        data: {
          userId: userRecord.id,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          preferredName: parsed.firstName,
          workEmail: email,
        },
      });

      await tx.employmentDetail.create({
        data: {
          userId: userRecord.id,
          organizationId: organization.id,
          employeeCode: parsed.employeeId,
          designation: parsed.designation,
          employmentType: "FULL_TIME",
          startDate: new Date(),
          departmentId: department.id,
        },
      });

      return userRecord.id;
    });

    const createdUser = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: authUserSelect,
    });

    return {
      user: createdUser ? sanitizeUser(createdUser) : null,
    };
  },

  async requestPasswordReset(ctx: TRPCContext, input: RequestResetInput) {
    const parsed = requestResetSchema.parse(input);
    const email = normalizeEmail(parsed.email);

    const user = await ctx.prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (!user) {
      return {
        message: "If an account exists with that email, a reset link has been generated.",
      };
    }

    const { token, resetToken } = await createPasswordResetToken(user.id);

    return {
      message: "If an account exists with that email, a reset link has been generated.",
      token,
      expiresAt: resetToken.expiresAt,
    };
  },

  async resetPassword(ctx: TRPCContext, input: ResetPasswordInput) {
    const parsed = resetPasswordSchema.parse(input);

    const tokenRecord = await verifyPasswordResetToken(parsed.token);

    if (!tokenRecord) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The reset link is invalid or has expired.",
      });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);

    await ctx.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });

      await tx.session.deleteMany({
        where: { userId: tokenRecord.userId },
      });
    });

    return {
      success: true,
      cookie: buildSessionRemovalCookie(),
    };
  },
};
