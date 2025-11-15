import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { authController } from "./auth.controller";
import {
  loginSchema,
  registerSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "./auth.validation";

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => ctx.session?.user ?? null),
  login: publicProcedure.input(loginSchema).mutation(({ ctx, input }) =>
    authController.login({ ctx, input }),
  ),
  logout: protectedProcedure.mutation(({ ctx }) => authController.logout({ ctx })),
  register: publicProcedure.input(registerSchema).mutation(({ ctx, input }) =>
    authController.register({ ctx, input }),
  ),
  requestPasswordReset: publicProcedure
    .input(requestResetSchema)
    .mutation(({ ctx, input }) => authController.requestPasswordReset({ ctx, input })),
  resetPassword: publicProcedure.input(resetPasswordSchema).mutation(({ ctx, input }) =>
    authController.resetPassword({ ctx, input }),
  ),
});
