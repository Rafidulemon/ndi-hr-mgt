'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BiChevronDown, BiChevronUp, BiLogOut } from "react-icons/bi";
import {
  FaBell,
  FaCalendarCheck,
  FaClipboardList,
  FaEdit,
  FaEye,
  FaFileInvoice,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { TbReport, TbReportAnalytics } from "react-icons/tb";
import { HiOutlineDocumentText } from "react-icons/hi";
import { IoIosPaper } from "react-icons/io";
import { FiSettings } from "react-icons/fi";
import { Modal } from "../atoms/frame/Modal";

type Props = {
  isLeader?: boolean;
  isAdmin?: boolean;
  className?: string;
};

const menuItems = [
  { label: "Dashboard", icon: <MdOutlineDashboard />, href: "/" },
  { label: "Profile", icon: <FaUser />, href: "/profile" },
  { label: "Attendance", icon: <FaCalendarCheck />, href: "/attendance" },
  {
    label: "Leave",
    icon: <FaClipboardList />,
    href: "/leave",
    subItems: [
      {
        label: "Leave History",
        icon: <HiOutlineDocumentText />,
        href: "/leave",
      },
      {
        label: "Leave Application",
        icon: <IoIosPaper />,
        href: "/leave/application",
      },
    ],
  },

  {
    label: "Daily Report",
    icon: <TbReport />,
    href: "/report/daily",
    subItems: [
      {
        label: "Daily Report",
        icon: <HiOutlineDocumentText />,
        href: "/report/daily",
      },
      {
        label: "Daily Report History",
        icon: <IoIosPaper />,
        href: "/report/daily/history",
      },
    ],
  },

  {
    label: "Monthly Report",
    icon: <TbReportAnalytics />,
    href: "/report/monthly",
    subItems: [
      {
        label: "Monthly Report",
        icon: <HiOutlineDocumentText />,
        href: "/report/monthly",
      },
      {
        label: "Monthly Report History",
        icon: <IoIosPaper />,
        href: "/report/monthly/history",
      },
    ],
  },
  { label: "Notification", icon: <FaBell />, href: "/notification" },
  { label: "Invoice", icon: <FaFileInvoice />, href: "/invoice" },
  { label: "Settings", icon: <FiSettings />, href: "/settings" },
];

const LeftMenu = ({ isLeader = false, className = "" }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname ?? "/";

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(
    currentPath.startsWith("/profile")
  );
  const [isLeaveDropdownOpen, setIsLeaveDropdownOpen] = useState(
    currentPath.startsWith("/leave")
  );

  const [isDailyReportDropdownOpen, setIsDailyReportDropdownOpen] = useState(
    currentPath.startsWith("/report/daily")
  );

  const [isMonthlyReportDropdownOpen, setIsMonthlyReportDropdownOpen] =
    useState(currentPath.startsWith("/report/monthly"));
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const profileDropdownOpen =
    isProfileDropdownOpen || currentPath.startsWith("/profile");
  const leaveDropdownOpen =
    isLeaveDropdownOpen || currentPath.startsWith("/leave");
  const dailyReportDropdownOpen =
    isDailyReportDropdownOpen || currentPath.startsWith("/report/daily");
  const monthlyReportDropdownOpen =
    isMonthlyReportDropdownOpen || currentPath.startsWith("/report/monthly");

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const toggleLeaveDropdown = () => {
    setIsLeaveDropdownOpen((prev) => !prev);
  };

  const toggleDailyReportDropDownOpen = () => {
    setIsDailyReportDropdownOpen((prev) => !prev);
  };

  const toggleMonthlyReportDropDownOpen = () => {
    setIsMonthlyReportDropdownOpen((prev) => !prev);
  };

  const getNavClasses = (isActive: boolean) =>
    [
      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
      isActive
        ? "bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 dark:shadow-sky-900/40"
        : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100",
    ].join(" ");

  const getSubNavClasses = (isActive: boolean) =>
    [
      "flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition-all duration-200",
      isActive
        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800/80 dark:text-sky-300 dark:shadow-slate-900/40"
        : "text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100",
    ].join(" ");

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return currentPath === "/";
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const containerClasses = [
    "flex min-h-full w-full flex-col gap-6 rounded-[32px] border border-white/60 bg-white/90 p-6 text-slate-700 shadow-2xl shadow-indigo-100 backdrop-blur transition-colors duration-200 lg:min-w-[18rem]",
    "dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-slate-900/60",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/demo_logo.png"
          alt="Demo Logo"
          width={160}
          height={70}
          className="h-auto w-40"
          priority
        />
        <div className="relative h-28 w-28 rounded-3xl border-4 border-white shadow-lg shadow-indigo-200 dark:border-slate-700/80 dark:shadow-slate-900/60">
          <Image
            src="/dp.png"
            alt="Profile preview"
            fill
            sizes="(max-width: 768px) 112px, 112px"
            className="rounded-2xl object-cover"
            priority
          />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Md. Rafidul Islam
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Software Engineer
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-4 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
          Member since 2023
        </span>
      </div>

      <nav className="flex flex-col">
        <ul className="mt-4 space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.label === "Profile" ? (
                <div>
                  <button
                    onClick={toggleProfileDropdown}
                    className={getNavClasses(currentPath.startsWith("/profile"))}
                  >
                    {item.icon}
                    <span className="text-[16px] font-semibold">
                      {item.label}
                    </span>
                    {profileDropdownOpen ? (
                      <BiChevronUp className="ml-auto" />
                    ) : (
                      <BiChevronDown className="ml-auto" />
                    )}
                  </button>

                  {profileDropdownOpen && (
                    <ul className="mt-2 space-y-2 pl-4">
                      <li>
                        <Link
                          href="/profile"
                          className={getSubNavClasses(currentPath === "/profile")}
                        >
                          <FaEye />
                          <span className="text-[14px] font-medium">
                            View Profile
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/profile/edit"
                          className={getSubNavClasses(
                            currentPath === "/profile/edit"
                          )}
                        >
                          <FaEdit />
                          <span className="text-[14px] font-medium">
                            Edit Profile
                          </span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              ) : item.label === "Leave" ? (
                <div>
                  <button
                    onClick={toggleLeaveDropdown}
                    className={getNavClasses(currentPath.startsWith("/leave"))}
                  >
                    {item.icon}
                    <span className="text-[16px] font-semibold">
                      {item.label}
                    </span>
                    {leaveDropdownOpen ? (
                      <BiChevronUp className="ml-auto" />
                    ) : (
                      <BiChevronDown className="ml-auto" />
                    )}
                  </button>

                  {leaveDropdownOpen && (
                    <ul className="mt-2 space-y-2 pl-4">
                      <li>
                        <Link
                          href="/leave"
                          className={getSubNavClasses(currentPath === "/leave")}
                        >
                          <HiOutlineDocumentText />
                          <span className="text-[14px] font-medium">
                            History
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/leave/application"
                          className={getSubNavClasses(
                            currentPath === "/leave/application"
                          )}
                        >
                          <IoIosPaper />
                          <span className="text-[14px] font-medium">
                            Application
                          </span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              ) : item.label === "Notification" ? (
                <Link
                  href={item.href}
                  className={getNavClasses(isRouteActive("/notification"))}
                >
                  {item.icon}
                  <span className="text-[16px] font-semibold">
                    {item.label}
                  </span>
                </Link>
              ) : item.label === "Invoice" ? (
                <Link
                  href={item.href}
                  className={getNavClasses(isRouteActive("/invoice"))}
                >
                  {item.icon}
                  <span className="text-[16px] font-semibold">
                    {item.label}
                  </span>
                </Link>
              ) : item.label === "Daily Report" ? (
                <div>
                  <button
                    onClick={toggleDailyReportDropDownOpen}
                    className={getNavClasses(
                      currentPath.startsWith("/report/daily")
                    )}
                  >
                    {item.icon}
                    <span className="text-[16px] font-semibold">
                      {item.label}
                    </span>
                    {dailyReportDropdownOpen ? (
                      <BiChevronUp className="ml-auto" />
                    ) : (
                      <BiChevronDown className="ml-auto" />
                    )}
                  </button>

                  {dailyReportDropdownOpen && (
                    <ul className="mt-2 space-y-2 pl-4">
                      <li>
                        <Link
                          href="/report/daily/history"
                          className={getSubNavClasses(
                            currentPath === "/report/daily/history"
                          )}
                        >
                          <HiOutlineDocumentText />
                          <span className="text-[14px] font-medium">
                            History
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/report/daily"
                          className={getSubNavClasses(
                            currentPath === "/report/daily"
                          )}
                        >
                          <IoIosPaper />
                          <span className="text-[14px] font-medium">
                            Report
                          </span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              ) : item.label === "Monthly Report" ? (
                <div>
                  <button
                    onClick={toggleMonthlyReportDropDownOpen}
                    className={getNavClasses(
                      currentPath.startsWith("/report/monthly")
                    )}
                  >
                    {item.icon}
                    <span className="text-[16px] font-semibold">
                      {item.label}
                    </span>
                    {monthlyReportDropdownOpen ? (
                      <BiChevronUp className="ml-auto" />
                    ) : (
                      <BiChevronDown className="ml-auto" />
                    )}
                  </button>

                  {monthlyReportDropdownOpen && (
                    <ul className="mt-2 space-y-2 pl-4">
                      <li>
                        <Link
                          href="/report/monthly/history"
                          className={getSubNavClasses(
                            currentPath === "/report/monthly/history"
                          )}
                        >
                          <HiOutlineDocumentText />
                          <span className="text-[14px] font-medium">
                            History
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/report/monthly"
                          className={getSubNavClasses(
                            currentPath === "/report/monthly"
                          )}
                        >
                          <IoIosPaper />
                          <span className="text-[14px] font-medium">
                            Report
                          </span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={getNavClasses(isRouteActive(item.href))}
                >
                  {item.icon}
                  <span className="text-[16px] font-semibold">
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          ))}
          {isLeader && (
            <li>
              <Link
                href="/my-team"
                className={getNavClasses(currentPath === "/my-team")}
              >
                <FaUsers />
                <span className="text-[16px] font-semibold">My Team</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-auto w-full">
        <div className="section-divider" />
        <button
          type="button"
          onClick={() => setIsOpenModal(true)}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition-transform hover:scale-[1.01] dark:from-rose-500 dark:via-amber-500 dark:to-orange-400 dark:shadow-rose-900/50"
        >
          <BiLogOut className="text-lg" />
          Logout
        </button>
      </div>

      <Modal
        doneButtonText="Log Out"
        cancelButtonText="Cancel"
        isCancelButton
        className="h-auto w-[496px]"
        open={isOpenModal}
        setOpen={setIsOpenModal}
        title="Log Out ?"
        buttonWidth="120px"
        buttonHeight="40px"
        onDoneClick={() => router.push("/auth/login")}
        closeOnClick={() => setIsOpenModal(false)}
      >
        <div>Are you sure you would like to log out?</div>
      </Modal>
    </div>
  );
};

export default LeftMenu;
