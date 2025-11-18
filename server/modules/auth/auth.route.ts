import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { authController } from "./auth.controller";
import {
  loginSchema,
  registerSchema,
  sendResetPasswordLinkSchema,
  tokenValidationSchema,
  trialStatusSchema,
  updateUserPasswordSchema,
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
  sendResetPasswordLink: publicProcedure
    .input(sendResetPasswordLinkSchema)
    .mutation(({ input }) => authController.sendResetPasswordLink({ input })),
  updateUserPassword: publicProcedure
    .input(updateUserPasswordSchema)
    .mutation(({ input }) => authController.updateUserPassword({ input })),
  tokenValidate: publicProcedure.input(tokenValidationSchema).query(({ input }) =>
    authController.tokenValidate({ input }),
  ),
  isAuthorisationChange: protectedProcedure.query(() => authController.isAuthorisationChange()),
  isTrialExpired: publicProcedure.input(trialStatusSchema).query(({ input }) =>
    authController.isTrialExpired({ input }),
  ),
});
