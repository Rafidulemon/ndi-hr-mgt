import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";

export type UserProfileResponse = {
  id: string;
  email: string;
  phone: string | null;
  organizationName: string;
  lastLoginAt: Date | null;
    profile: {
      firstName: string;
      lastName: string;
      preferredName: string | null;
      gender: string | null;
      dateOfBirth: Date | null;
      nationality: string | null;
      currentAddress: string | null;
      permanentAddress: string | null;
      workModel: string | null;
      personalEmail: string | null;
      workEmail: string | null;
      personalPhone: string | null;
      workPhone: string | null;
      profilePhotoUrl: string | null;
      bio: string | null;
    } | null;
  employment: {
    employeeCode: string | null;
    designation: string;
    employmentType: string;
    startDate: Date;
    status: string;
    departmentName: string | null;
    teamName: string | null;
    managerName: string | null;
  } | null;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
  bankAccount: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    branch: string | null;
    swiftCode: string | null;
  } | null;
};

export const userService = {
  async getProfile(ctx: TRPCContext): Promise<UserProfileResponse> {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        lastLoginAt: true,
        organization: {
          select: {
            name: true,
          },
        },
        profile: {
          select: {
            firstName: true,
            lastName: true,
            preferredName: true,
            gender: true,
            dateOfBirth: true,
            nationality: true,
            currentAddress: true,
            permanentAddress: true,
            workModel: true,
            personalEmail: true,
            workEmail: true,
            personalPhone: true,
            workPhone: true,
            profilePhotoUrl: true,
            bio: true,
          },
        },
        employment: {
          select: {
            employeeCode: true,
            designation: true,
            employmentType: true,
            startDate: true,
            status: true,
            department: {
              select: {
                name: true,
              },
            },
            team: {
              select: {
                name: true,
              },
            },
            manager: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    preferredName: true,
                  },
                },
              },
            },
          },
        },
        emergencyContacts: {
          take: 1,
          orderBy: { createdAt: "asc" },
          select: {
            name: true,
            phone: true,
            relationship: true,
          },
        },
        bankAccounts: {
          take: 1,
          orderBy: { createdAt: "asc" },
          select: {
            bankName: true,
            accountHolder: true,
            accountNumber: true,
            branch: true,
            swiftCode: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const [emergencyContact] = user.emergencyContacts;
    const [bankAccount] = user.bankAccounts;

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      organizationName: user.organization?.name ?? "",
      lastLoginAt: user.lastLoginAt,
      profile: user.profile,
      employment: user.employment
        ? {
            employeeCode: user.employment.employeeCode,
            designation: user.employment.designation,
            employmentType: user.employment.employmentType,
            startDate: user.employment.startDate,
            status: user.employment.status,
            departmentName: user.employment.department?.name ?? null,
            teamName: user.employment.team?.name ?? null,
            managerName:
              user.employment.manager?.profile?.preferredName ??
              ([
                user.employment.manager?.profile?.firstName,
                user.employment.manager?.profile?.lastName,
              ]
                .filter(Boolean)
                .join(" ") || null),
          }
        : null,
      emergencyContact: emergencyContact ?? null,
      bankAccount: bankAccount ?? null,
    };
  },
};
