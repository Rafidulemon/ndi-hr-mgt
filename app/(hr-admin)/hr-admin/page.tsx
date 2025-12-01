"use client";

import { useMemo } from "react";

import Button from "@/app/components/atoms/buttons/Button";
import { trpc } from "@/trpc/client";
import type {
  HrDashboardAttendanceState,
  HrDashboardResponse,
} from "@/types/hr-dashboard";

type WorkforcePoint = HrDashboardResponse["workforceCapacity"][number];
type WorkforceMetricKey = "plan" | "actual";

type Normalizer = {
  min: number;
  range: number;
};

const attendanceStateStyles: Record<HrDashboardAttendanceState, string> = {
  "on-time":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  late: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  remote: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
  missing: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
};

const numberFormatter = new Intl.NumberFormat("en-US");
const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

const getWorkforceNormalizer = (points: WorkforcePoint[]): Normalizer => {
  if (!points.length) {
    return { min: 0, range: 1 };
  }
  const values = points.flatMap((point) => [point.plan, point.actual]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, range: max - min || 1 };
};

const buildLinePath = (
  points: WorkforcePoint[],
  key: WorkforceMetricKey,
  normalizer: Normalizer,
) =>
  points
    .map((point, index) => {
      if (points.length === 1) {
        return `M0,${50}`;
      }
      const x = (index / (points.length - 1)) * 100;
      const normalized = ((point[key] - normalizer.min) / normalizer.range) * 100;
      const y = 100 - normalized;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

const buildPlotPoints = (
  points: WorkforcePoint[],
  key: WorkforceMetricKey,
  normalizer: Normalizer,
) =>
  points.map((point, index) => {
    const x = points.length <= 1 ? 0 : (index / (points.length - 1)) * 100;
    const normalized = ((point[key] - normalizer.min) / normalizer.range) * 100;
    const y = 100 - normalized;
    return { ...point, x, y, value: point[key] };
  });

const formatFullDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return fullDateFormatter.format(parsed);
};

export default function HrAdminDashboardPage() {
  const queryDate = useMemo(() => new Date().toISOString(), []);

  const dashboardQuery = trpc.hrDashboard.overview.useQuery({
    date: queryDate,
  });

  if (dashboardQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-slate-600">
        <p>We couldn&apos;t load the dashboard summary right now.</p>
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

  const data = dashboardQuery.data;
  const statHighlights = data.statHighlights;
  const attendanceBreakdown = data.attendanceBreakdown;
  const attendanceTrend = data.attendanceTrend;
  const attendanceLog = data.attendanceLog;
  const leaveApprovals = data.leaveApprovals;
  const quickActions = data.quickActions;
  const workforceCapacity = data.workforceCapacity;
  const workforceSignals = data.workforceSignals;
  const engagementGauge = data.engagementGauge;
  const engagementSnapshot = data.engagementSnapshot;
  const teamCapacity = data.teamCapacity;

  const attendanceMax = attendanceTrend.length
    ? Math.max(...attendanceTrend.map((slot) => slot.onsite + slot.remote)) || 1
    : 1;

  const workforcePoints = workforceCapacity.length
    ? workforceCapacity
    : [{ label: "Now", plan: 0, actual: 0 }];
  const workforceNormalizer = getWorkforceNormalizer(workforcePoints);
  const workforceActualPath = buildLinePath(
    workforcePoints,
    "actual",
    workforceNormalizer,
  );
  const workforcePlanPath = buildLinePath(workforcePoints, "plan", workforceNormalizer);
  const workforceActualPoints = buildPlotPoints(
    workforcePoints,
    "actual",
    workforceNormalizer,
  );

  const gaugeAngle = (engagementGauge.value / 100) * 360;
  const todayLabel = formatFullDate(data.date);
  const workforceSubtitle = `${numberFormatter.format(data.coverageSummary.totalEmployees)} teammates tracked`;
  const coverageChangePositive = !data.coverageSummary.changeLabel.startsWith("-");
  const breakdownBase = Math.max(data.coverageSummary.totalEmployees, 1);

  return (
    <div className="space-y-10 pb-12">
      <header className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-xl shadow-indigo-100 transition-colors duration-200 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              HR Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              Mission Control for People Ops
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-300">
              Keep attendance, approvals, and workforce health in one glance so the HR team can act before issues escalate.
            </p>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300">
              <p className="text-xs uppercase text-slate-400">Today</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{todayLabel}</p>
              <p>{workforceSubtitle}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300">
              <p className="text-xs uppercase text-slate-400">Sync status</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {data.coverageSummary.syncedLabel}
              </p>
              <p>{data.coverageSummary.changeLabel}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statHighlights.map((card) => {
          const trendIsPositive = !card.trend.startsWith("-");
          return (
            <article
              key={card.label}
              className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-indigo-100 transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/50"
            >
              <p className="text-xs uppercase text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                {card.value}
              </p>
              <p
                className={`mt-1 text-sm font-semibold ${trendIsPositive ? "text-emerald-500" : "text-rose-500"}`}
              >
                {card.trend}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.descriptor}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Today&rsquo;s Attendance
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                Live coverage overview
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {data.coverageSummary.syncedLabel} · Bio-metric + VPN sources
              </p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-5 py-4 text-right text-sm shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
              <p className="text-xs uppercase text-slate-400">Coverage</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {data.coverageSummary.percentLabel}
              </p>
              <p
                className={`text-xs font-semibold ${coverageChangePositive ? "text-emerald-500" : "text-rose-500"}`}
              >
                {data.coverageSummary.changeLabel}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {attendanceBreakdown.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-100/80 bg-white px-4 py-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
              >
                <p className="text-xs uppercase text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {item.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.delta}</p>
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${item.gradient}`}
                    style={{ width: `${Math.min((item.value / breakdownBase) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Check-ins by hour
              </p>
              <p className="text-xs text-slate-400">On-site vs remote</p>
            </div>
            {attendanceTrend.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
                No check-ins recorded for the selected day.
              </div>
            ) : (
              <div className="mt-4 flex h-48 items-end gap-4">
                {attendanceTrend.map((slot) => (
                  <div key={slot.hour} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-40 w-full flex-col justify-end gap-1 rounded-2xl bg-slate-50 p-2 dark:bg-slate-800/40">
                      <div
                        className="w-full rounded-xl bg-gradient-to-t from-emerald-500 to-emerald-300"
                        style={{ height: `${(slot.onsite / attendanceMax) * 100}%` }}
                      />
                      <div
                        className="w-full rounded-xl bg-gradient-to-t from-sky-500 to-sky-300"
                        style={{ height: `${(slot.remote / attendanceMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {slot.hour}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Today&rsquo;s attendance log
              </h3>
              <p className="text-xs text-slate-400">Showing most recent</p>
            </div>
            {attendanceLog.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
                No attendance events have been logged today yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {attendanceLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100/80 bg-white px-4 py-3 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {entry.name}
                      </p>
                      <p className="text-xs text-slate-500">{entry.department}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${attendanceStateStyles[entry.state]}`}
                      >
                        {entry.status}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {entry.checkIn}
                        </p>
                        <p className="text-xs text-slate-500">{entry.method}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400">Leave queue</p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Employee approvals
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {leaveApprovals.length} leave requests waiting on HR
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-4 py-1 text-xs font-semibold text-indigo-600 dark:bg-slate-800 dark:text-sky-200">
              Prioritize
            </span>
          </div>
          {leaveApprovals.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
              No leave requests require attention right now.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {leaveApprovals.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-slate-100/80 bg-white p-4 text-sm shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {request.name}
                      </p>
                      <p className="text-xs text-slate-500">{request.role}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      {request.type}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-1 gap-3 text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase text-slate-400">Duration</dt>
                      <dd className="font-semibold text-slate-900 dark:text-slate-50">
                        {request.duration}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-400">Balance</dt>
                      <dd className="font-semibold text-slate-900 dark:text-slate-50">
                        {request.balance}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-400">Coverage</dt>
                      <dd>{request.coverage}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-400">Submitted</dt>
                      <dd>{request.submitted}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button className="px-4 py-2 text-xs font-semibold">Approve</Button>
                    <button className="rounded-full border border-slate-200/70 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500">
                      Escalate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
