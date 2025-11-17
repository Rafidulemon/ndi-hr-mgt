import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { employeeDashboardController } from "./dashboard.controller";

export const dashboardRouter = createTRPCRouter({
  overview: protectedProcedure.query(({ ctx }) =>
    employeeDashboardController.overview({ ctx }),
  ),
});
