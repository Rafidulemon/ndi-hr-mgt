/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const hashPassword = (password) => {
  if (!password) {
    throw new Error("Password is required for hashing");
  }
  return bcrypt.hash(password, 10);
};

const organizations = [
  {
    id: "1",
    name: "Ninja Digital Innovations",
    domain: "ninja-digital-innovations.com",
    timezone: "Asia/Dhaka",
    locale: "en-US",
  },
  {
    id: "2",
    name: "Brand Cloud",
    domain: "brandcloud.com",
    timezone: "Asia/Tokyo",
    locale: "en-US",
  },
];

const organizationNameById = organizations.reduce((acc, org) => {
  acc[org.id] = org.name;
  return acc;
}, {});

const orgTeams = {
  "1": [
    {
      id: "1",
      name: "Management",
      description: "Executive leadership and strategic oversight.",
    },
    {
      id: "2",
      name: "Frontend",
      description: "Client-facing applications and UI delivery.",
    },
    {
      id: "3",
      name: "Backend",
      description: "API, integrations, and data services.",
    },
    {
      id: "4",
      name: "Design",
      description: "Product design and research.",
    },
    {
      id: "5",
      name: "SNS",
      description: "Communications and social media initiatives.",
    },
  ],
  "2": [
    {
      id: "6",
      name: "Management",
      description: "Brand Cloud leadership and strategy.",
    },
    {
      id: "7",
      name: "Frontend",
      description: "Marketing site delivery and client portals.",
    },
    {
      id: "8",
      name: "Backend",
      description: "Platform integrations and core services.",
    },
    {
      id: "9",
      name: "Design",
      description: "Creative direction and visual systems.",
    },
    {
      id: "10",
      name: "SNS",
      description: "Social engagement and campaigns.",
    },
  ],
};

const usersToCreate = [
  {
    id: "1",
    organizationId: "1",
    email: "superuser@ninja-digital-innovations.com",
    password: "Superuser@123",
    role: "SUPER_ADMIN",
    firstName: "Superuser",
    lastName: "Admin",
    preferredName: "Superuser",
    designation: "Chief Administrator",
    employeeCode: "NDI-1001",
    teamId: "1",
    workModel: "HYBRID",
    workPhone: "+8801300001101",
    personalPhone: "+8801700001101",
    reportingManagerId: null,
  },
  {
    id: "2",
    organizationId: "1",
    email: "hr@ninja-digital-innovations.com",
    password: "HrPartner@123",
    role: "HR_ADMIN",
    firstName: "HR",
    lastName: "Partner",
    preferredName: "HR",
    designation: "HR Specialist",
    employeeCode: "NDI-1002",
    teamId: "1",
    workModel: "ONSITE",
    workPhone: "+8801300001102",
    personalPhone: "+8801700001102",
    reportingManagerId: "1",
  },
  {
    id: "3",
    organizationId: "1",
    email: "lead_user@ninja-digital-innovations.com",
    password: "LeadUser@123",
    role: "MANAGER",
    firstName: "Lead",
    lastName: "User",
    preferredName: "Lead User",
    designation: "Frontend Team Lead",
    employeeCode: "NDI-1003",
    teamId: "2",
    workModel: "HYBRID",
    workPhone: "+8801300001103",
    personalPhone: "+8801700001103",
    reportingManagerId: "1",
  },
  {
    id: "4",
    organizationId: "1",
    email: "test_user@ninja-digital-innovations.com",
    password: "TestUser@123",
    role: "EMPLOYEE",
    firstName: "Test",
    lastName: "User",
    preferredName: "Test User",
    designation: "Backend Engineer",
    employeeCode: "NDI-1004",
    teamId: "3",
    workModel: "REMOTE",
    workPhone: "+8801300001104",
    personalPhone: "+8801700001104",
    reportingManagerId: "3",
  },
];

