import Link from "next/link";

import Text from "../../../../components/atoms/Text/Text";
import Button from "../../../../components/atoms/buttons/Button";
import { EmployeeHeader } from "../../../../components/layouts/EmployeeHeader";

import {
  employeeDirectory,
  employeeStatusStyles,
  type Employee,
} from "../data";

type PageProps = {
  searchParams?: {
    employeeId?: string | string[];
  };
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatValue = (value?: string | null, fallback = "—") =>
  value && value.trim().length > 0 ? value : fallback;

const resolveEmployee = (
  searchParams: PageProps["searchParams"]
): { employee: Employee | null; isFallback: boolean } => {
  if (!employeeDirectory.length) {
    return { employee: null, isFallback: false };
  }

  const employeeParam = searchParams?.employeeId;
  const employeeId = Array.isArray(employeeParam)
    ? employeeParam[0]
    : employeeParam;

  if (!employeeId) {
    return { employee: employeeDirectory[0], isFallback: true };
  }

  const normalizedId = employeeId.trim().toLowerCase();
  if (!normalizedId) {
    return { employee: employeeDirectory[0], isFallback: true };
  }

  const match = employeeDirectory.find(
    (item) => item.id.toLowerCase() === normalizedId
  );

  if (!match) {
    return { employee: employeeDirectory[0], isFallback: true };
  }

  return { employee: match, isFallback: false };
};

const documentStatusColor: Record<string, string> = {
  Signed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  Pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  Missing:
    "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
};

export default function EmployeeProfilePage({ searchParams }: PageProps) {
  const { employee, isFallback } = resolveEmployee(searchParams);

  if (!employee) {
    return (
      <section className="rounded-[32px] border border-dashed border-slate-200 bg-white/95 p-10 text-center shadow-xl shadow-indigo-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-200">
          Employee management
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
          No employee data yet
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Add employees from the Employee Management page to preview their profiles here.
        </p>
        <Link
          href="/hr-admin/employees"
          className="mt-6 inline-flex items-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Back to directory
        </Link>
      </section>
    );
  }

  const personaTags = [
    employee.department,
    employee.squad,
    employee.workArrangement,
    employee.status,
  ].filter(Boolean) as string[];

  const quickStats = [
    {
      label: "Experience",
      value: formatValue(employee.experience),
      helper: `Since ${formatDate(employee.startDate)}`,
    },
    {
      label: "Employment type",
      value: employee.employmentType,
      helper: employee.workArrangement,
    },
    {
      label: "Compensation band",
      value: employee.salaryBand,
      helper: currencyFormatter.format(employee.annualSalary),
    },
    {
      label: "Manager",
      value: employee.manager,
      helper: employee.department,
    },
  ];

  const infoSections = [
    {
      title: "Contact & Basics",
      items: [
        { label: "Email", value: employee.email },
        { label: "Phone", value: employee.phone },
        { label: "Location", value: employee.location },
        { label: "Work arrangement", value: employee.workArrangement },
      ],
    },
    {
      title: "Employment Snapshot",
      items: [
        { label: "Employee ID", value: employee.id },
        { label: "Department", value: employee.department },
        { label: "Squad", value: employee.squad },
        { label: "Manager", value: employee.manager },
        { label: "Start date", value: formatDate(employee.startDate) },
        { label: "Next review", value: formatDate(employee.nextReview) },
      ],
    },
    {
      title: "Emergency contact",
      items: [
        { label: "Name", value: employee.emergencyContact.name },
        { label: "Phone", value: employee.emergencyContact.phone },
        { label: "Relation", value: employee.emergencyContact.relation },
      ],
    },
    {
      title: "Addresses",
      items: [
        { label: "Residential", value: employee.address },
        { label: "Work location", value: employee.location },
      ],
    },
  ];

  const timeOffEntries = [
    { label: "Annual leave", value: `${employee.timeOffBalance.annual} days` },
    { label: "Sick leave", value: `${employee.timeOffBalance.sick} days` },
    { label: "Casual leave", value: `${employee.timeOffBalance.casual} days` },
  ];

  const joiningDate = formatDate(employee.startDate);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <EmployeeHeader
          name={employee.name}
          designation={employee.role}
          joining_date={joiningDate}
        />
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/hr-admin/employees/edit?employeeId=${encodeURIComponent(employee.id)}`}
            className="inline-flex items-center rounded-xl border border-transparent bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-500"
          >
            Edit Profile
          </Link>
          <Button theme="secondary">Export Record</Button>
        </div>
        {isFallback ? (
          <p className="text-xs text-slate-500">
            Showing sample employee. Use the Employee Management table to open a specific profile.
          </p>
        ) : null}
      </div>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-[24px] bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 text-3xl font-semibold text-white shadow-lg shadow-indigo-500/30 dark:from-slate-800 dark:to-slate-700">
              {employee.avatarInitials}
            </div>
            <div className="space-y-3">
              <Text
                text={employee.role}
                className="text-xl font-semibold text-slate-900 dark:text-white"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {employee.department} · {employee.workArrangement}
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${employeeStatusStyles[employee.status].bg}`}
                >
                  {employee.status}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
                  {employee.employmentType}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {personaTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600 dark:bg-slate-800/60 dark:text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
            <div className="grid gap-4 sm:grid-cols-2">
              {quickStats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.helper}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">
              Time off balance
            </p>
            <div className="mt-4 space-y-3">
              {timeOffEntries.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60"
                >
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {entry.label}
                  </span>
                  <span className="text-base font-semibold text-slate-900 dark:text-white">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {infoSections.map((section) => (
          <div
            key={section.title}
            className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {section.title}
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {section.items.map((item) => (
                <div key={item.label} className="grid grid-cols-2 gap-2">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    {item.label}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Skills & tags
          </h3>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {employee.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {employee.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Compliance & documents
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {employee.documents.map((document) => (
              <li key={document.name} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">
                  {document.name}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${documentStatusColor[document.status]}`}
                >
                  {document.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
