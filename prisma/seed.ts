import { PrismaClient } from "@prisma/client";

import { orgTeams, organizations } from "./seeds/data";
import { seedAttendance } from "./seeds/attendance";
import { seedEmployees } from "./seeds/employee";
import { seedLeaveRequests } from "./seeds/leaveRequest";
import { seedNotifications } from "./seeds/notification";
import { seedProjects } from "./seeds/project";
import { seedUsers } from "./seeds/user";

const prisma = new PrismaClient();

const seedOrganizations = async () => {
  for (const organization of organizations) {
    await prisma.organization.create({ data: organization });
  }
};

const seedTeams = async () => {
  for (const organization of organizations) {
    const teams = orgTeams[organization.id] || [];

    for (const team of teams) {
      await prisma.team.create({
        data: {
          id: team.id,
          organizationId: organization.id,
          name: team.name,
          description: team.description,
        },
      });
    }
  }
};

async function main() {
  const existing = await prisma.organization.findFirst({
    where: { id: { in: organizations.map((org) => org.id) } },
  });

  if (existing) {
    console.log("Seed skipped: base organizations already exist.");
    return;
  }

  await seedOrganizations();
  await seedTeams();
  await seedUsers(prisma);
  await seedEmployees(prisma);
  await seedProjects(prisma);
  await seedAttendance(prisma);
  await seedLeaveRequests(prisma);
  await seedNotifications(prisma);

  console.log("Seeded organizations, people, attendance, projects, leave, and notifications.");
}

main()
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
