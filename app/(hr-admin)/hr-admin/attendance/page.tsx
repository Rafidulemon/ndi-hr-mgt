"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FiCalendar, FiDownload, FiPlus } from "react-icons/fi";

import CustomDatePicker from "@/app/components/atoms/inputs/DatePicker";

type AttendanceStatus = "On time" | "Late" | "On leave" | "Absent";
type AttendanceLog = {
  id: string;
  employeeId: string;
  name: string;
  squad: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  source?: "Manual" | "System";
};

type ManualFormState = {
  employeeId: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
};

type DaySignal = "ontime" | "late" | "leave" | "absent" | "none";

type LogFilters = {
  query: string;
  status: "all" | AttendanceStatus;
};

const employees = [
  { id: "emp-1", name: "Mahia Ahmed", squad: "Growth" },
  { id: "emp-2", name: "Raul Castro", squad: "Mobile" },
  { id: "emp-3", name: "Sara Islam", squad: "CX" },
  { id: "emp-4", name: "Imran Hossain", squad: "Platform" },
  { id: "emp-5", name: "Farzana Rahman", squad: "People Ops" },
  { id: "emp-6", name: "Noor Hasan", squad: "Design" },
] as const;

const badgeVariant: Record<AttendanceStatus, string> = {
  "On time":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  Late: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  "On leave": "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
  Absent: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
};

