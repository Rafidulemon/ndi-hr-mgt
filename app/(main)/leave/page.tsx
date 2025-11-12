"use client";

import { useMemo, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useRouter } from "next/navigation";
import Table from "../../components/atoms/tables/Table";
import { EmployeeHeader } from "../../components/layouts/EmployeeHeader";

type LeaveStatus = "Pending" | "Approved" | "Denied" | "Processing";

type LeaveRow = {
  id: string;
  appliedOn: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
  year: number;
  note: string;
};

const leaveRows: LeaveRow[] = [
  {
    id: "APL-10021",
    appliedOn: "12 Dec 2024",
    leaveType: "Casual",
    from: "15 Dec 2024",
    to: "17 Dec 2024",
    days: 3,
    status: "Pending",
    year: 2024,
    note: "Family visit",
  },
  {
    id: "APL-10018",
    appliedOn: "28 Nov 2024",
    leaveType: "Sick",
    from: "29 Nov 2024",
    to: "30 Nov 2024",
    days: 2,
    status: "Approved",
    year: 2024,
    note: "Flu recovery",
  },
  {
    id: "APL-10011",
    appliedOn: "16 Oct 2024",
    leaveType: "Annual",
    from: "21 Oct 2024",
    to: "24 Oct 2024",
    days: 4,
    status: "Denied",
    year: 2024,
    note: "Project freeze window",
  },
  {
    id: "APL-09991",
    appliedOn: "07 Sep 2024",
    leaveType: "Casual",
    from: "09 Sep 2024",
    to: "09 Sep 2024",
    days: 1,
    status: "Approved",
    year: 2024,
    note: "Govt. errand",
  },
  {
    id: "APL-09940",
    appliedOn: "14 Aug 2024",
    leaveType: "Paternity/Maternity",
    from: "20 Aug 2024",
    to: "30 Aug 2024",
    days: 11,
    status: "Processing",
    year: 2024,
    note: "Awaiting HR clearance",
  },
  {
    id: "APL-09875",
    appliedOn: "12 Jun 2024",
    leaveType: "Annual",
    from: "01 Jul 2024",
    to: "05 Jul 2024",
    days: 5,
    status: "Approved",
    year: 2024,
    note: "Eid holiday",
  },
  {
    id: "APL-09811",
    appliedOn: "22 May 2024",
    leaveType: "Casual",
    from: "24 May 2024",
    to: "24 May 2024",
    days: 1,
    status: "Denied",
    year: 2024,
    note: "Peak release window",
  },
  {
    id: "APL-09560",
    appliedOn: "02 Dec 2023",
    leaveType: "Annual",
    from: "18 Dec 2023",
    to: "23 Dec 2023",
    days: 6,
    status: "Approved",
    year: 2023,
    note: "Year-end vacation",
  },
];

const leaveBalances = [
  { type: "Casual", allocated: 15, used: 8 },
  { type: "Sick", allocated: 10, used: 5 },
  { type: "Annual", allocated: 18, used: 14 },
  { type: "Paternity/Maternity", allocated: 30, used: 10 },
];

const headers = [
  "Application ID",
  "Applied On",
  "Leave Type",
  "From",
  "To",
  "Days",
  "Status",
];

const statusFilters: Array<LeaveStatus | "All"> = [
  "All",
  "Pending",
  "Processing",
  "Approved",
  "Denied",
];

const statusClasses: Record<LeaveStatus, string> = {
  Pending: "bg-amber-50 text-amber-600",
  Approved: "bg-emerald-50 text-emerald-600",
  Denied: "bg-rose-50 text-rose-600",
  Processing: "bg-sky-50 text-sky-600",
};

export default function EmployeeLeavePage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = useMemo(() => {
    return leaveRows
      .filter((row) => row.year === year)
      .filter((row) => statusFilter === "All" || row.status === statusFilter)
      .filter((row) => {
        if (!searchTerm) return true;
        const value = searchTerm.toLowerCase();
        return (
          row.id.toLowerCase().includes(value) ||
          row.leaveType.toLowerCase().includes(value) ||
          row.note.toLowerCase().includes(value)
        );
      });
  }, [year, statusFilter, searchTerm]);

  const tableRows = filteredRows.map((row) => ({
    "Application ID": row.id,
    "Applied On": row.appliedOn,
    "Leave Type": row.leaveType,
    From: row.from,
    To: row.to,
    Days: `${row.days} day${row.days > 1 ? "s" : ""}`,
    Status: (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[row.status]}`}
      >
        {row.status}
      </span>
    ),
  }));

  const upcoming = filteredRows
    .filter((row) => row.status === "Pending" || row.status === "Processing")
    .slice(0, 4);

  const decrementYear = () => {
    setYear((prevYear) => prevYear - 1);
  };

  const incrementYear = () => {
    setYear((prevYear) => prevYear + 1);
  };

  return (
    <div className="bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <EmployeeHeader
          name="Md. Rafidul Islam"
          designation="Software Engineer"
          joining_date="Aug 17, 2023"
          hasRightButton
          buttonText="New application"
          onButtonClick={() => router.push("/leave/application")}
        />

        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Leave balance
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Track allocations at a glance
              </h2>
              <p className="text-sm text-slate-500">
                Balances update automatically after every approved request.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <button
                type="button"
                onClick={decrementYear}
                className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-slate-800"
              >
                <MdKeyboardArrowLeft size={20} />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                {year}
              </span>
              <button
                type="button"
                onClick={incrementYear}
                className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-slate-800"
              >
                <MdKeyboardArrowRight size={20} />
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {leaveBalances.map((balance) => {
              const remaining = Math.max(balance.allocated - balance.used, 0);
              return (
                <div
                  key={balance.type}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    {balance.type}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {remaining}
                  </p>
                  <p className="text-sm text-slate-500">
                    of {balance.allocated} days · {balance.used} used
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Leave history
                </h3>
                <p className="text-sm text-slate-500">
                  Search by ID, filter by status, and keep an eye on approvals.
                </p>
              </div>
              <div className="flex flex-1 min-w-[220px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search ID or purpose"
                  className="w-full bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    statusFilter === filter
                      ? "bg-primary_dark text-white shadow"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary_dark/40 hover:text-primary_dark"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-100 bg-white">
              {tableRows.length > 0 ? (
                <Table headers={headers} rows={tableRows} />
              ) : (
                <div className="p-10 text-center text-sm text-slate-500">
                  No leave applications match these filters.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4 rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Upcoming decisions
              </h3>
              <p className="text-sm text-slate-500">
                Requests waiting on manager or HR approval.
              </p>
            </div>
            <ul className="space-y-3">
              {upcoming.map((request) => (
                <li
                  key={request.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {request.leaveType}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[request.status]}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {request.from} → {request.to} · {request.days} day
                    {request.days > 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{request.note}</p>
                </li>
              ))}
              {upcoming.length === 0 && (
                <li className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  You have no pending requests this year.
                </li>
              )}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
