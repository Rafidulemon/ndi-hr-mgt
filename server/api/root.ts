import { createTRPCRouter } from "@/server/api/trpc";
import { healthRouter } from "@/server/api/routers/health";
import { AuthRouter } from "@/server/modules/auth/auth.route";
import { userRouter } from "@/server/modules/user/user.route";
import { attendanceRouter } from "@/server/modules/attendance/attendance.route";
import { leaveRouter } from "@/server/modules/leave/leave.route";
import { hrEmployeesRouter } from "@/server/modules/hr/employees/employees.route";
import { hrAttendanceRouter } from "@/server/modules/hr/attendance/attendance.route";
import { hrLeaveRouter } from "@/server/modules/hr/leave/leave.route";
import { hrDashboardRouter } from "@/server/modules/hr/dashboard/dashboard.route";
import { dashboardRouter } from "@/server/modules/dashboard/dashboard.route";
import { teamRouter } from "@/server/modules/team/team.route";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  auth: AuthRouter,
  user: userRouter,
  attendance: attendanceRouter,
  leave: leaveRouter,
  dashboard: dashboardRouter,
  team: teamRouter,
  hrEmployees: hrEmployeesRouter,
  hrAttendance: hrAttendanceRouter,
  hrLeave: hrLeaveRouter,
  hrDashboard: hrDashboardRouter,
});

export type AppRouter = typeof appRouter;