const statusColorScale: Record<AttendanceStatus, string> = {
  "On time": "#22c55e",
  Late: "#f97316",
  "On leave": "#38bdf8",
  Absent: "#94a3b8",
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const weeklyTrend = [
  { label: "Mon", present: 92 },
  { label: "Tue", present: 88 },
  { label: "Wed", present: 95 },
  { label: "Thu", present: 90 },
  { label: "Fri", present: 97 },
];

const formatDateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const formatTimeLabel = (value: string) => {
  if (!value) return "—";
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const parseTimeLabelToMinutes = (value: string) => {
  const match = value.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

const calculateWorkingHours = (checkIn: string, checkOut: string) => {
  const start = parseTimeLabelToMinutes(checkIn);
  const end = parseTimeLabelToMinutes(checkOut);

  if (start === null || end === null || end <= start) return "—";

  const diff = end - start;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
};

const buildMonthInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const parseMonthInputValue = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
};

const parseDateKeyToDate = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

const todayRef = new Date();
const startOfToday = new Date(todayRef);
startOfToday.setHours(0, 0, 0, 0);
const startOfCurrentMonth = new Date(todayRef.getFullYear(), todayRef.getMonth(), 1);
const maxMonthValue = buildMonthInputValue(todayRef);

const attendanceHistory: Record<string, AttendanceLog[]> = {
  [formatDateKey(todayRef)]: [
    {
      id: "t-1",
      employeeId: "emp-1",
      name: "Mahia Ahmed",
      squad: "Growth",
      checkIn: "09:01 AM",
      checkOut: "—",
      status: "Late",
    },
    {
      id: "t-2",
      employeeId: "emp-2",
      name: "Raul Castro",
      squad: "Mobile",
      checkIn: "08:45 AM",
      checkOut: "—",
      status: "On time",
    },
    {
      id: "t-3",
      employeeId: "emp-3",
      name: "Sara Islam",
      squad: "CX",
      checkIn: "—",
      checkOut: "—",
      status: "On leave",
    },
    {
      id: "t-4",
      employeeId: "emp-4",
      name: "Imran Hossain",
      squad: "Platform",
      checkIn: "10:02 AM",
      checkOut: "—",
      status: "Late",
    },
    {
      id: "t-5",
      employeeId: "emp-5",
      name: "Farzana Rahman",
      squad: "People Ops",
      checkIn: "08:58 AM",
      checkOut: "—",
      status: "On time",
    },
    {
      id: "t-6",
      employeeId: "emp-6",
      name: "Noor Hasan",
      squad: "Design",
      checkIn: "—",
      checkOut: "—",
      status: "Absent",
    },
  ],
  [formatDateKey(new Date(todayRef.getFullYear(), todayRef.getMonth(), todayRef.getDate() - 1))]: [
    {
      id: "y-1",
      employeeId: "emp-1",
      name: "Mahia Ahmed",
      squad: "Growth",
      checkIn: "08:57 AM",
      checkOut: "05:08 PM",
      status: "On time",
    },
    {
      id: "y-2",
      employeeId: "emp-2",
      name: "Raul Castro",
      squad: "Mobile",
      checkIn: "09:10 AM",
      checkOut: "05:45 PM",
      status: "Late",
    },
    {
      id: "y-3",
      employeeId: "emp-3",
      name: "Sara Islam",
      squad: "CX",
      checkIn: "—",
      checkOut: "—",
      status: "On leave",
    },
    {
      id: "y-4",
      employeeId: "emp-4",
      name: "Imran Hossain",
      squad: "Platform",
      checkIn: "09:05 AM",
      checkOut: "—",
      status: "Late",
    },
    {
      id: "y-5",
      employeeId: "emp-5",
      name: "Farzana Rahman",
      squad: "People Ops",
      checkIn: "08:51 AM",
      checkOut: "05:05 PM",
      status: "On time",
    },
  ],
  [formatDateKey(new Date(todayRef.getFullYear(), todayRef.getMonth(), todayRef.getDate() - 2))]: [
    {
      id: "td2-1",
      employeeId: "emp-1",
      name: "Mahia Ahmed",
      squad: "Growth",
      checkIn: "08:49 AM",
      checkOut: "05:10 PM",
      status: "On time",
    },
    {
      id: "td2-2",
      employeeId: "emp-2",
      name: "Raul Castro",
      squad: "Mobile",
      checkIn: "08:44 AM",
      checkOut: "05:30 PM",
      status: "On time",
    },
    {
      id: "td2-3",
      employeeId: "emp-4",
      name: "Imran Hossain",
      squad: "Platform",
      checkIn: "09:30 AM",
      checkOut: "06:05 PM",
      status: "Late",
    },
    {
      id: "td2-4",
      employeeId: "emp-6",
      name: "Noor Hasan",
      squad: "Design",
      checkIn: "—",
      checkOut: "—",
      status: "Absent",
    },
  ],
  [formatDateKey(new Date(todayRef.getFullYear(), todayRef.getMonth(), todayRef.getDate() - 5))]: [
    {
      id: "lw-1",
      employeeId: "emp-1",
      name: "Mahia Ahmed",
      squad: "Growth",
      checkIn: "08:52 AM",
      checkOut: "05:00 PM",
      status: "On time",
    },
    {
      id: "lw-2",
      employeeId: "emp-3",
      name: "Sara Islam",
      squad: "CX",
      checkIn: "—",
      checkOut: "—",
      status: "On leave",
    },
    {
      id: "lw-3",
      employeeId: "emp-5",
      name: "Farzana Rahman",
      squad: "People Ops",
      checkIn: "09:12 AM",
      checkOut: "05:36 PM",
      status: "Late",
    },
  ],
};

const calendarSignalColor: Record<Exclude<DaySignal, "none">, string> = {
  ontime: "bg-emerald-400",
  late: "bg-amber-400",
  leave: "bg-sky-400",
  absent: "bg-rose-400",
};

const escapeForCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

const buildCalendarCells = (
  referenceDate: Date,
  manualEntries: Record<string, AttendanceLog[]>
) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ date: Date | null; key: string | null; signal: DaySignal }> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ date: null, key: null, signal: "none" });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateInstance = new Date(year, month, day);
    const key = formatDateKey(dateInstance);
    cells.push({ date: dateInstance, key, signal: getDaySignal(key, manualEntries) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: null, signal: "none" });
  }

  return cells;
};

const getDaySignal = (
  dateKey: string | null,
  manualEntries: Record<string, AttendanceLog[]>
): DaySignal => {
  if (!dateKey) return "none";
  const baseLogs = attendanceHistory[dateKey] ?? [];
  const manualLogs = manualEntries[dateKey] ?? [];
  const logs = [...baseLogs, ...manualLogs];

  if (!logs.length) return "none";
  if (logs.some((log) => log.status === "Absent")) return "absent";
  if (logs.some((log) => log.status === "Late")) return "late";
  if (logs.some((log) => log.status === "On leave")) return "leave";
  return "ontime";
};

const isFutureDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime() > startOfToday.getTime();
};

export default function HrAdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(todayRef);
  const [manualDate, setManualDate] = useState<Date>(todayRef);
  const [manualEntries, setManualEntries] = useState<Record<string, AttendanceLog[]>>({});
  const [manualForm, setManualForm] = useState<ManualFormState>({
    employeeId: employees[0]?.id ?? "",
    checkIn: "",
    checkOut: "",
    status: "On time",
  });
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [logFilters, setLogFilters] = useState<LogFilters>({ query: "", status: "all" });
  const [historyEmployeeId, setHistoryEmployeeId] = useState<string>(employees[0]?.id ?? "");
  const [historyMonth, setHistoryMonth] = useState<Date>(startOfCurrentMonth);

  useEffect(() => {
    if (!formFeedback) return undefined;
    const timeoutId = window.setTimeout(() => setFormFeedback(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [formFeedback]);

  const combinedHistory = useMemo(() => {
    const mergedKeys = new Set([
      ...Object.keys(attendanceHistory),
      ...Object.keys(manualEntries),
    ]);
    const result: Record<string, AttendanceLog[]> = {};

    mergedKeys.forEach((key) => {
      result[key] = [...(attendanceHistory[key] ?? []), ...(manualEntries[key] ?? [])];
    });

    return result;
  }, [manualEntries]);

  const selectedDayKey = formatDateKey(selectedDate);

  const dayLogs = useMemo(() => {
    const baseLogs = attendanceHistory[selectedDayKey] ?? [];
    const manualForDay = manualEntries[selectedDayKey] ?? [];
    return [...baseLogs, ...manualForDay].sort((a, b) => a.name.localeCompare(b.name));
  }, [manualEntries, selectedDayKey]);

  const filteredDayLogs = useMemo(() => {
    return dayLogs.filter((log) => {
      const matchesQuery = log.name.toLowerCase().includes(logFilters.query.toLowerCase()) ||
        log.squad.toLowerCase().includes(logFilters.query.toLowerCase());
      const matchesStatus =
        logFilters.status === "all" ? true : log.status === logFilters.status;
      return matchesQuery && matchesStatus;
    });
  }, [dayLogs, logFilters]);

  const statusStats = useMemo(() => {
    const template: Record<AttendanceStatus, number> = {
      "On time": 0,
      Late: 0,
      "On leave": 0,
      Absent: 0,
    };

    dayLogs.forEach((log) => {
      template[log.status] += 1;
    });

    return template;
  }, [dayLogs]);

  const totalLogs = dayLogs.length;
  const onTimeRate = totalLogs
    ? Math.round((statusStats["On time"] / totalLogs) * 100)
    : 0;

  const summaryCards = useMemo(
    () => [
      {
        label: "On-time arrivals",
        value: `${onTimeRate}%`,
        detail: `${statusStats["On time"]} of ${totalLogs || 0} employees`,
      },
      {
        label: "Late check-ins",
        value: statusStats.Late.toString(),
        detail: statusStats.Late ? "Flagged for coaching" : "None today",
      },
      {
        label: "On leave",
        value: statusStats["On leave"].toString(),
        detail: "Approved PTO",
      },
      {
        label: "Manual updates",
        value: (manualEntries[selectedDayKey]?.length ?? 0).toString(),
        detail: "Adjustments for this day",
      },
    ],
    [manualEntries, onTimeRate, selectedDayKey, statusStats, totalLogs]
  );

  const statusBreakdown = useMemo(
    () =>
      (Object.keys(statusStats) as AttendanceStatus[]).map((key) => ({
        label: key,
        value: statusStats[key],
        color: statusColorScale[key],
      })),
    [statusStats]
  );

  const statusChartBackground = useMemo(() => {
    const total = statusBreakdown.reduce((acc, entry) => acc + entry.value, 0);
    if (!total) {
      return "conic-gradient(#e2e8f0 0deg 360deg)";
    }

    let currentAngle = 0;
    const segments: string[] = [];

    statusBreakdown.forEach((segment) => {
      if (!segment.value) return;
      const angle = (segment.value / total) * 360;
      segments.push(
        `${segment.color} ${currentAngle}deg ${currentAngle + angle}deg`
      );
      currentAngle += angle;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [statusBreakdown]);

  const calendarCells = useMemo(
    () => buildCalendarCells(selectedDate, manualEntries),
    [manualEntries, selectedDate]
  );

  const selectedDateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const trendMax =
    weeklyTrend.reduce((max, entry) => Math.max(max, entry.present), 0) || 1;
  const trendSteps = Math.max(weeklyTrend.length - 1, 1);
  const trendPoints = weeklyTrend.map((entry, index) => {
    const x = (index / trendSteps) * 100;
    const y = 100 - (entry.present / trendMax) * 100;
    return `${x},${y}`;
  });
  const areaPathD = `M0,100 ${trendPoints.join(" ")} L100,100 Z`;
  const polylinePoints = trendPoints.join(" ");

  const historyMonthLabel = historyMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const monthlyHistoryRows = useMemo(() => {
    const targetMonth = historyMonth.getMonth();
    const targetYear = historyMonth.getFullYear();

    const rows: Array<{
      date: Date;
      checkIn: string;
      checkOut: string;
      status: AttendanceStatus;
      source: string;
      workingHours: string;
    }> = [];

    Object.entries(combinedHistory).forEach(([dateKey, logs]) => {
      const date = parseDateKeyToDate(dateKey);
      if (date.getMonth() !== targetMonth || date.getFullYear() !== targetYear) {
        return;
      }

      const manualRecord = logs.find(
        (log) => log.employeeId === historyEmployeeId && log.source === "Manual"
      );
      const systemRecord = logs.find(
        (log) => log.employeeId === historyEmployeeId && log.source !== "Manual"
      );
      const record = manualRecord ?? systemRecord;

      if (!record) return;

      rows.push({
        date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        source: record.source ?? "System",
        workingHours: calculateWorkingHours(record.checkIn, record.checkOut),
      });
    });

    return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [combinedHistory, historyEmployeeId, historyMonth]);

  const updateSelectedDate = (date: Date) => {
    setSelectedDate(date);
    setManualDate(date);
  };

  const handleSelectedDateChange = (date: Date | null) => {
    if (date && !isFutureDate(date)) {
      updateSelectedDate(date);
    }
  };

  const handleManualDateChange = (date: Date | null) => {
    if (date && !isFutureDate(date)) {
      setManualDate(date);
    }
  };

  const handleManualSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manualForm.employeeId || !manualDate) return;

    const employee = employees.find((emp) => emp.id === manualForm.employeeId);
    if (!employee) return;

    const dateKey = formatDateKey(manualDate);
    const newLog: AttendanceLog = {
      id: `manual-${dateKey}-${Date.now()}`,
      employeeId: manualForm.employeeId,
      name: employee.name,
      squad: employee.squad,
      checkIn: formatTimeLabel(manualForm.checkIn),
      checkOut: formatTimeLabel(manualForm.checkOut),
      status: manualForm.status,
      source: "Manual",
    };

    setManualEntries((previous) => ({
      ...previous,
      [dateKey]: [...(previous[dateKey] ?? []), newLog],
    }));

    setManualForm((prev) => ({ ...prev, checkIn: "", checkOut: "", status: "On time" }));
    setFormFeedback(`Manual attendance saved for ${employee.name}.`);
  };

  const handleExport = () => {
    if (!filteredDayLogs.length) return;

    const rows = [
      [
        "Name",
        "Squad",
        "Check-in",
        "Check-out",
        "Total working hour",
        "Status",
        "Source",
      ],
      ...filteredDayLogs.map((log) => [
        log.name,
        log.squad,
        log.checkIn,
        log.checkOut,
        calculateWorkingHours(log.checkIn, log.checkOut),
        log.status,
        log.source ?? "System",
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeForCsv).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${selectedDayKey}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMonthlyExport = () => {
    if (!monthlyHistoryRows.length) return;

    const employee = employees.find((emp) => emp.id === historyEmployeeId);
    const rows = [
      ["Date", "Check-in", "Check-out", "Total working hour", "Status", "Source"],
      ...monthlyHistoryRows.map((row) => [
        row.date.toLocaleDateString(),
        row.checkIn,
        row.checkOut,
        row.workingHours,
        row.status,
        row.source,
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeForCsv).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${employee?.name ?? "employee"}-${buildMonthInputValue(
      historyMonth
    )}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              HR admin • Attendance
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              Attendance operations overview
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Monitor daily check-ins, make manual corrections, explore history, and export what you need.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <FiCalendar className="text-slate-500" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Viewing</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedDateLabel}
                </p>
              </div>
            </div>
            <CustomDatePicker
              label=""
              value={selectedDate}
              onChange={handleSelectedDateChange}
              className="sm:min-w-[220px]"
            />
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900/80"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {card.value}
            </p>
            <p className="text-sm text-slate-400">{card.detail}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Attendance log
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {filteredDayLogs.length} of {dayLogs.length} records for {selectedDateLabel}.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={!filteredDayLogs.length}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200"
            >
              <FiDownload />
              Export Excel
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-400">
              Search
              <input
                type="text"
                value={logFilters.query}
                placeholder="Name or squad"
                onChange={(event) =>
                  setLogFilters((prev) => ({ ...prev, query: event.target.value }))
                }
                className="mt-2 h-[44px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status filter
              <select
                value={logFilters.status}
                onChange={(event) =>
                  setLogFilters((prev) => ({
                    ...prev,
                    status: event.target.value as LogFilters["status"],
                  }))
                }
                className="mt-2 h-[44px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="all">All statuses</option>
                <option value="On time">On time</option>
                <option value="Late">Late</option>
                <option value="On leave">On leave</option>
                <option value="Absent">Absent</option>
              </select>
            </label>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Squad</th>
                  <th className="px-4 py-3 font-semibold">Check-in</th>
                  <th className="px-4 py-3 font-semibold">Check-out</th>
                  <th className="px-4 py-3 font-semibold">Total working hour</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDayLogs.length ? (
                  filteredDayLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-slate-100 text-slate-700 transition hover:bg-slate-50/70 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60"
                    >
                      <td className="px-4 py-4 font-semibold">
                        <div className="flex items-center gap-2">
                          {log.name}
                          {log.source === "Manual" && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:bg-amber-500/10 dark:text-amber-200">
                              Manual
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">{log.squad}</td>
                      <td className="px-4 py-4">{log.checkIn}</td>
                      <td className="px-4 py-4">{log.checkOut}</td>
                      <td className="px-4 py-4">
                        {calculateWorkingHours(log.checkIn, log.checkOut)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeVariant[log.status]}`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      {dayLogs.length
                        ? "No records match the current filters."
                        : "No attendance data for this date yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Attendance calendar
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tap a date to quickly load its log.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              {weekdayLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, index) => {
                if (!cell.date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-14 rounded-2xl border border-transparent"
                    />
                  );
                }

                const isSelected = formatDateKey(cell.date) === selectedDayKey;
                const future = isFutureDate(cell.date);

                return (
                  <button
                    type="button"
                    key={cell.key}
                    onClick={() => {
                      if (!future && cell.date) {
                        updateSelectedDate(cell.date);
                      }
                    }}
                    disabled={future}
                    className={`flex h-14 flex-col items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                      future
                        ? "cursor-not-allowed border-dashed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-600"
                        : isSelected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-200"
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200"
                    }`}
                  >
                    {cell.date.getDate()}
                    {!future && cell.signal !== "none" && (
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${calendarSignalColor[cell.signal]}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Charts & insights
            </h3>
            <div className="mt-4 space-y-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                    Status breakdown
                  </p>
                  <div className="mt-3 flex items-center gap-6">
                    <div
                      className="h-32 w-32 rounded-full border border-slate-100 shadow-inner dark:border-slate-700"
                      style={{ background: statusChartBackground }}
                    >
                      <div className="m-3 flex h-20 w-20 items-center justify-center rounded-full bg-white text-center text-xs font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                        {totalLogs ? `${onTimeRate}% on-time` : "No data"}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {statusBreakdown.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.label}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                    Weekly reliability
                  </p>
                  <div className="mt-3 rounded-2xl border border-slate-100 bg-gradient-to-b from-indigo-50 via-white to-white p-4 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-32 w-full">
                      <defs>
                        <linearGradient id="attendanceTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPathD} fill="url(#attendanceTrend)" stroke="none" />
                      <polyline
                        points={polylinePoints}
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-2 grid grid-cols-5 gap-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-300">
                      {weeklyTrend.map((entry) => (
                        <div key={entry.label}>
                          <p>{entry.label}</p>
                          <p className="text-sm text-slate-900 dark:text-slate-100">
                            {entry.present}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Monthly employee history
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review an individual&apos;s attendance for {historyMonthLabel} and download the report.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMonthlyExport}
            disabled={!monthlyHistoryRows.length}
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200"
          >
            <FiDownload />
            Export Excel
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-400">
            Employee
            <select
              value={historyEmployeeId}
              onChange={(event) => setHistoryEmployeeId(event.target.value)}
              className="mt-2 h-[46px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} — {employee.squad}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-400">
            Month
            <input
              type="month"
              max={maxMonthValue}
              value={buildMonthInputValue(historyMonth)}
              onChange={(event) => {
                const parsed = parseMonthInputValue(event.target.value);
                if (parsed && !isFutureDate(parsed)) {
                  setHistoryMonth(parsed);
                }
              }}
              className="mt-2 h-[46px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Check-in</th>
                <th className="px-4 py-3 font-semibold">Check-out</th>
                <th className="px-4 py-3 font-semibold">Total working hour</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              {monthlyHistoryRows.length ? (
                monthlyHistoryRows.map((row) => (
                  <tr
                    key={row.date.toISOString()}
                    className="border-t border-slate-100 text-slate-700 transition hover:bg-slate-50/70 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-4 font-semibold">
                      {row.date.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4">{row.checkIn}</td>
                    <td className="px-4 py-4">{row.checkOut}</td>
                    <td className="px-4 py-4">{row.workingHours}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeVariant[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">{row.source}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No records for this employee in {historyMonthLabel} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Manual attendance entry
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Log a check-in manually when an employee misses or needs a correction.
            </p>
          </div>
          {formFeedback && (
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              {formFeedback}
            </span>
          )}
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={handleManualSubmit}>
          <label className="flex flex-col text-sm font-semibold text-slate-600 dark:text-slate-300">
            Employee
            <select
              className="mt-2 h-[46px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={manualForm.employeeId}
              onChange={(event) =>
                setManualForm((prev) => ({ ...prev, employeeId: event.target.value }))
              }
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} — {employee.squad}
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2 lg:col-span-1">
            <CustomDatePicker
              label="Date"
              value={manualDate}
              onChange={handleManualDateChange}
            />
          </div>

          <label className="flex flex-col text-sm font-semibold text-slate-600 dark:text-slate-300">
            Check-in
            <input
              type="time"
              value={manualForm.checkIn}
              onChange={(event) =>
                setManualForm((prev) => ({ ...prev, checkIn: event.target.value }))
              }
              className="mt-2 h-[46px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-slate-600 dark:text-slate-300">
            Check-out
            <input
              type="time"
              value={manualForm.checkOut}
              onChange={(event) =>
                setManualForm((prev) => ({ ...prev, checkOut: event.target.value }))
              }
              className="mt-2 h-[46px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-slate-600 dark:text-slate-300">
            Status
            <select
              className="mt-2 h-[46px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={manualForm.status}
              onChange={(event) =>
                setManualForm((prev) => ({
                  ...prev,
                  status: event.target.value as AttendanceStatus,
                }))
              }
            >
              <option value="On time">On time</option>
              <option value="Late">Late</option>
              <option value="On leave">On leave</option>
              <option value="Absent">Absent</option>
            </select>
          </label>

          <div className="md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <FiPlus />
              Save manual attendance
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
