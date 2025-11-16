import type { TRPCContext } from "@/server/api/trpc";
import { hrEmployeesService } from "./employees.service";

export const hrEmployeesController = {
  dashboard: ({ ctx }: { ctx: TRPCContext }) => hrEmployeesService.getDashboard(ctx),
};
