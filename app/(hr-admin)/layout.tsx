import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LeaveStatus, type UserRole } from "@prisma/client";

import HrAdminLeftMenu from "../components/navigations/HrAdminLeftMenu";
import "../globals.css";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db";

export default async function HrAdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireUser();
  const elevatedRoles: ReadonlyArray<UserRole> = [
    "MANAGER",
    "HR_ADMIN",
    "ORG_OWNER",
    "ORG_ADMIN",
    "SUPER_ADMIN",
  ];
  const canAccessHrAdmin = elevatedRoles.includes(user.role);

  if (!canAccessHrAdmin) {
    redirect("/");
  }

  const fullName =
    user.profile?.preferredName ??
    [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ");
  const organizationName = user.organization?.name ?? "NDI HR";
  const pendingLeaveCount =
    user.organizationId &&
    (await prisma.leaveRequest.count({
      where: {
        status: { in: [LeaveStatus.PENDING, LeaveStatus.PROCESSING] },
        employee: {
          organizationId: user.organizationId,
        },
      },
    }));

  return (
    <div className="relative flex min-h-screen w-full">
      <div className="absolute inset-x-0 top-0 h-40 w-full bg-gradient-to-b from-white/70 to-transparent blur-2xl dark:from-slate-900/60" />
      <div className="relative z-10 flex w-full flex-col gap-6 px-4 py-6 transition-colors duration-200 sm:px-6 lg:flex-row lg:px-10 xl:px-14">
        <aside className="w-full flex-shrink-0 lg:w-72 lg:flex-shrink-0 xl:w-80">
          <div className="sticky top-6">
            <HrAdminLeftMenu
              className="lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:overscroll-contain lg:scrollbar-none"
              organizationName={organizationName}
              userFullName={fullName}
              showEmployeeDashboardLink
              pendingLeaveCount={Number(pendingLeaveCount) || 0}
              viewerRole={user.role}
              organizationLogoUrl={user.organization?.logoUrl ?? undefined}
            />
          </div>
        </aside>
        <main className="flex-1 pb-16 text-slate-800 transition-colors duration-200 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