async function createUser(userConfig) {
  const {
    id,
    organizationId,
    email,
    password,
    role,
    firstName,
    lastName,
    preferredName,
    designation,
    employeeCode,
    teamId = null,
    workModel = "HYBRID",
    workPhone = null,
    personalPhone = null,
    reportingManagerId = null,
  } = userConfig;

  const passwordHash = await hashPassword(password);
  const organizationName = organizationNameById[organizationId] || "the organization";

  const user = await prisma.user.create({
    data: {
      id,
      organizationId,
      email,
      passwordHash,
      role,
      status: "ACTIVE",
      phone: workPhone || personalPhone,
    },
  });

  await prisma.employeeProfile.create({
    data: {
      id: `${id}-profile`,
      userId: id,
      firstName,
      lastName,
      preferredName,
      workModel,
      workEmail: email,
      workPhone,
      personalPhone,
      currentAddress: "Dhaka, Bangladesh",
      permanentAddress: "Dhaka, Bangladesh",
      bio: `${designation} at ${organizationName}.`,
    },
  });

  await prisma.employmentDetail.create({
    data: {
      id: `${id}-employment`,
      userId: id,
      organizationId,
      employeeCode,
      designation,
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      startDate: new Date("2023-01-15"),
      teamId,
      reportingManagerId,
      primaryLocation: "Dhaka HQ",
      workHours: "09:00-18:00",
    },
  });

  const accountSuffix = id.toString().padStart(4, "0");

  await prisma.employeeBankAccount.create({
    data: {
      id: `${id}-bank`,
      userId: id,
      accountHolder: `${firstName} ${lastName}`,
      bankName: "Eastern Bank Ltd.",
      accountNumber: `ACC-${accountSuffix}`,
      branch: "Gulshan",
      swiftCode: "EBLDBDDH",
      isPrimary: true,
    },
  });

  const emergencyEmailDomain = email.split("@")[1] || "noreply.example";

  await prisma.emergencyContact.create({
    data: {
      id: `${id}-emergency`,
      userId: id,
      name: `${firstName} Emergency`,
      relationship: "Family",
      phone: personalPhone || "+8801700000000",
      email: `${firstName.toLowerCase()}-emergency@${emergencyEmailDomain}`,
    },
  });

  return user;
}

async function main() {
  const existing = await prisma.organization.findFirst({
    where: {
      id: {
        in: organizations.map((org) => org.id),
      },
    },
  });

  if (existing) {
    console.log("Seed skipped: base organizations already exist.");
    return;
  }

  for (const orgData of organizations) {
    await prisma.organization.create({ data: orgData });
  }

  for (const org of organizations) {
    const teams = orgTeams[org.id] || [];
    for (const team of teams) {
      await prisma.team.create({
        data: {
          id: team.id,
          organizationId: org.id,
          name: team.name,
          description: team.description,
        },
      });
    }
  }

  for (const userData of usersToCreate) {
    await createUser(userData);
  }

  await prisma.team.update({
    where: { id: "1" },
    data: { leadId: "1" },
  });
  await prisma.team.update({
    where: { id: "2" },
    data: { leadId: "3" },
  });

  const ndiProject = await prisma.project.create({
    data: {
      id: "1",
      organizationId: "1",
      name: "HR Platform Implementation",
      code: "NDI-HR-001",
      description: "Rollout of a unified HR and attendance platform.",
      clientName: "Ninja Digital Innovations",
      status: "ACTIVE",
      startDate: new Date("2025-01-01"),
      projectManager: "Lead User",
    },
  });

  await prisma.employmentDetail.update({
    where: { userId: "3" },
    data: {
      currentProjectId: ndiProject.id,
      currentProjectNote: "Leads delivery for the HR Platform Implementation project.",
    },
  });

  await prisma.employmentDetail.update({
    where: { userId: "4" },
    data: {
      currentProjectId: ndiProject.id,
      currentProjectNote: "Builds backend services for the HR Platform Implementation project.",
    },
  });

  await prisma.project.create({
    data: {
      id: "2",
      organizationId: "2",
      name: "Brand Portal Refresh",
      code: "BC-BRAND-2025",
      description: "Refresh of customer-facing brand portal experiences.",
      clientName: "Brand Cloud",
      status: "ACTIVE",
      startDate: new Date("2025-02-01"),
      projectManager: "Brand Cloud PM",
    },
  });

  console.log("Seeded organizations, users, teams, and projects with hashed credentials.");
}

main()
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
