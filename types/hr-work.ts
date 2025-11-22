import type { UserRole } from "@prisma/client";

export const WEEKDAY_OPTIONS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type WeekdayOption = (typeof WEEKDAY_OPTIONS)[number];

export type HrWorkPolicy = {
  onsiteStartTime: string;
  onsiteEndTime: string;
  remoteStartTime: string;
  remoteEndTime: string;
  workingDays: WeekdayOption[];
  weekendDays: WeekdayOption[];
};

export type HrHolidaySummary = {
  id: string;
  title: string;
  description: string | null;
  dateIso: string;
  dateLabel: string;
};

export type HrWorkOverviewResponse = {
  viewerRole: UserRole;
  canManage: boolean;
  policy: HrWorkPolicy;
  holidays: HrHolidaySummary[];
};
