import type { TRPCContext } from "@/server/api/trpc";
import { authService } from "./auth.service";
import {
  loginSchema,
  registerSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "./auth.validation";

export const authController = {
  login: async ({ ctx, input }: { ctx: TRPCContext; input: unknown }) => {
    const parsed = loginSchema.parse(input);
    const { user, cookie } = await authService.login(ctx, parsed);
    ctx.responseHeaders.append("set-cookie", cookie);
    return { user };
  },

  logout: async ({ ctx }: { ctx: TRPCContext }) => {
    const { cookie } = await authService.logout(ctx);
    ctx.responseHeaders.append("set-cookie", cookie);
    return { success: true };
  },

  register: async ({ ctx, input }: { ctx: TRPCContext; input: unknown }) => {
    const parsed = registerSchema.parse(input);
    return authService.register(ctx, parsed);
  },

  requestPasswordReset: async ({ ctx, input }: { ctx: TRPCContext; input: unknown }) => {
    const parsed = requestResetSchema.parse(input);
    return authService.requestPasswordReset(ctx, parsed);
  },

  resetPassword: async ({ ctx, input }: { ctx: TRPCContext; input: unknown }) => {
    const parsed = resetPasswordSchema.parse(input);
    const { success, cookie } = await authService.resetPassword(ctx, parsed);
    ctx.responseHeaders.append("set-cookie", cookie);
    return { success };
  },
};
