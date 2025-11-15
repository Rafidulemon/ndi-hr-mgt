import { z } from "zod";

export const attendanceHistorySchema = z
  .object({
    month: z.number().int().min(0).max(11).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
  })
  .default({});

export type AttendanceHistoryInput = z.infer<typeof attendanceHistorySchema>;

export const completeDaySchema = z.object({
  workSeconds: z.number().int().min(0),
  breakSeconds: z.number().int().min(0),
});

export type CompleteDayInput = z.infer<typeof completeDaySchema>;
