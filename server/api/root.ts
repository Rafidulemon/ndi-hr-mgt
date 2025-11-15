import { createTRPCRouter } from "@/server/api/trpc";
import { healthRouter } from "@/server/api/routers/health";
import { authRouter } from "@/server/modules/auth/auth.route";
import { userRouter } from "@/server/modules/user/user.route";
import { attendanceRouter } from "@/server/modules/attendance/attendance.route";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  auth: authRouter,
  user: userRouter,
  attendance: attendanceRouter,
});

export type AppRouter = typeof appRouter;
