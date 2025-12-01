"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { IconType } from "react-icons";
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EmploymentType, UserRole } from "@prisma/client";

import Button from "../../../components/atoms/buttons/Button";
import TextArea from "../../../components/atoms/inputs/TextArea";
import TextInput from "../../../components/atoms/inputs/TextInput";
import {
  employeeStatusStyles,
  pendingApprovalStatusStyles,
} from "./statusStyles";
import { trpc } from "@/trpc/client";
import type { EmployeeDirectoryEntry, EmployeeStatus } from "@/types/hr-admin";

const IconActionButton = ({
  label,
  icon: Icon,
  href,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: IconType;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const baseClasses =
    "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500";
  const styles = disabled ? `${baseClasses} pointer-events-none opacity-40` : baseClasses;
  const content = (
    <span className={styles}>
      <Icon className="text-base" />
    </span>
  );

  if (href && !disabled) {
    return (
      <Link href={href} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="disabled:cursor-not-allowed"
    >
      {content}
    </button>
  );
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatRelativeTime = (value?: string | null) => {
  if (!value) return "moments ago";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "moments ago";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

const countNewHiresInDays = (
  employees: EmployeeDirectoryEntry[],
  days: number
) => {
  const now = Date.now();
  const msInDay = 1000 * 60 * 60 * 24;
  return employees.filter((employee) => {
    if (!employee.startDate) return false;
    const start = new Date(employee.startDate).getTime();
    if (Number.isNaN(start)) return false;
    const diffDays = Math.floor((now - start) / msInDay);
    return diffDays <= days;
  }).length;
};

const statusFilterOptions: EmployeeStatus[] = [
  "Active",
  "On Leave",
  "Probation",
  "Pending",
];

const manualInviteSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  workEmail: z.string().email("Provide a valid work email"),
  inviteRole: z.string().min(1, "Select an access level"),
  designation: z.string().min(2, "Role/title is required"),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  startDate: z.string().optional(),
  workLocation: z.string().optional(),
  employmentType: z.string().min(1, "Choose an employment type"),
  notes: z.string().max(2000).optional(),
  sendInvite: z.boolean().optional(),
});

type ManualInviteFormValues = z.infer<typeof manualInviteSchema>;

const buildSuggestedEmail = (fullName: string, domain?: string | null) => {
  const safeDomain = (domain ?? "ndihr.io").replace(/^@/, "");
  if (!fullName.trim()) {
    return `name@${safeDomain}`;
  }
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\./, "")
    .replace(/\.$/, "");
  return `${slug || "name"}@${safeDomain}`;
};

export default function EmployeeManagementPage() {
  const utils = trpc.useUtils();
  const dashboardQuery = trpc.hrEmployees.dashboard.useQuery();
  const employeeDirectory = dashboardQuery.data?.directory ?? [];
  const pendingApprovals = dashboardQuery.data?.pendingApprovals ?? [];
  const viewerRole = dashboardQuery.data?.viewerRole ?? "EMPLOYEE";
  const manualInviteOptions = dashboardQuery.data?.manualInvite;
  const departmentOptions = manualInviteOptions?.departments ?? [];
  const managerOptions = manualInviteOptions?.managers ?? [];
  const locationOptions = manualInviteOptions?.locations ?? [];
  const employmentTypeOptions = manualInviteOptions?.employmentTypes ?? [];
  const inviteRoleOptions = manualInviteOptions?.allowedRoles ?? [];
  const manualInviteDisabled = inviteRoleOptions.length === 0;
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | EmployeeStatus>("all");
  const [actionAlert, setActionAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: "approve" | "reject" | "delete";
  } | null>(null);
  const manualInviteForm = useForm<ManualInviteFormValues>({
    resolver: zodResolver(manualInviteSchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      inviteRole: "",
      designation: "",
      departmentId: "",
      managerId: "",
      startDate: "",
      workLocation: "",
      employmentType: "",
      notes: "",
      sendInvite: true,
    },
  });
  const {
    register: inviteRegister,
    handleSubmit: handleInviteSubmit,
    reset: resetInviteForm,
    formState: { errors: inviteErrors },
  } = manualInviteForm;
  const defaultManualInviteValues = useMemo<ManualInviteFormValues>(
    () => ({
      fullName: "",
      workEmail: "",
      inviteRole: manualInviteOptions?.allowedRoles[0]?.value ?? "",
      designation: "",
      departmentId: "",
      managerId: "",
      startDate: "",
      workLocation: "",
      employmentType: manualInviteOptions?.employmentTypes[0]?.value ?? "",
      notes: "",
      sendInvite: true,
    }),
    [manualInviteOptions],
  );
  const [fullNameForPlaceholder, setFullNameForPlaceholder] = useState("");
  const workEmailPlaceholder = useMemo(
    () => buildSuggestedEmail(fullNameForPlaceholder ?? "", manualInviteOptions?.organizationDomain),
    [fullNameForPlaceholder, manualInviteOptions?.organizationDomain],
  );

  const canDeleteEmployees = ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "MANAGER"].includes(
    viewerRole,
  );

  useEffect(() => {
    if (!actionAlert) {
      return;
    }
    const timer = window.setTimeout(() => setActionAlert(null), 5000);
    return () => window.clearTimeout(timer);
  }, [actionAlert]);

  useEffect(() => {
    if (!manualInviteOptions) {
      return;
    }
    resetInviteForm(defaultManualInviteValues);
  }, [defaultManualInviteValues, manualInviteOptions, resetInviteForm]);

  const approveMutation = trpc.hrEmployees.approveSignup.useMutation({
    onSettled: () => setPendingAction(null),
  });
  const rejectMutation = trpc.hrEmployees.rejectSignup.useMutation({
    onSettled: () => setPendingAction(null),
  });
  const deleteMutation = trpc.hrEmployees.deleteEmployee.useMutation({
    onSettled: () => setPendingAction(null),
  });
  const inviteMutation = trpc.hrEmployees.invite.useMutation({
    onSuccess: (data) => {
      setActionAlert({
        type: "success",
        message: data.invitationSent
          ? `Invitation email sent to ${data.email}.`
          : `Pending profile created for ${data.email}.`,
      });
      resetInviteForm(defaultManualInviteValues);
      setFullNameForPlaceholder("");
      void utils.hrEmployees.dashboard.invalidate();
    },
    onError: (error) => {
      setActionAlert({
        type: "error",
        message: error.message,
      });
    },
  });
  const handleManualInviteSubmit = handleInviteSubmit((values) => {
    inviteMutation.mutate({
      ...values,
      inviteRole: values.inviteRole as UserRole,
      employmentType: values.employmentType as EmploymentType,
      departmentId: values.departmentId || undefined,
      managerId: values.managerId || undefined,
      startDate: values.startDate || undefined,
      workLocation: values.workLocation || undefined,
      notes: values.notes?.trim() || undefined,
      sendInvite: values.sendInvite ?? true,
    });
  });

  const isProcessingAction = (type: "approve" | "reject" | "delete", id: string) =>
    pendingAction?.type === type && pendingAction?.id === id;

  const handleApprove = (employeeId: string, name: string) => {
    setPendingAction({ id: employeeId, type: "approve" });
    approveMutation.mutate(
      { employeeId },
      {
        onSuccess: () => {
          void utils.hrEmployees.dashboard.invalidate();
          setActionAlert({ type: "success", message: `${name} has been approved.` });
        },
        onError: (error) => {
          setActionAlert({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleReject = (employeeId: string, name: string) => {
    setPendingAction({ id: employeeId, type: "reject" });
    rejectMutation.mutate(
      { employeeId },
      {
        onSuccess: () => {
          void utils.hrEmployees.dashboard.invalidate();
          setActionAlert({ type: "success", message: `${name} has been rejected.` });
        },
        onError: (error) => {
          setActionAlert({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleDeleteEmployee = (employeeId: string, name: string) => {
    if (!canDeleteEmployees) {
      setActionAlert({
        type: "error",
        message: "You do not have permission to delete employee records.",
      });
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setPendingAction({ id: employeeId, type: "delete" });
    deleteMutation.mutate(
      { employeeId },
      {
        onSuccess: () => {
          void utils.hrEmployees.dashboard.invalidate();
          setActionAlert({ type: "success", message: `${name} has been deleted.` });
        },
        onError: (error) => {
          setActionAlert({ type: "error", message: error.message });
        },
      },
    );
  };

  const filteredDirectory = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return employeeDirectory.filter((employee) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          employee.name,
          employee.email,
          employee.role,
          employee.manager ?? "",
          employee.squad ?? "",
          employee.employeeCode ?? "",
        ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesDepartment =
        departmentFilter === "all" ||
        (employee.department?.toLowerCase() ?? "") ===
          departmentFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [departmentFilter, employeeDirectory, searchTerm, statusFilter]);

  const totalEmployees = employeeDirectory.length;
  const activeEmployees = employeeDirectory.filter(
    (employee) => employee.status === "Active"
  ).length;
  const pendingEmployees = employeeDirectory.filter(
    (employee) => employee.status === "Pending"
  ).length;
  const remoteHybridEmployees = employeeDirectory.filter((employee) => {
    const arrangement = employee.workArrangement?.toLowerCase();
    return arrangement === "remote" || arrangement === "hybrid";
  }).length;
  const newHires = countNewHiresInDays(employeeDirectory, 60);
  const readyApprovals = pendingApprovals.filter(
    (request) => request.status === "Ready"
  ).length;

  const overviewCards = useMemo(
    () => [
      {
        label: "Total employees",
        value: totalEmployees.toString().padStart(2, "0"),
        helper: `+${newHires} joined last 60 days`,
      },
      {
        label: "Active workforce",
        value: `${activeEmployees}`,
        helper:
          totalEmployees > 0
            ? `${Math.round(
                (activeEmployees / totalEmployees) * 100
              )}% of total`
            : "No records yet",
      },
      {
        label: "Signup approvals",
        value: pendingApprovals.length.toString(),
        helper: `${readyApprovals} ready to approve`,
      },
      {
        label: "Remote + hybrid",
        value: remoteHybridEmployees.toString(),
        helper:
          totalEmployees > 0
            ? `${Math.round(
                (remoteHybridEmployees / totalEmployees) * 100
              )}% flexible`
            : "—",
      },
    ],
    [
      totalEmployees,
      newHires,
      activeEmployees,
      pendingApprovals.length,
      readyApprovals,
      remoteHybridEmployees,
    ]
  );

  const directorySummary =
    filteredDirectory.length === totalEmployees
      ? `${totalEmployees} records · Export-ready and synced with payroll`
      : `${filteredDirectory.length} of ${totalEmployees} records match your filters`;

  const handleScrollToManualSignup = () => {
    const manualSignupSection = document.getElementById("manual-signup");
    manualSignupSection?.scrollIntoView({ behavior: "smooth" });
  };

  if (dashboardQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Loading employees...
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-slate-600">
        <p>We couldn&apos;t load the employee directory right now.</p>
        <Button
          onClick={() => dashboardQuery.refetch()}
          disabled={dashboardQuery.isFetching}
          className="px-6 py-3 text-sm"
        >
          {dashboardQuery.isFetching ? "Refreshing..." : "Retry"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {actionAlert ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            actionAlert.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
          }`}
        >
          {actionAlert.message}
        </div>
      ) : null}

      <section className="rounded-[32px] border border-white/60 bg-white/95 p-8 shadow-xl shadow-indigo-100 transition dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">
              Employee management
            </p>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                Bring sign-ups, approvals, and people data into one desk.
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Manually create employee accounts, hold them in approval, then
                jump into detailed profiles without switching apps.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TextInput
                label="Search directory"
                placeholder="Name, squad, status..."
                className="w-full sm:flex-1"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <Button
                onClick={handleScrollToManualSignup}
                className="px-6 py-3 text-sm"
              >
                + Add employee
              </Button>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2">
            {overviewCards.map((card) => (
              <div
                key={card.label}
                className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/60 p-5 shadow-inner shadow-white/60 dark:border-slate-700/70 dark:from-slate-900 dark:to-slate-900/60 dark:shadow-none"
              >
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {card.helper}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-xl shadow-indigo-100 transition dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Employee directory
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {directorySummary}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-inner shadow-white/60 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              <option value="all">All departments</option>
              {departmentOptions.map((department) => (
                <option key={department.id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-inner shadow-white/60 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as EmployeeStatus | "all")
              }
            >
              <option value="all">Status: All</option>
              {statusFilterOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Team Lead</th>
                <th className="px-4 py-3">Start date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDirectory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No employees match the current filters. Try adjusting your
                    search.
                  </td>
                </tr>
              ) : (
                filteredDirectory.map((employee) => {
                  const statusStyles =
                    employeeStatusStyles[employee.status] ??
                    employeeStatusStyles.Active;
                  return (
                    <tr
                      key={employee.id}
                      className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {employee.profilePhotoUrl ? (
                            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/70 shadow shadow-slate-900/5 dark:border-slate-700/70 dark:shadow-slate-900/40">
                              <Image
                                src={employee.profilePhotoUrl}
                                alt={employee.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-sm font-semibold uppercase text-white shadow shadow-indigo-500/30 dark:from-slate-800 dark:to-slate-700">
                              {employee.avatarInitials}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {employee.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {employee.role}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {employee.squad ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {employee.department ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles.bg}`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {employee.manager ?? "—"}
                        <span className="block text-xs text-slate-400">
                          {employee.workArrangement ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {formatDate(employee.startDate)}
                        <span className="block text-xs text-slate-400">
                          {employee.experience} exp
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <IconActionButton
                            label={`View ${employee.name}`}
                            icon={FiEye}
                            href={`/hr-admin/employees/view/${encodeURIComponent(
                              employee.id,
                            )}`}
                          />
                          <IconActionButton
                            label={`Edit ${employee.name}`}
                            icon={FiEdit2}
                            href={`/hr-admin/employees/edit/${encodeURIComponent(
                              employee.id,
                            )}`}
                          />
                          {canDeleteEmployees ? (
                            <IconActionButton
                              label={`Delete ${employee.name}`}
                              icon={FiTrash2}
                              onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                              disabled={isProcessingAction("delete", employee.id)}
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="manual-signup"
        className="grid gap-6 rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none lg:grid-cols-[2fr_1fr]"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Manually add an employee
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This creates a pending account. HR approval flips the status to
              active.
            </p>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleManualInviteSubmit}>
            <TextInput
              label="Full name"
              placeholder="e.g. Afsana Khan"
              className="w-full"
              name="fullName"
              register={inviteRegister}
              error={inviteErrors.fullName}
              isRequired
              disabled={manualInviteDisabled}
              registerOptions={{
                onChange: (event) => {
                  setFullNameForPlaceholder(event.target.value);
                  return event;
                },
              }}
            />
            <TextInput
              label="Work email"
              type="email"
              placeholder={workEmailPlaceholder}
              className="w-full"
              name="workEmail"
              register={inviteRegister}
              error={inviteErrors.workEmail}
              isRequired
              disabled={manualInviteDisabled}
            />
            <div className="flex flex-col">
              <label className="mb-2 text-[16px] font-bold text-text_bold dark:text-slate-200">
                Access level
              </label>
              <select
                className="rounded-[5px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200/70 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                {...inviteRegister("inviteRole")}
                disabled={manualInviteDisabled}
              >
                {inviteRoleOptions.length === 0 ? (
                  <option value="">No roles available</option>
                ) : null}
                {inviteRoleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {inviteErrors.inviteRole ? (
                <p className="mt-1 text-xs text-rose-500">{inviteErrors.inviteRole.message}</p>
              ) : null}
            </div>
            <TextInput
              label="Role / title"
              placeholder="e.g. Payroll Associate"
              className="w-full"
              name="designation"
              register={inviteRegister}
              error={inviteErrors.designation}
              isRequired
              disabled={manualInviteDisabled}
            />
            <TextInput
              label="Start date"
              type="date"
              className="w-full"
              name="startDate"
              register={inviteRegister}
              error={inviteErrors.startDate}
              disabled={manualInviteDisabled}
            />
            <div className="flex flex-col">
              <label className="mb-2 text-[16px] font-bold text-text_bold dark:text-slate-200">
                Work location
              </label>
              <select
                className="rounded-[5px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200/70 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                {...inviteRegister("workLocation")}
                disabled={manualInviteDisabled}
              >
                <option value="">Select location</option>
                {locationOptions.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {inviteErrors.workLocation ? (
                <p className="mt-1 text-xs text-rose-500">{inviteErrors.workLocation.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[16px] font-bold text-text_bold dark:text-slate-200">
                Department
              </label>
              <select
                className="rounded-[5px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200/70 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                {...inviteRegister("departmentId")}
                disabled={manualInviteDisabled}
              >
                <option value="">Select team</option>
                {departmentOptions.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {inviteErrors.departmentId ? (
                <p className="mt-1 text-xs text-rose-500">{inviteErrors.departmentId.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[16px] font-bold text-text_bold dark:text-slate-200">
                Manager
              </label>
              <select
                className="rounded-[5px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200/70 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                {...inviteRegister("managerId")}
                disabled={manualInviteDisabled}
              >
                <option value="">Select manager</option>
                {managerOptions.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                    {manager.designation ? ` · ${manager.designation}` : ""}
                  </option>
                ))}
              </select>
              {inviteErrors.managerId ? (
                <p className="mt-1 text-xs text-rose-500">{inviteErrors.managerId.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[16px] font-bold text-text_bold dark:text-slate-200">
                Employment type
              </label>
              <select
                className="rounded-[5px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200/70 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                {...inviteRegister("employmentType")}
                disabled={manualInviteDisabled}
              >
                {employmentTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {inviteErrors.employmentType ? (
                <p className="mt-1 text-xs text-rose-500">{inviteErrors.employmentType.message}</p>
              ) : null}
            </div>
            <TextArea
              label="Notes for HR (optional)"
              placeholder="Share onboarding context, paperwork status, or equipment needs."
              className="md:col-span-2 w-full"
              height="120px"
              name="notes"
              register={inviteRegister}
              error={inviteErrors.notes}
              disabled={manualInviteDisabled}
            />
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-200">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-indigo-600"
                  {...inviteRegister("sendInvite")}
                  defaultChecked
                  disabled={manualInviteDisabled}
                />
                Send account invite email now
              </label>
              <p className="mt-2 text-xs text-slate-400">
                The profile stays in <span className="font-semibold">Pending</span> until HR approves it inside this dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button
                type="submit"
                className="px-6 py-3 text-sm"
                disabled={manualInviteDisabled || inviteMutation.isPending}
              >
                {inviteMutation.isPending ? "Sending invite..." : "Create pending profile"}
              </Button>
              <Button
                type="button"
                theme="white"
                className="px-6 py-3 text-sm"
                onClick={() => {
                  resetInviteForm(defaultManualInviteValues);
                  setFullNameForPlaceholder("");
                }}
                disabled={manualInviteDisabled || inviteMutation.isPending}
              >
                Reset form
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4 rounded-[28px] border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-inner shadow-slate-900/40 dark:border-slate-700/70">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Signup pipeline
            </p>
            <h3 className="mt-2 text-3xl font-semibold">
              {pendingApprovals.length}
            </h3>
            <p className="text-sm text-white/70">Pending approvals</p>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <dt>Ready to activate</dt>
              <dd className="text-lg font-semibold">{readyApprovals}</dd>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <dt>Need documents</dt>
              <dd className="text-lg font-semibold">
                {
                  pendingApprovals.filter(
                    (request) => request.status === "Documents Pending"
                  ).length
                }
              </dd>
            </div>
          </dl>
          <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/80">
            <p className="font-semibold">Auto-approvals</p>
            <p className="mt-1 text-white/70">
              Coming soon: configure policies to auto-approve referrals or
              pre-onboarded contractors.
            </p>
            <p className="mt-3 text-xs text-white/50">
              {pendingEmployees} people in the directory are still marked as
              Pending until paperwork is complete.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-xl shadow-indigo-100 transition dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Pending signup approvals
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Accounts remain inaccessible until you approve them here.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button theme="white" className="px-5 py-2.5 text-sm">
              Download spreadsheet
            </Button>
            <Button className="px-5 py-2.5 text-sm">Approve all ready</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {pendingApprovals.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
              No pending signup requests right now.
            </p>
          ) : (
            pendingApprovals.map((request) => {
              const approvalStatusClass =
                pendingApprovalStatusStyles[request.status] ??
                pendingApprovalStatusStyles["Awaiting Review"];
              const isApproving = isProcessingAction("approve", request.id);
              const isRejecting = isProcessingAction("reject", request.id);

              return (
                <div
                  key={request.id}
                  className="grid gap-4 rounded-[28px] border border-slate-100 p-5 text-sm shadow-sm shadow-white/40 transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {request.id}
                      </p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {request.name}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${approvalStatusClass}`}
                    >
                      {request.status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                      {request.channel}
                    </span>
                    <p className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                      {formatRelativeTime(request.requestedAt)}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Role
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {request.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Department
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {request.department ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Experience
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {request.experience}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Email
                      </p>
                      <p className="font-mono text-sm text-slate-700 dark:text-slate-200">
                        {request.email}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {request.note}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        theme="white"
                        className="px-4 py-2 text-xs"
                        href={`/hr-admin/employees/view/${encodeURIComponent(request.id)}`}
                      >
                        View profile
                      </Button>
                      <Button
                        className="px-4 py-2 text-xs"
                        disabled={isApproving}
                        onClick={() => handleApprove(request.id, request.name)}
                      >
                        {isApproving ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        theme="cancel-secondary"
                        className="px-4 py-2 text-xs"
                        disabled={isRejecting}
                        onClick={() => handleReject(request.id, request.name)}
                      >
                        {isRejecting ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
