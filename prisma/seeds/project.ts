import { PrismaClient } from "@prisma/client";

const projects = [
  {
    id: "1",
    organizationId: "1",
    name: "HR Platform Implementation",
    code: "NDI-HR-001",
    description: "Rollout of a unified HR and attendance platform.",
    clientName: "Ninja Digital Innovations",
    status: "ACTIVE" as const,
    startDate: new Date("2025-01-01"),
    projectManager: "Lead User",
  },
  {
    id: "2",
    organizationId: "2",
    name: "Brand Portal Refresh",
    code: "BC-BRAND-2025",
    description: "Refresh of customer-facing brand portal experiences.",
    clientName: "Brand Cloud",
    status: "ACTIVE" as const,
    startDate: new Date("2025-02-01"),
    projectManager: "Brand Cloud PM",
  },
];

const projectAssignments = [
  {
    userId: "3",
    projectId: "1",
    note: "Leads delivery for the HR Platform Implementation project.",
  },
  {
    userId: "4",
    projectId: "1",
    note: "Builds backend services for the HR Platform Implementation project.",
  },
];

export const seedProjects = async (prisma: PrismaClient) => {
  for (const project of projects) {
    await prisma.project.create({ data: project });
  }

  for (const assignment of projectAssignments) {
    await prisma.employmentDetail.update({
      where: { userId: assignment.userId },
      data: {
        currentProjectId: assignment.projectId,
        currentProjectNote: assignment.note,
      },
    });
  }
};
