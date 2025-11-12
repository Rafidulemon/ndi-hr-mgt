/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PASSWORD_HASH =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8Z6Y5Cdi1g9otLWYwgd0CQpZK0s8Vu"; // bcrypt hash for "password"

async function main() {
  const existingOrg = await prisma.organization.findUnique({
    where: { domain: "ndi.hr" },
  });

  if (existingOrg) {
    console.log("Seed skipped: organization already exists.");
    return;
  }

  const organization = await prisma.organization.create({
    data: {
      name: "NDI HR Management",
      legalName: "NDI HR Management Ltd.",
      domain: "ndi.hr",
      timezone: "Asia/Dhaka",
      locale: "en-US",
    },
  });

  const engineeringDept = await prisma.department.create({
    data: {
      organizationId: organization.id,
      name: "Engineering",
      code: "ENG",
      description: "Product engineering and platform squads.",
    },
  });

  const peopleDept = await prisma.department.create({
    data: {
      organizationId: organization.id,
      name: "People Operations",
      code: "POPS",
      description: "HR operations and employee success.",
    },
  });

  const frontendTeam = await prisma.team.create({
    data: {
      organizationId: organization.id,
      departmentId: engineeringDept.id,
      name: "Frontend Platform",
      description: "Owns employee facing web properties.",
    },
  });

  const peopleOpsTeam = await prisma.team.create({
    data: {
      organizationId: organization.id,
      departmentId: peopleDept.id,
      name: "People Partners",
      description: "Supports employees through policies and onboarding.",
    },
  });

  const [reactSkill, nextSkill, peopleSkill] = await Promise.all([
    prisma.skill.create({
      data: {
        organizationId: organization.id,
        name: "React",
        category: "Frontend",
      },
    }),
    prisma.skill.create({
      data: {
        organizationId: organization.id,
        name: "Next.js",
        category: "Frontend",
      },
    }),
    prisma.skill.create({
      data: {
        organizationId: organization.id,
        name: "People Operations",
        category: "HR",
      },
    }),
  ]);

  const [casualLeave, sickLeave, annualLeave] = await Promise.all([
    prisma.leaveType.create({
      data: {
        organizationId: organization.id,
        name: "Casual Leave",
        code: "CASL",
        description: "Short-term personal errands or emergencies.",
        maxPerRequest: "3",
        maxPerYear: "15",
      },
    }),
    prisma.leaveType.create({
      data: {
        organizationId: organization.id,
        name: "Sick Leave",
        code: "SICK",
        description: "Health related absences.",
        maxPerRequest: "5",
        maxPerYear: "12",
      },
    }),
    prisma.leaveType.create({
      data: {
        organizationId: organization.id,
        name: "Annual Leave",
        code: "ANNU",
        description: "Planned vacations and long breaks.",
        maxPerRequest: "10",
        maxPerYear: "18",
      },
    }),
  ]);

  const hrCoreProject = await prisma.project.create({
    data: {
      organizationId: organization.id,
      name: "HR Core Platform",
      code: "HRCORE",
      description: "Employee self-service portal for attendance, leave and payroll.",
      clientName: "NDI Internal",
      status: "ACTIVE",
      startDate: new Date("2023-03-01"),
    },
  });

  // Manager / Lead
  const shahriar = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: "shahriar.duke@ndi.hr",
      passwordHash: PASSWORD_HASH,
      phone: "+8801811000000",
      role: "MANAGER",
      status: "ACTIVE",
      lastLoginAt: new Date(),
    },
  });

  await prisma.employeeProfile.create({
    data: {
      userId: shahriar.id,
      firstName: "Shahriar",
      lastName: "Duke",
      preferredName: "Duke",
      gender: "MALE",
      dateOfBirth: new Date("1990-05-12"),
      nationality: "Bangladeshi",
      bio: "Engineering lead ensuring product quality and mentoring engineers.",
      profilePhotoUrl: "/dp.png",
      workModel: "HYBRID",
      currentAddress: "Gulshan, Dhaka",
      permanentAddress: "Chittagong, Bangladesh",
      personalEmail: "duke.personal@example.com",
      workEmail: "shahriar.duke@ndi.hr",
      workPhone: "+8801811000000",
    },
  });

  await prisma.employmentDetail.create({
    data: {
      userId: shahriar.id,
      organizationId: organization.id,
      employeeCode: "EMP-001",
      designation: "Engineering Manager",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      startDate: new Date("2021-02-01"),
      departmentId: engineeringDept.id,
      teamId: frontendTeam.id,
      currentProjectId: hrCoreProject.id,
      primaryLocation: "Dhaka HQ",
      workHours: "10:00-18:00",
      currentProjectNote: "Leading the migration to the new HR suite.",
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: frontendTeam.id,
      userId: shahriar.id,
      role: "Team Lead",
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: hrCoreProject.id,
      userId: shahriar.id,
      role: "Project Lead",
      allocatedPercent: 40,
    },
  });

  await prisma.userPreference.create({
    data: {
      userId: shahriar.id,
      theme: "SYSTEM",
      emailNotifications: true,
      pushNotifications: true,
      dailyDigest: true,
      timezone: "Asia/Dhaka",
    },
  });

  await prisma.employeeBankAccount.create({
    data: {
      userId: shahriar.id,
      accountHolder: "Shahriar Duke",
      bankName: "Eastern Bank Ltd.",
      accountNumber: "123456789012",
      branch: "Gulshan",
      swiftCode: "EBLDBDDH",
      isPrimary: true,
    },
  });

  await prisma.emergencyContact.create({
    data: {
      userId: shahriar.id,
      name: "Imran Khan",
      relationship: "Brother",
      phone: "+8801712000000",
      email: "imran.khan@example.com",
    },
  });

  await prisma.employeeSkill.createMany({
    data: [
      {
        userId: shahriar.id,
        skillId: reactSkill.id,
        level: "ADVANCED",
        years: 8,
      },
      {
        userId: shahriar.id,
        skillId: nextSkill.id,
        level: "ADVANCED",
        years: 5,
      },
    ],
  });

  await prisma.careerEvent.create({
    data: {
      userId: shahriar.id,
      title: "Promoted to Engineering Manager",
      detail: "Led the successful launch of the HR attendance module.",
      happenedAt: new Date("2023-10-01"),
    },
  });

  await prisma.attendanceRecord.create({
    data: {
      employeeId: shahriar.id,
      attendanceDate: new Date("2024-11-26"),
      checkInAt: new Date("2024-11-26T09:05:00+06:00"),
      checkOutAt: new Date("2024-11-26T18:10:00+06:00"),
      totalWorkSeconds: 8 * 3600,
      totalBreakSeconds: 1800,
      status: "PRESENT",
      note: "Sprint planning and 1:1s.",
      location: "Dhaka HQ",
      source: "WEB",
      breaks: {
        create: [
          {
            startedAt: new Date("2024-11-26T13:00:00+06:00"),
            endedAt: new Date("2024-11-26T13:30:00+06:00"),
            type: "MEAL",
            note: "Lunch",
          },
        ],
      },
    },
  });

  await prisma.workReport.create({
    data: {
      employeeId: shahriar.id,
      reportDate: new Date("2024-11-26"),
      status: "SUBMITTED",
      submittedAt: new Date("2024-11-26T18:05:00+06:00"),
      note: "Coaching session with junior engineers and roadmap alignment.",
      items: {
        create: [
          {
            workType: "PROJECT",
            taskName: "Roadmap Planning",
            projectId: hrCoreProject.id,
            details: "Outlined Q1 deliverables with PM.",
            hours: "3.50",
          },
          {
            workType: "SUPPORT",
            taskName: "Team 1:1s",
            details: "Met with two engineers to discuss growth.",
            hours: "2.00",
          },
          {
            workType: "DEVELOPMENT",
            taskName: "Code Review",
            projectId: hrCoreProject.id,
            details: "Reviewed attendance automation PRs.",
            hours: "2.50",
          },
        ],
      },
    },
  });

  await prisma.leaveBalance.createMany({
    data: [
      {
        employeeId: shahriar.id,
        leaveTypeId: casualLeave.id,
        year: 2024,
        allocated: "15",
        used: "4",
        carriedOver: "2",
      },
      {
        employeeId: shahriar.id,
        leaveTypeId: sickLeave.id,
        year: 2024,
        allocated: "12",
        used: "2",
        carriedOver: "0",
      },
    ],
  });

  // Employee 1
  const rafid = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: "md.rafidul@ndi.hr",
      passwordHash: PASSWORD_HASH,
      phone: "+8801711000000",
      role: "EMPLOYEE",
      status: "ACTIVE",
    },
  });

  await prisma.employeeProfile.create({
    data: {
      userId: rafid.id,
      firstName: "Md.",
      lastName: "Rafidul Islam",
      preferredName: "Rafid",
      gender: "MALE",
      dateOfBirth: new Date("1996-11-12"),
      nationality: "Bangladeshi",
      bio: "Product-led frontend engineer focused on reliable HR experiences.",
      profilePhotoUrl: "/dp.png",
      workModel: "HYBRID",
      currentAddress: "Mohakhali, Dhaka",
      permanentAddress: "Comilla, Chittagong",
      personalEmail: "rafid.personal@example.com",
      workEmail: "md.rafidul@ndi.hr",
      workPhone: "+8801711000000",
      personalPhone: "+8801911000000",
    },
  });

  await prisma.employmentDetail.create({
    data: {
      userId: rafid.id,
      organizationId: organization.id,
      employeeCode: "EMP-002",
      designation: "Software Engineer",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      startDate: new Date("2023-08-17"),
      departmentId: engineeringDept.id,
      teamId: frontendTeam.id,
      reportingManagerId: shahriar.id,
      currentProjectId: hrCoreProject.id,
      primaryLocation: "Dhaka HQ",
      workHours: "10:00-18:00",
      currentProjectNote: "Frontend revamp for attendance and payroll dashboard.",
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: frontendTeam.id,
      userId: rafid.id,
      role: "Frontend Engineer",
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: hrCoreProject.id,
      userId: rafid.id,
      role: "Frontend Engineer",
      allocatedPercent: 100,
    },
  });

  await prisma.userPreference.create({
    data: {
      userId: rafid.id,
      theme: "SYSTEM",
      emailNotifications: true,
      pushNotifications: true,
      dailyDigest: false,
      timezone: "Asia/Dhaka",
    },
  });

  await prisma.employeeBankAccount.create({
    data: {
      userId: rafid.id,
      accountHolder: "Md. Rafidul Islam",
      bankName: "Eastern Bank Ltd.",
      accountNumber: "123456789123",
      branch: "Gulshan Avenue",
      swiftCode: "EBLDBDDH",
      taxId: "12345-12345-12345",
      isPrimary: true,
    },
  });

  await prisma.emergencyContact.create({
    data: {
      userId: rafid.id,
      name: "Shahriar Duke",
      relationship: "Brother",
      phone: "+8801811000000",
      email: "duke.family@example.com",
    },
  });

  await prisma.employeeSkill.createMany({
    data: [
      {
        userId: rafid.id,
        skillId: reactSkill.id,
        level: "ADVANCED",
        years: 4,
      },
      {
        userId: rafid.id,
        skillId: nextSkill.id,
        level: "ADVANCED",
        years: 3,
      },
    ],
  });

  await prisma.careerEvent.createMany({
    data: [
      {
        userId: rafid.id,
        title: "Promoted to Software Engineer",
        detail: "Led the rollout of the attendance dashboard revamp.",
        happenedAt: new Date("2024-10-01"),
      },
      {
        userId: rafid.id,
        title: "Employee of the Quarter",
        detail: "Recognised for improving build times by 35% and mentoring interns.",
        happenedAt: new Date("2024-06-01"),
      },
    ],
  });

  await prisma.attendanceRecord.createMany({
    data: [
      {
        employeeId: rafid.id,
        attendanceDate: new Date("2024-11-25"),
        checkInAt: new Date("2024-11-25T09:02:00+06:00"),
        checkOutAt: new Date("2024-11-25T17:30:00+06:00"),
        totalWorkSeconds: 8 * 3600 + 28 * 60,
        totalBreakSeconds: 1800,
        status: "PRESENT",
        note: "HQ stand-up",
        location: "Dhaka HQ",
        source: "WEB",
      },
      {
        employeeId: rafid.id,
        attendanceDate: new Date("2024-11-26"),
        checkInAt: new Date("2024-11-26T09:18:00+06:00"),
        checkOutAt: new Date("2024-11-26T17:05:00+06:00"),
        totalWorkSeconds: 7 * 3600 + 47 * 60,
        totalBreakSeconds: 0,
        status: "LATE",
        note: "Rain delay",
        location: "Dhaka HQ",
        source: "WEB",
      },
    ],
  });

  await prisma.workReport.create({
    data: {
      employeeId: rafid.id,
      reportDate: new Date("2024-11-26"),
      status: "SUBMITTED",
      submittedAt: new Date("2024-11-26T18:00:00+06:00"),
      note: "Delivered front end tweaks and backlog grooming.",
      items: {
        create: [
          {
            workType: "DEVELOPMENT",
            taskName: "Attendance History Filter",
            projectId: hrCoreProject.id,
            details: "Implemented year and status filters.",
            hours: "4.50",
          },
          {
            workType: "DESIGN",
            taskName: "Invoice Modal Polish",
            details: "Refined modal UX states with design team.",
            hours: "2.00",
          },
          {
            workType: "PROJECT",
            taskName: "Sprint Grooming",
            details: "Reviewed backlog with Shahriar.",
            hours: "1.50",
          },
        ],
      },
    },
  });

  await prisma.leaveBalance.createMany({
    data: [
      {
        employeeId: rafid.id,
        leaveTypeId: casualLeave.id,
        year: 2024,
        allocated: "15",
        used: "8",
        carriedOver: "1",
      },
      {
        employeeId: rafid.id,
        leaveTypeId: sickLeave.id,
        year: 2024,
        allocated: "10",
        used: "5",
        carriedOver: "0",
      },
      {
        employeeId: rafid.id,
        leaveTypeId: annualLeave.id,
        year: 2024,
        allocated: "18",
        used: "14",
        carriedOver: "0",
      },
    ],
  });

  const rafidLeaveRequest = await prisma.leaveRequest.create({
    data: {
      employeeId: rafid.id,
      leaveTypeId: sickLeave.id,
      startDate: new Date("2024-11-30"),
      endDate: new Date("2024-12-01"),
      totalDays: "2",
      status: "APPROVED",
      reason: "Flu recovery",
      reviewerId: shahriar.id,
      reviewedAt: new Date("2024-11-25"),
    },
  });

  await prisma.leaveAttachment.create({
    data: {
      leaveRequestId: rafidLeaveRequest.id,
      filename: "medical_certificate.pdf",
      fileUrl: "https://example.com/medical_certificate.pdf",
      mimeType: "application/pdf",
      sizeBytes: 204800,
    },
  });

  // Employee 2 (HR Admin)
  const ayesha = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: "ayesha.rahman@ndi.hr",
      passwordHash: PASSWORD_HASH,
      phone: "+8801611000000",
      role: "HR_ADMIN",
      status: "ACTIVE",
      lastLoginAt: new Date(),
    },
  });

  await prisma.employeeProfile.create({
    data: {
      userId: ayesha.id,
      firstName: "Ayesha",
      lastName: "Rahman",
      preferredName: "Ayesha",
      gender: "FEMALE",
      dateOfBirth: new Date("1992-02-20"),
      nationality: "Bangladeshi",
      bio: "HR partner focused on employee wellbeing and policy excellence.",
      workModel: "ONSITE",
      currentAddress: "Banani, Dhaka",
      permanentAddress: "Sylhet, Bangladesh",
      personalEmail: "ayesha.personal@example.com",
      workEmail: "ayesha.rahman@ndi.hr",
      workPhone: "+8801611000000",
      personalPhone: "+8801612000000",
    },
  });

  await prisma.employmentDetail.create({
    data: {
      userId: ayesha.id,
      organizationId: organization.id,
      employeeCode: "EMP-003",
      designation: "HR Business Partner",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      startDate: new Date("2022-05-10"),
      departmentId: peopleDept.id,
      teamId: peopleOpsTeam.id,
      reportingManagerId: shahriar.id,
      primaryLocation: "Dhaka HQ",
      workHours: "09:00-17:00",
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: peopleOpsTeam.id,
      userId: ayesha.id,
      role: "HR Partner",
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: hrCoreProject.id,
      userId: ayesha.id,
      role: "HR SME",
      allocatedPercent: 30,
    },
  });

  await prisma.userPreference.create({
    data: {
      userId: ayesha.id,
      theme: "LIGHT",
      emailNotifications: true,
      pushNotifications: true,
      dailyDigest: true,
      timezone: "Asia/Dhaka",
    },
  });

  await prisma.employeeBankAccount.create({
    data: {
      userId: ayesha.id,
      accountHolder: "Ayesha Rahman",
      bankName: "Dutch Bangla Bank",
      accountNumber: "998877665544",
      branch: "Banani",
      swiftCode: "DBBLBDDH",
      isPrimary: true,
    },
  });

  await prisma.emergencyContact.create({
    data: {
      userId: ayesha.id,
      name: "Farzana Rahman",
      relationship: "Sister",
      phone: "+8801715000000",
      email: "farzana.rahman@example.com",
    },
  });

  await prisma.employeeSkill.create({
    data: {
      userId: ayesha.id,
      skillId: peopleSkill.id,
      level: "ADVANCED",
      years: 7,
    },
  });

  await prisma.attendanceRecord.create({
    data: {
      employeeId: ayesha.id,
      attendanceDate: new Date("2024-11-26"),
      checkInAt: new Date("2024-11-26T08:55:00+06:00"),
      checkOutAt: new Date("2024-11-26T17:10:00+06:00"),
      totalWorkSeconds: 8 * 3600 + 15 * 60,
      totalBreakSeconds: 1800,
      status: "PRESENT",
      note: "Conducted onboarding sessions.",
      location: "Dhaka HQ",
      source: "WEB",
      breaks: {
        create: [
          {
            startedAt: new Date("2024-11-26T13:15:00+06:00"),
            endedAt: new Date("2024-11-26T13:45:00+06:00"),
            type: "MEAL",
            note: "Lunch",
          },
        ],
      },
    },
  });

  await prisma.workReport.create({
    data: {
      employeeId: ayesha.id,
      reportDate: new Date("2024-11-26"),
      status: "SUBMITTED",
      submittedAt: new Date("2024-11-26T17:20:00+06:00"),
      note: "Processed leave approvals and onboarding paperwork.",
      items: {
        create: [
          {
            workType: "SUPPORT",
            taskName: "Onboarding Session",
            details: "Welcomed two new hires and guided paperwork.",
            hours: "3.00",
          },
          {
            workType: "PROJECT",
            taskName: "Policy Review",
            details: "Collaborated on attendance policy automation.",
            projectId: hrCoreProject.id,
            hours: "2.50",
          },
          {
            workType: "OTHER",
            taskName: "Employee Check-ins",
            details: "Weekly wellbeing syncs.",
            hours: "2.00",
          },
        ],
      },
    },
  });

  await prisma.leaveBalance.createMany({
    data: [
      {
        employeeId: ayesha.id,
        leaveTypeId: casualLeave.id,
        year: 2024,
        allocated: "12",
        used: "6",
        carriedOver: "1",
      },
      {
        employeeId: ayesha.id,
        leaveTypeId: sickLeave.id,
        year: 2024,
        allocated: "12",
        used: "3",
        carriedOver: "0",
      },
      {
        employeeId: ayesha.id,
        leaveTypeId: annualLeave.id,
        year: 2024,
        allocated: "18",
        used: "10",
        carriedOver: "2",
      },
    ],
  });

  const notification = await prisma.notification.create({
    data: {
      organizationId: organization.id,
      senderId: ayesha.id,
      title: "Leave Application Approved",
      body: "Your leave application for 30 Nov - 1 Dec has been approved.",
      type: "LEAVE",
      status: "SENT",
      actionUrl: "/notification/details",
      sentAt: new Date("2024-11-25T10:00:00+06:00"),
    },
  });

  await prisma.notificationReceipt.createMany({
    data: [
      {
        notificationId: notification.id,
        userId: rafid.id,
        status: "READ",
        deliveredAt: new Date("2024-11-25T10:01:00+06:00"),
        readAt: new Date("2024-11-25T10:05:00+06:00"),
      },
      {
        notificationId: notification.id,
        userId: shahriar.id,
        status: "DELIVERED",
        deliveredAt: new Date("2024-11-25T10:02:00+06:00"),
      },
    ],
  });

  const payrollRun = await prisma.payrollRun.create({
    data: {
      organizationId: organization.id,
      payrollMonth: 10,
      payrollYear: 2024,
      periodStart: new Date("2024-10-01"),
      periodEnd: new Date("2024-10-31"),
      status: "READY",
      processedAt: new Date("2024-11-02"),
      submittedById: ayesha.id,
      notes: "October payroll ready for release.",
    },
  });

  const [shahriarPayslip, rafidPayslip, ayeshaPayslip] = await Promise.all([
    prisma.payslip.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: shahriar.id,
        grossPay: "180000.00",
        netPay: "145000.00",
        status: "GENERATED",
        generatedAt: new Date("2024-11-02T12:00:00+06:00"),
      },
    }),
    prisma.payslip.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: rafid.id,
        grossPay: "120000.00",
        netPay: "98000.00",
        status: "GENERATED",
        generatedAt: new Date("2024-11-02T12:05:00+06:00"),
      },
    }),
    prisma.payslip.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: ayesha.id,
        grossPay: "95000.00",
        netPay: "78000.00",
        status: "GENERATED",
        generatedAt: new Date("2024-11-02T12:10:00+06:00"),
      },
    }),
  ]);

  await prisma.payslipComponent.createMany({
    data: [
      {
        payslipId: shahriarPayslip.id,
        title: "Basic Salary",
        amount: "120000.00",
        componentType: "EARNINGS",
        sortOrder: 1,
      },
      {
        payslipId: shahriarPayslip.id,
        title: "Performance Bonus",
        amount: "30000.00",
        componentType: "EARNINGS",
        sortOrder: 2,
      },
      {
        payslipId: shahriarPayslip.id,
        title: "Tax",
        amount: "15000.00",
        componentType: "DEDUCTION",
        sortOrder: 3,
      },
      {
        payslipId: rafidPayslip.id,
        title: "Basic Salary",
        amount: "90000.00",
        componentType: "EARNINGS",
        sortOrder: 1,
      },
      {
        payslipId: rafidPayslip.id,
        title: "Project Bonus",
        amount: "15000.00",
        componentType: "EARNINGS",
        sortOrder: 2,
      },
      {
        payslipId: rafidPayslip.id,
        title: "Tax",
        amount: "7000.00",
        componentType: "DEDUCTION",
        sortOrder: 3,
      },
      {
        payslipId: ayeshaPayslip.id,
        title: "Basic Salary",
        amount: "70000.00",
        componentType: "EARNINGS",
        sortOrder: 1,
      },
      {
        payslipId: ayeshaPayslip.id,
        title: "Benefits Allowance",
        amount: "10000.00",
        componentType: "EARNINGS",
        sortOrder: 2,
      },
      {
        payslipId: ayeshaPayslip.id,
        title: "Tax",
        amount: "2000.00",
        componentType: "DEDUCTION",
        sortOrder: 3,
      },
    ],
  });

  // Final updates after creating users
  await prisma.team.update({
    where: { id: frontendTeam.id },
    data: { leadId: shahriar.id },
  });

  await prisma.team.update({
    where: { id: peopleOpsTeam.id },
    data: { leadId: ayesha.id },
  });

  console.log("Database seeded with organization, departments, and three employees.");
}

main()
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
