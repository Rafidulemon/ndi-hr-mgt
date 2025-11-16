import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { hrEmployeesController } from "./employees.controller";

export const hrEmployeesRouter = createTRPCRouter({
  dashboard: protectedProcedure.query(({ ctx }) =>
    hrEmployeesController.dashboard({ ctx }),
  ),
});
