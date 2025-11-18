import { UserInfoParam } from "@/app/(auth)/auth/registration/[email]/[token]/page";
import { nextAuthOptions } from "@/app/utils/next-auth-options";
import { prisma } from "@/prisma";
import { type UserPasswordUpdateType } from "@/types/types";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

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
  sendResetPasswordLinkService,
  updateUserPassworIntoDb,
  tokenValidate,
  isAuthorisationChange,
  isTrialExpired,
};
