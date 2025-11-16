import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";

const HR_ONLY_ROLE = "HR_ADMIN";

export const requireHrAdmin = (ctx: TRPCContext) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = ctx.session.user;

  if (user.role !== HR_ONLY_ROLE) {
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
