import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { attendanceController } from "./attendance.controller";
import {
  attendanceHistorySchema,
  completeDaySchema,
} from "./attendance.validation";

export const attendanceRouter = createTRPCRouter({
  today: protectedProcedure.query(({ ctx }) =>
    attendanceController.today({ ctx }),
  ),
  startDay: protectedProcedure.mutation(({ ctx }) =>
    attendanceController.startDay({ ctx }),
  ),
  completeDay: protectedProcedure
    .input(completeDaySchema)
    .mutation(({ ctx, input }) => attendanceController.completeDay({ ctx, input })),
  history: protectedProcedure
    .input(attendanceHistorySchema)
    .query(({ ctx, input }) => attendanceController.history({ ctx, input })),
});
