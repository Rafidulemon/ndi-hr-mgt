import type { TRPCContext } from "@/server/api/trpc";
import { attendanceService } from "./attendance.service";
import type {
  AttendanceHistoryInput,
  CompleteDayInput,
} from "./attendance.validation";

export const attendanceController = {
  today: ({ ctx }: { ctx: TRPCContext }) => attendanceService.today(ctx),
  startDay: ({ ctx }: { ctx: TRPCContext }) => attendanceService.startDay(ctx),
  completeDay: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: CompleteDayInput;
  }) => attendanceService.completeDay(ctx, input),
  history: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input?: AttendanceHistoryInput;
  }) => attendanceService.history(ctx, input),
};
