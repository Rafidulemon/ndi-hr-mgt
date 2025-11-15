import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userController } from "./user.controller";
import { updateProfileSchema } from "./user.validation";

export const userRouter = createTRPCRouter({
  profile: protectedProcedure.query(({ ctx }) => userController.profile({ ctx })),
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(({ ctx, input }) => userController.updateProfile({ ctx, input })),
});
