import type { Gender, UserRole, WorkModel } from "@prisma/client";

export type SeedOrganization = {
  id: string;
  name: string;
  domain: string;
  timezone: string;
  locale: string;
};

export type SeedTeam = {
  id: string;
  name: string;
  description: string;
};

export type SeedUserConfig = {
  id: string;
  organizationId: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  preferredName: string;
  designation: string;
  employeeCode: string;
  teamId?: string | null;
  workModel?: WorkModel;
  workPhone?: string | null;
  personalPhone?: string | null;
  reportingManagerId?: string | null;
  gender?: Gender;
};

export const organizations: SeedOrganization[] = [
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

export const organizationNameById = organizations.reduce<Record<string, string>>((acc, org) => {
  acc[org.id] = org.name;
  return acc;
}, {});

export const orgTeams: Record<string, SeedTeam[]> = {
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

export const usersToCreate: SeedUserConfig[] = [
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
  {
    id: "5",
    organizationId: "1",
    email: "rafidul@ninja-digital-innovations.com",
    password: "Rafidul@123",
    role: "EMPLOYEE",
    firstName: "Md. Rafidul",
    lastName: "Islam",
    preferredName: "Rafidul",
    designation: "Software Engineer",
    employeeCode: "NDI-1005",
    teamId: "2",
    workModel: "ONSITE",
    workPhone: "+8801300001105",
    personalPhone: "+8801700001105",
    reportingManagerId: "3",
    gender: "MALE",
  },
];
