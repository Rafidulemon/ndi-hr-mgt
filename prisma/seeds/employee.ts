import { PrismaClient, WorkModel as WorkModelEnum } from "@prisma/client";

import { organizationNameById, usersToCreate } from "./data";

const defaultStartDate = new Date("2023-01-15");
const defaultLocation = "Dhaka HQ";
const defaultWorkHours = "09:00-18:00";

const emergencyEmail = (firstName: string, domain: string) =>
  `${firstName.toLowerCase()}-emergency@${domain}`;

export const seedEmployees = async (prisma: PrismaClient) => {
  for (const user of usersToCreate) {
    const {
      id,
      organizationId,
      firstName,
      lastName,
      preferredName,
      designation,
      employeeCode,
      teamId = null,
      workModel = WorkModelEnum.HYBRID,
      workPhone = null,
      personalPhone = null,
      reportingManagerId = null,
      gender = null,
      email,
    } = user;

    await prisma.employeeProfile.create({
      data: {
        id: `${id}-profile`,
        userId: id,
        firstName,
        lastName,
        preferredName,
        workModel,
        gender,
        workEmail: email,
        workPhone,
        personalPhone,
        currentAddress: "Dhaka, Bangladesh",
        permanentAddress: "Dhaka, Bangladesh",
        bio: `${designation} at ${organizationNameById[organizationId]}.`,
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
        startDate: defaultStartDate,
        teamId,
        reportingManagerId,
        primaryLocation: defaultLocation,
        workHours: defaultWorkHours,
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

    const emergencyDomain = email.split("@")[1] || "noreply.example";

    await prisma.emergencyContact.create({
      data: {
        id: `${id}-emergency`,
        userId: id,
        name: `${firstName} Emergency`,
        relationship: "Family",
        phone: personalPhone || "+8801700000000",
        email: emergencyEmail(firstName, emergencyDomain),
      },
    });
  }

  const teamLeadAssignments = [
    { teamId: "1", leadId: "0099" },
    { teamId: "2", leadId: "0003" },
    { teamId: "3", leadId: "0001" },
    { teamId: "4", leadId: "0009" },
  ];

  for (const assignment of teamLeadAssignments) {
    await prisma.team.update({
      where: { id: assignment.teamId },
      data: { leadId: assignment.leadId },
    });
  }
};
