import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";

const allowedHrRoles: UserRole[] = ["HR_ADMIN", "ORG_ADMIN", "SUPER_ADMIN"];

export const requireHrAdmin = (ctx: TRPCContext) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (!allowedHrRoles.includes(ctx.session.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permission." });
  }

  return ctx.session.user;
};
