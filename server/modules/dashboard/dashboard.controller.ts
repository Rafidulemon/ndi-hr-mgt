import type { TRPCContext } from "@/server/api/trpc";
import { employeeDashboardService } from "./dashboard.service";

export const employeeDashboardController = {
  overview: ({ ctx }: { ctx: TRPCContext }) =>
    employeeDashboardService.overview(ctx),
};
