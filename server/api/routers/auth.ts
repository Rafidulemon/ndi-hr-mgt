import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
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

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

const registerInput = z.object({
  employeeId: z.string().min(3, "Employee ID is required"),
  department: z.string().min(2, "Department is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  designation: z.string().min(2, "Designation is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const requestResetInput = z.object({
  email: z.string().email(),
});

const resetPasswordInput = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const toTitleCase = (value: string) =>
  value
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function resolveOrganization(
  prisma: PrismaDB,
  email: string,
  fallbackName: string,
) {
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

const sanitizeUser = (user: AuthUser) => user;

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => ctx.session?.user ?? null),

  login: publicProcedure.input(loginInput).mutation(async ({ input, ctx }) => {
    const email = normalizeEmail(input.email);
    const user = await ctx.prisma.user.findUnique({
      where: { email },
      select: {
        passwordHash: true,
        ...authUserSelect,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }

    const { cookie } = await createSession(user.id, input.remember ?? false);
    ctx.responseHeaders.append("set-cookie", cookie);

    await ctx.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;

    return {
      user: sanitizeUser(safeUser),
    };
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await deleteSessionById(ctx.session.id);
    ctx.responseHeaders.append("set-cookie", buildSessionRemovalCookie());
    return { success: true };
  }),

  register: publicProcedure.input(registerInput).mutation(async ({ input, ctx }) => {
    const email = normalizeEmail(input.email);

    const existingUser = await ctx.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
    }

    const organization = await resolveOrganization(
      ctx.prisma,
      email,
      `${input.firstName} ${input.lastName}`.trim() || "New Workspace",
    );

    const passwordHash = await bcrypt.hash(input.password, 12);

    const userId = await ctx.prisma.$transaction(async (tx) => {
      const department = await tx.department.upsert({
        where: {
          organizationId_name: {
            organizationId: organization.id,
            name: input.department,
          },
        },
        update: {},
        create: {
          organizationId: organization.id,
          name: input.department,
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
          firstName: input.firstName,
          lastName: input.lastName,
          preferredName: input.firstName,
          workEmail: email,
        },
      });

      await tx.employmentDetail.create({
        data: {
          userId: userRecord.id,
          organizationId: organization.id,
          employeeCode: input.employeeId,
          designation: input.designation,
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
  }),

  requestPasswordReset: publicProcedure
    .input(requestResetInput)
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
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
    }),

  resetPassword: publicProcedure
    .input(resetPasswordInput)
    .mutation(async ({ input, ctx }) => {
      const tokenRecord = await verifyPasswordResetToken(input.token);

      if (!tokenRecord) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The reset link is invalid or has expired.",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

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

      ctx.responseHeaders.append("set-cookie", buildSessionRemovalCookie());

      return { success: true };
    }),
});
