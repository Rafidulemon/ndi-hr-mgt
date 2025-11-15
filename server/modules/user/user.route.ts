import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userController } from "./user.controller";

export const userRouter = createTRPCRouter({
  profile: protectedProcedure.query(({ ctx }) => userController.profile({ ctx })),
});
