import type { TRPCContext } from "@/server/api/trpc";
import { userService } from "./user.service";

export const userController = {
  profile: ({ ctx }: { ctx: TRPCContext }) => userService.getProfile(ctx),
};
