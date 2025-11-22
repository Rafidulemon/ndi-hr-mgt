import { PrismaClient } from "@prisma/client";

import { NDI_ORG_ID } from "./data";

const notifications = [
  {
    id: "notif-1",
    organizationId: NDI_ORG_ID,
    senderId: "emp-mueem",
    title: "Attendance sync complete",
    body: "Attendance for the 9 AM window has been reconciled.",
    type: "ATTENDANCE" as const,
    status: "SENT" as const,
    actionUrl: "/hr-admin/attendance",
    metadata: { window: "9AM", source: "turnstile" },
    sentAt: new Date("2025-01-10T09:30:00+06:00"),
  },
  {
    id: "notif-2",
    organizationId: NDI_ORG_ID,
    senderId: "emp-mueem",
    title: "New leave request pending",
    body: "Rafidul submitted a casual leave request for Jan 15.",
    type: "LEAVE" as const,
    status: "SCHEDULED" as const,
    actionUrl: "/hr-admin/leave",
    metadata: { employeeId: "emp-saiful" },
    scheduledAt: new Date("2025-01-10T10:00:00+06:00"),
  },
  {
    id: "notif-3",
    organizationId: NDI_ORG_ID,
    senderId: "org-admin-kohei",
    title: "Pulse survey reminder",
    body: "Complete the Q1 engagement pulse before Friday.",
    type: "GENERAL" as const,
    status: "DRAFT" as const,
    actionUrl: "/engagement/pulse",
  },
];

export const seedNotifications = async (prisma: PrismaClient) => {
  await prisma.notification.createMany({ data: notifications });
};
