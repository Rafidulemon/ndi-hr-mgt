import type { TRPCContext } from "@/server/api/trpc";
import type { HrEmployeeUpdateInput } from "@/types/hr-admin";
import { hrEmployeesService } from "./employees.service";

export const hrEmployeesController = {
  dashboard: ({ ctx }: { ctx: TRPCContext }) => hrEmployeesService.getDashboard(ctx),
  profile: ({ ctx, employeeId }: { ctx: TRPCContext; employeeId: string }) =>
    hrEmployeesService.getEmployeeProfile(ctx, employeeId),
  form: ({ ctx, employeeId }: { ctx: TRPCContext; employeeId: string }) =>
    hrEmployeesService.getEmployeeForm(ctx, employeeId),
  update: ({ ctx, input }: { ctx: TRPCContext; input: HrEmployeeUpdateInput }) =>
    hrEmployeesService.updateEmployee(ctx, input),
  approveSignup: ({ ctx, employeeId }: { ctx: TRPCContext; employeeId: string }) =>
    hrEmployeesService.approvePendingEmployee(ctx, employeeId),
  rejectSignup: ({ ctx, employeeId }: { ctx: TRPCContext; employeeId: string }) =>
    hrEmployeesService.rejectPendingEmployee(ctx, employeeId),
  delete: ({ ctx, employeeId }: { ctx: TRPCContext; employeeId: string }) =>
    hrEmployeesService.deleteEmployee(ctx, employeeId),
};
