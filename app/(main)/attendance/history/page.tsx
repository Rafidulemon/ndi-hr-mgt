"use client";

import { ReactElement, useMemo, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Table from "../../../components/atoms/tables/Table";
import Pagination from "../../../components/pagination/Pagination";
import { months } from "../../../utils/dateAndMonth";

type AttendanceStatus = "Present" | "Late" | "Half Day" | "Absent";

type AttendanceRecord = {
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  hoursValue: number;
  status: AttendanceStatus;
  note: string;
  monthIndex: number;
  year: number;
};

const attendanceRecords: AttendanceRecord[] = [
  {
    date: "03 Nov 2025",
    day: "Monday",
    checkIn: "09:02",
    checkOut: "17:30",
    hours: "8h 28m",
    hoursValue: 8.46,
    status: "Present",
    note: "HQ stand-up",
    monthIndex: 10,
    year: 2025,
  },
  {
    date: "04 Nov 2025",
    day: "Tuesday",
    checkIn: "09:18",
    checkOut: "17:05",
    hours: "7h 47m",
    hoursValue: 7.78,
    status: "Late",
    note: "Rain delay",
    monthIndex: 10,
    year: 2025,
  },
  {
    date: "05 Nov 2025",
    day: "Wednesday",
    checkIn: "—",
    checkOut: "—",
    hours: "0h",
    hoursValue: 0,
    status: "Absent",
    note: "Approved sick leave",
    monthIndex: 10,
    year: 2025,
  },
  {
    date: "06 Nov 2025",
    day: "Thursday",
    checkIn: "09:05",
    checkOut: "17:40",
    hours: "8h 35m",
    hoursValue: 8.58,
    status: "Present",
    note: "Product sync",
    monthIndex: 10,
    year: 2025,
  },
  {
    date: "08 Nov 2025",
    day: "Saturday",
    checkIn: "09:00",
    checkOut: "13:00",
    hours: "4h",
    hoursValue: 4,
    status: "Half Day",
    note: "Half-day support",
    monthIndex: 10,
    year: 2025,
  },
  {
    date: "10 Nov 2025",
    day: "Monday",
    checkIn: "08:58",
    checkOut: "17:15",
    hours: "8h 17m",
    hoursValue: 8.28,
    status: "Present",
    note: "Field visit",
    monthIndex: 10,
    year: 2025,
  },
  {
    date: "03 Jan 2025",
    day: "Friday",
    checkIn: "09:02",
    checkOut: "17:32",
    hours: "8h 30m",
    hoursValue: 8.5,
    status: "Present",
    note: "Dhaka HQ",
    monthIndex: 0,
    year: 2025,
  },
  {
    date: "04 Jan 2025",
    day: "Saturday",
    checkIn: "09:04",
    checkOut: "17:20",
    hours: "8h 16m",
    hoursValue: 8.3,
    status: "Present",
    note: "Client review call",
    monthIndex: 0,
    year: 2025,
  },
  {
    date: "05 Jan 2025",
    day: "Sunday",
    checkIn: "09:18",
    checkOut: "17:05",
    hours: "7h 47m",
    hoursValue: 7.8,
    status: "Late",
    note: "Traffic delay",
    monthIndex: 0,
    year: 2025,
  },
  {
    date: "08 Jan 2025",
    day: "Wednesday",
    checkIn: "09:00",
    checkOut: "13:00",
    hours: "4h",
    hoursValue: 4,
    status: "Half Day",
    note: "Medical appointment",
    monthIndex: 0,
    year: 2025,
  },
  {
    date: "09 Jan 2025",
    day: "Thursday",
    checkIn: "—",
    checkOut: "—",
    hours: "0h",
    hoursValue: 0,
    status: "Absent",
    note: "Sick leave",
    monthIndex: 0,
    year: 2025,
  },
  {
    date: "02 Feb 2025",
    day: "Sunday",
    checkIn: "08:55",
    checkOut: "17:10",
    hours: "8h 15m",
    hoursValue: 8.25,
    status: "Present",
    note: "Office",
    monthIndex: 1,
    year: 2025,
  },
  {
    date: "05 Feb 2025",
    day: "Wednesday",
    checkIn: "09:12",
    checkOut: "17:02",
    hours: "7h 50m",
    hoursValue: 7.83,
    status: "Late",
    note: "School drop-off",
    monthIndex: 1,
    year: 2025,
  },
  {
    date: "12 Feb 2025",
    day: "Wednesday",
    checkIn: "09:00",
    checkOut: "12:30",
    hours: "3h 30m",
    hoursValue: 3.5,
    status: "Half Day",
    note: "Visa interview",
    monthIndex: 1,
    year: 2025,
  },
  {
    date: "01 Mar 2025",
    day: "Saturday",
    checkIn: "09:03",
    checkOut: "17:41",
    hours: "8h 38m",
    hoursValue: 8.63,
    status: "Present",
    note: "Sprint demo",
    monthIndex: 2,
    year: 2025,
  },
  {
    date: "04 Mar 2025",
    day: "Tuesday",
    checkIn: "09:16",
    checkOut: "17:08",
    hours: "7h 52m",
    hoursValue: 7.86,
    status: "Late",
    note: "Rain delay",
    monthIndex: 2,
    year: 2025,
  },
  {
    date: "07 Mar 2025",
    day: "Friday",
    checkIn: "—",
    checkOut: "—",
    hours: "0h",
    hoursValue: 0,
    status: "Absent",
    note: "Family event",
    monthIndex: 2,
    year: 2025,
  },
];

const headers = [
  "Date",
  "Day",
  "Check-in",
  "Check-out",
  "Working Hours",
  "Status",
];

const statusFilters: Array<AttendanceStatus | "All"> = [
  "All",
  "Present",
  "Late",
  "Half Day",
  "Absent",
];

const statusChipClasses: Record<AttendanceStatus, string> = {
  Present: "bg-emerald-50 text-emerald-600",
  Late: "bg-amber-50 text-amber-600",
  "Half Day": "bg-sky-50 text-sky-600",
  Absent: "bg-rose-50 text-rose-600",
};

export default function AttendanceHistory() {
  const latestRecord = attendanceRecords.reduce<AttendanceRecord | null>(
    (latest, record) => {
      if (!latest) return record;
      if (record.year > latest.year) return record;
      if (record.year === latest.year && record.monthIndex > latest.monthIndex) {
        return record;
      }
      return latest;
    },
    null
  );

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    latestRecord?.monthIndex ?? today.getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    latestRecord?.year ?? today.getFullYear()
  );
  const [selectedStatus, setSelectedStatus] =
    useState<AttendanceStatus | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPageData, setCurrentPageData] = useState<
    Array<Record<string, string | number | ReactElement>>
  >([]);

  const monthRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (record) =>
          record.monthIndex === selectedMonth && record.year === selectedYear
      ),
    [selectedMonth, selectedYear]
  );

  const filteredRecords = useMemo(() => {
    return monthRecords.filter((record) => {
      const matchesStatus =
        selectedStatus === "All" || record.status === selectedStatus;
      const matchesSearch =
        record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.day.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [monthRecords, searchTerm, selectedStatus]);

  const tableRows = useMemo(
    () =>
      filteredRecords.map((record) => ({
        Date: record.date,
        Day: record.day,
        "Check-in": record.checkIn,
        "Check-out": record.checkOut,
        "Working Hours": record.hours,
        Status: (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusChipClasses[record.status]}`}
          >
            {record.status}
          </span>
        ),
      })),
    [filteredRecords]
  );

  const presentDays = monthRecords.filter(
    (record) => record.status === "Present"
  ).length;
  const lateDays = monthRecords.filter(
    (record) => record.status === "Late"
  ).length;
  const halfDays = monthRecords.filter(
    (record) => record.status === "Half Day"
  ).length;
  const absentDays = monthRecords.filter(
    (record) => record.status === "Absent"
  ).length;
  const totalHours = monthRecords.reduce(
    (sum, record) => sum + record.hoursValue,
    0
  );

  const summaryCards = [
    {
      label: "Present days",
      value: `${presentDays} days`,
      helper: "Includes WFH + on-site",
    },
    {
      label: "Late / Half day",
      value: `${lateDays + halfDays} days`,
      helper: "Auto-flagged for managers",
    },
    {
      label: "Absences",
      value: `${absentDays} days`,
      helper: "Includes approved leave",
    },
    {
      label: "Logged hours",
      value: `${totalHours.toFixed(1)} hrs`,
      helper: "Goal · 160 hrs / month",
    },
  ];

  const timelineEntries = monthRecords.slice(0, 6);

  const shiftMonth = (direction: "prev" | "next") => {
    setSelectedMonth((prev) => {
      if (direction === "prev") {
        if (prev === 0) {
          setSelectedYear((year) => year - 1);
          return 11;
        }
        return prev - 1;
      }
      if (prev === 11) {
        setSelectedYear((year) => year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Attendance
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              History & shift log
            </h1>
            <p className="text-sm text-slate-500">
              Monitor check-ins, hours, and exceptions for each month.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <button
              type="button"
              onClick={() => shiftMonth("prev")}
              className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-slate-800"
            >
              <MdKeyboardArrowLeft size={20} />
            </button>
            <span className="text-sm font-semibold text-slate-700">
              {months[selectedMonth]} {selectedYear}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth("next")}
              className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-slate-800"
            >
              <MdKeyboardArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {card.value}
              </p>
              <p className="text-sm text-slate-500">{card.helper}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-1 min-w-[220px] items-center rounded-2xl border border-slate-200 bg-white px-4 py-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by date or weekday"
              className="w-full bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedStatus(filter)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedStatus === filter
                    ? "bg-primary_dark text-white shadow"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-primary_dark/40 hover:text-primary_dark"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
          {filteredRecords.length > 0 ? (
            <>
              <Table
                headers={headers}
                rows={currentPageData}
                isTextCenter={false}
                className="rounded-3xl"
              />
              <Pagination
                key={`${selectedYear}-${selectedMonth}-${selectedStatus}-${searchTerm}`}
                data={tableRows}
                postsPerPage={6}
                setCurrentPageData={setCurrentPageData}
              />
            </>
          ) : (
            <div className="p-10 text-center text-sm text-slate-500">
              No attendance entries match the current filters.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent timeline
            </h2>
            <p className="text-sm text-slate-500">
              Exceptions and highlights for {months[0]}.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            {timelineEntries.length} entries
          </span>
        </div>
        <ul className="mt-6 space-y-3">
          {timelineEntries.map((entry) => (
            <li
              key={`${entry.date}-${entry.day}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {entry.date}
                </p>
                <p className="text-xs text-slate-500">
                  {entry.day} · {entry.note}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusChipClasses[entry.status]}`}
              >
                {entry.status}
              </span>
            </li>
          ))}
          {timelineEntries.length === 0 && (
            <li className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
              No timeline events for this month.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
