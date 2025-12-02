'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { BiLogOut } from "react-icons/bi";
import { MdOutlineDashboard } from "react-icons/md";
import {
  FaBell,
  FaCalendarCheck,
  FaClipboardList,
  FaEnvelopeOpenText,
  FaRegClock,
  FaUser,
  FaUsers,
  FaSitemap,
  FaFileInvoice,
} from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";

import { Modal } from "../atoms/frame/Modal";
import { canManageTeams } from "@/types/hr-team";
import { canManageWork } from "@/types/hr-work";
import { trpc } from "@/trpc/client";

type MenuItem = {
  id:
    | "dashboard"
    | "employees"
    | "teams"
    | "work"
    | "reports"
    | "attendance"
    | "leave"
    | "alerts"
    | "messages"
    | "invoices";
  label: string;
  icon: ReactNode;
  href?: string;
  subItems?: {
    label: string;
    href: string;
    icon: ReactNode;
  }[];
};

type Props = {
  className?: string;
  organizationName?: string;
  userFullName?: string;
  showEmployeeDashboardLink?: boolean;
  pendingLeaveCount?: number;
  viewerRole?: UserRole;
};

const hrMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "HR Dashboard",
    icon: <MdOutlineDashboard />,
    href: "/hr-admin",
  },
  {
    id: "employees",
    label: "Employee Management",
    icon: <FaUsers />,
    href: "/hr-admin/employees",
  },
  {
    id: "teams",
    label: "Team Management",
    icon: <FaSitemap />,
    href: "/hr-admin/team-management",
  },
  {
    id: "work",
    label: "Work Management",
    icon: <FaRegClock />,
    href: "/hr-admin/work-management",
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: <FaCalendarCheck />,
    href: "/hr-admin/attendance",
  },
  {
    id: "leave",
    label: "Leave Management",
    icon: <FaClipboardList />,
    href: "/hr-admin/leave-approvals",
  },
  {
    id: "invoices",
    label: "Invoice Management",
    icon: <FaFileInvoice />,
    href: "/hr-admin/invoices",
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: <TbReportAnalytics />,
    href: "/hr-admin/reports",
  },
  {
    id: "messages",
    label: "Messages",
    icon: <FaEnvelopeOpenText />,
    href: "/hr-admin/messages",
  },
  {
    id: "alerts",
    label: "Announcements",
    icon: <FaBell />,
    href: "/hr-admin/announcements",
  },
];

const HrAdminLeftMenu = ({
  className = "",
  organizationName = "NDI HR",
  userFullName,
  showEmployeeDashboardLink = false,
  pendingLeaveCount = 0,
  viewerRole,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const pendingCountQuery = trpc.hrLeave.pendingCount.useQuery(undefined, {
    initialData: pendingLeaveCount,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });
  const livePendingLeaveCount =
    typeof pendingCountQuery.data === "number"
      ? pendingCountQuery.data
      : pendingLeaveCount;

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await signOut({ redirect: false });
      router.push("/auth/login");
    } catch (error) {
      void error;
      setLogoutError("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsOpenModal(false);
    }
  };

  const nameFallback = useMemo(() => {
    if (userFullName && userFullName.trim().length > 0) {
      return userFullName;
    }
    return "HR Admin";
  }, [userFullName]);

  const isRouteActive = (href?: string) => {
    if (!href) return false;
    if (href === "/hr-admin") {
      return currentPath === "/hr-admin" || currentPath === "/hr-admin/";
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const containerClasses = [
    "flex min-h-full w-full flex-col gap-4 rounded-[32px] border border-white/60 bg-white/90 px-4 py-6 text-slate-700 shadow-2xl shadow-indigo-100 backdrop-blur transition-colors duration-200 lg:min-w-[18rem]",
    "dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-slate-900/60",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const getNavClasses = (isActive: boolean) =>
    [
      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
      isActive
        ? "bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 dark:shadow-sky-900/40 rounded"
        : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100",
    ].join(" ");

  const allowedMenuItems = useMemo(() => {
    return hrMenuItems.filter((item) => {
      if (item.id === "teams") {
        return canManageTeams(viewerRole);
      }
      if (item.id === "work") {
        return canManageWork(viewerRole);
      }
      return true;
    });
  }, [viewerRole]);

  return (
    <div className={containerClasses}>
      <div className="sticky top-0 z-20 flex flex-col items-center gap-3 rounded-[24px] bg-white/95 pb-2 text-center backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:text-left dark:bg-slate-900/85">
        <div className="flex flex-row items-center justify-center gap-1 sm:justify-start">
          <Image
            src="/logo/ndi.logo.png"
            alt="NDI HR Logo"
            width={160}
            height={70}
            className="h-auto w-10"
            priority
          />
          <div>
            <p className="text-base font-semibold text-[#364a6e] dark:text-slate-100">
              {organizationName}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {nameFallback}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul className="space-y-1">
          {allowedMenuItems.map((item) => {
            const showPendingBadge =
              item.id === "leave" && livePendingLeaveCount > 0;
            return (
              <li key={item.id}>
                <Link
                  href={item.href ?? "#"}
                  className={getNavClasses(isRouteActive(item.href))}
                >
                  {item.icon}
                  <span className="text-[16px] font-semibold">{item.label}</span>
                  {showPendingBadge ? (
                    <span className="ml-auto rounded-full bg-rose-500/10 px-3 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-400/20 dark:text-rose-100">
                      {livePendingLeaveCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
        {showEmployeeDashboardLink && (
          <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 rounded dark:border-slate-700/80 dark:bg-slate-800/60">
            <Link
              href="/"
              target="_blank"
              className={`${getNavClasses(isRouteActive("/"))}`}
            >
              <FaUser className="text-lg" />
              <span className="text-[16px] font-semibold">
                Employee Dashboard
              </span>
            </Link>
          </div>
        )}
      </nav>

      <div className="mt-auto w-full">
        <div className="section-divider" />
        <button
          type="button"
          onClick={() => setIsOpenModal(true)}
          disabled={isLoggingOut}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 dark:from-rose-500 dark:via-amber-500 dark:to-orange-400 dark:shadow-rose-900/50"
        >
          <BiLogOut className="text-lg" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
        {logoutError ? (
          <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {logoutError}
          </p>
        ) : null}
      </div>

      <Modal
        doneButtonText="Log Out"
        cancelButtonText="Cancel"
        isCancelButton
        className="h-auto w-[496px]"
        open={isOpenModal}
        setOpen={setIsOpenModal}
        title="Log Out?"
        buttonWidth="120px"
        buttonHeight="40px"
        onDoneClick={handleLogout}
        closeOnClick={() => setIsOpenModal(false)}
      >
        <div>Are you sure you would like to log out?</div>
      </Modal>
    </div>
  );
};

export default HrAdminLeftMenu;
