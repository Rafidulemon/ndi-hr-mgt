import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import { DashboardService } from "./dashboard.service";

const handleRequest = async <T>(resolver: () => Promise<T>, errorMessage: string) => {
  try {
    return await resolver();
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: errorMessage,
    });
  }
};

const getOverview = (ctx: TRPCContext) =>
  handleRequest(() => DashboardService.getOverview(ctx), "Failed to load dashboard overview.");

const getProfile = (ctx: TRPCContext) =>
  handleRequest(() => DashboardService.getProfileSection(ctx), "Failed to load profile section.");

const getSummary = (ctx: TRPCContext) =>
  handleRequest(() => DashboardService.getSummarySection(ctx), "Failed to load summary section.");

const getAttendance = (ctx: TRPCContext) =>
  handleRequest(
    () => DashboardService.getAttendanceSection(ctx),
    "Failed to load attendance section.",
  );

const getTimeOff = (ctx: TRPCContext) =>
  handleRequest(() => DashboardService.getTimeOffSection(ctx), "Failed to load time off section.");

const getNotifications = (ctx: TRPCContext) =>
  handleRequest(
    () => DashboardService.getNotificationsSection(ctx),
    "Failed to load notifications.",
  );

export const DashboardController = {
  getOverview,
  getProfile,
  getSummary,
  getAttendance,
  getTimeOff,
  getNotifications,
};
