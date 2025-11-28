import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import { canManageTeams } from "@/types/hr-team";
import { canManageWork } from "@/types/hr-work";

const HR_ALLOWED_ROLES: UserRole[] = [
  "HR_ADMIN",
  "MANAGER",
  "ORG_OWNER",
  "ORG_ADMIN",
  "SUPER_ADMIN",
];

export const requireHrAdmin = (ctx: TRPCContext) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = ctx.session.user;
  if (!HR_ALLOWED_ROLES.includes(user.role as UserRole)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "HR access required." });
  }

  if (!user.organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Join an organization to manage employees.",
    });
  }

  return user;
};

export const requireTeamManager = (ctx: TRPCContext) => {
  const user = requireHrAdmin(ctx);
  if (!canManageTeams(user.role as UserRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Manager, org admin, org owner, or super admin access required.",
    });
  }
  return user;
};

export const requireWorkManager = (ctx: TRPCContext) => {
  const user = requireHrAdmin(ctx);
  if (!canManageWork(user.role as UserRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only org owners, org admins, or super admins can manage work policies.",
    });
  }
  return user;
};
