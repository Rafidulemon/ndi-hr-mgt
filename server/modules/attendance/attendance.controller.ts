import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import { attendanceService } from "./attendance.service";
import type {
  AttendanceHistoryInput,
  CompleteDayInput,
} from "./attendance.validation";

const buildInput = (ctx: TRPCContext) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return {
    userId: ctx.session.user.id,
  };
};

export const attendanceController = {
  today: (ctx: TRPCContext) => attendanceService.today(buildInput(ctx)),
  startDay: (ctx: TRPCContext) => attendanceService.startDay(buildInput(ctx)),
  completeDay: (ctx: TRPCContext, input: CompleteDayInput) =>
    attendanceService.completeDay({
      ...buildInput(ctx),
      input,
    }),
  history: (ctx: TRPCContext, params?: AttendanceHistoryInput) =>
    attendanceService.history({
      ...buildInput(ctx),
      params,
    }),
};
