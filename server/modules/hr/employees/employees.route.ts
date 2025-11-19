import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { hrEmployeesController } from "./employees.controller";

const employeeIdParam = z.object({
  employeeId: z.string().min(1, "Employee ID is required."),
});

const updateEmployeeInput = z.object({
  employeeId: z.string().min(1, "Employee ID is required."),
  fullName: z.string().min(1, "Full name is required."),
  preferredName: z.string().optional().nullable(),
  email: z.string().email("Provide a valid email."),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  role: z.string().min(1, "Role is required."),
  department: z.string().optional().nullable(),
  employmentType: z.enum(["Full-time", "Part-time", "Contract", "Intern"]),
  workArrangement: z.enum(["On-site", "Hybrid", "Remote"]).optional().nullable(),
  workLocation: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  status: z.enum(["Active", "On Leave", "Probation", "Pending"]),
  emergencyName: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  emergencyRelation: z.string().optional().nullable(),
});

export const hrEmployeesRouter = createTRPCRouter({
  dashboard: protectedProcedure.query(({ ctx }) =>
    hrEmployeesController.dashboard({ ctx }),
  ),
  profile: protectedProcedure
    .input(employeeIdParam)
    .query(({ ctx, input }) =>
      hrEmployeesController.profile({ ctx, employeeId: input.employeeId }),
    ),
  form: protectedProcedure
    .input(employeeIdParam)
    .query(({ ctx, input }) =>
      hrEmployeesController.form({ ctx, employeeId: input.employeeId }),
    ),
  update: protectedProcedure
    .input(updateEmployeeInput)
    .mutation(({ ctx, input }) => hrEmployeesController.update({ ctx, input })),
  approveSignup: protectedProcedure
    .input(employeeIdParam)
    .mutation(({ ctx, input }) =>
      hrEmployeesController.approveSignup({ ctx, employeeId: input.employeeId }),
    ),
  rejectSignup: protectedProcedure
    .input(employeeIdParam)
    .mutation(({ ctx, input }) =>
      hrEmployeesController.rejectSignup({ ctx, employeeId: input.employeeId }),
    ),
  deleteEmployee: protectedProcedure
    .input(employeeIdParam)
    .mutation(({ ctx, input }) =>
      hrEmployeesController.delete({ ctx, employeeId: input.employeeId }),
    ),
});
