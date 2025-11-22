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
import { hrTeamRouter } from "@/server/modules/hr/team/team.route";
import { hrWorkRouter } from "@/server/modules/hr/work/work.route";
import { dashboardRouter } from "@/server/modules/dashboard/dashboard.route";
import { teamRouter } from "@/server/modules/team/team.route";
import { reportRouter } from "@/server/modules/report/report.route";
import { hrReportRouter } from "@/server/modules/hr/reports/reports.route";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  auth: AuthRouter,
  user: userRouter,
  attendance: attendanceRouter,
  leave: leaveRouter,
  dashboard: dashboardRouter,
  team: teamRouter,
  report: reportRouter,
  hrEmployees: hrEmployeesRouter,
  hrAttendance: hrAttendanceRouter,
  hrLeave: hrLeaveRouter,
  hrDashboard: hrDashboardRouter,
  hrTeam: hrTeamRouter,
  hrWork: hrWorkRouter,
  hrReport: hrReportRouter,
});

export type AppRouter = typeof appRouter;
