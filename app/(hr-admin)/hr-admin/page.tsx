import Button from "@/app/components/atoms/buttons/Button";

type AttendanceState = "on-time" | "late" | "remote" | "missing";

type AttendanceLogEntry = {
  name: string;
  department: string;
  checkIn: string;
  status: string;
  method: string;
  state: AttendanceState;
};

type WorkforcePoint = {
  label: string;
  plan: number;
  actual: number;
};

type WorkforceMetricKey = "plan" | "actual";

type Normalizer = {
  min: number;
  range: number;
};

const statHighlights = [
  {
    label: "People Strength",
    value: "128",
    trend: "+5.2%",
    descriptor: "vs last month",
  },
  {
    label: "Attendance Accuracy",
    value: "97.4%",
    trend: "+1.1%",
    descriptor: "synced 5m ago",
  },
  {
    label: "Average Utilization",
    value: "82%",
    trend: "+3 pts",
    descriptor: "target 80%",
  },
  {
    label: "Open Actions",
    value: "23",
    trend: "-4 today",
    descriptor: "HR service desk",
  },
];

const attendanceBreakdown = [
  {
    label: "On-site",
    value: 62,
    delta: "+6 today",
    gradient: "from-emerald-400 to-emerald-500",
  },
  {
    label: "Remote",
    value: 24,
    delta: "+2 vs avg",
    gradient: "from-sky-400 to-blue-500",
  },
  {
    label: "Late",
    value: 9,
    delta: "-3 vs avg",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    label: "Absent",
    value: 5,
    delta: "+1 vs avg",
    gradient: "from-rose-400 to-pink-500",
  },
];

const attendanceTrend = [
  { hour: "9 AM", onsite: 38, remote: 6 },
  { hour: "10 AM", onsite: 57, remote: 9 },
  { hour: "11 AM", onsite: 69, remote: 11 },
  { hour: "12 PM", onsite: 80, remote: 14 },
  { hour: "1 PM", onsite: 77, remote: 15 },
  { hour: "2 PM", onsite: 73, remote: 13 },
];

const attendanceLog: AttendanceLogEntry[] = [
  {
    name: "Anika Rahman",
    department: "Product Design",
    checkIn: "09:02 AM",
    status: "On-site",
    method: "Turnstile · HQ",
    state: "on-time",
  },
  {
    name: "Farhan Amin",
    department: "CX Operations",
    checkIn: "09:37 AM",
    status: "Late",
    method: "Mobile · Mirpur",
    state: "late",
  },
  {
    name: "Lara Siddique",
    department: "People Ops",
    checkIn: "09:15 AM",
    status: "Remote",
    method: "VPN · Chattogram",
    state: "remote",
  },
  {
    name: "David Chowdhury",
    department: "Engineering",
    checkIn: "--",
    status: "Missing",
    method: "Awaiting sync",
    state: "missing",
  },
];

const leaveApprovals = [
  {
    name: "Noor Hasan",
    role: "Finance Specialist",
    type: "Annual Leave",
    duration: "Dec 18 – Dec 22 (5 days)",
    balance: "8 days remaining",
    coverage: "Sabiha covering closing tasks",
    submitted: "Requested 2h ago",
  },
  {
    name: "Sadia Rahim",
    role: "CX Chapter Lead",
    type: "Work From Abroad",
    duration: "Dec 26 – Jan 5 (7 days)",
    balance: "Remote allowance 14 days",
    coverage: "Rafi to shadow queues",
    submitted: "Requested yesterday",
  },
  {
    name: "Ayon Talukdar",
    role: "Engineering Manager",
    type: "Parental Leave",
    duration: "Jan 3 – Jan 24 (15 days)",
    balance: "Full entitlement",
    coverage: "Rotation plan shared",
    submitted: "Requested 3d ago",
  },
];

const quickActions = [
  {
    title: "Push attendance reminder",
    detail: "Ping 9 people without check-in yet.",
    meta: "Due soon",
    cta: "Send Reminder",
  },
  {
    title: "Lock noon attendance",
    detail: "Freeze 12 PM window to avoid edits.",
    meta: "Cutoff in 30m",
    cta: "Lock Window",
  },
  {
    title: "Escalate late pattern",
    detail: "Share CX Ops anomaly with lead.",
    meta: "Insight",
    cta: "Raise Ticket",
  },
];

const workforceCapacity: WorkforcePoint[] = [
  { label: "Jul", plan: 120, actual: 118 },
  { label: "Aug", plan: 121, actual: 121 },
  { label: "Sep", plan: 123, actual: 125 },
  { label: "Oct", plan: 125, actual: 128 },
  { label: "Nov", plan: 127, actual: 131 },
  { label: "Dec", plan: 129, actual: 133 },
];

const workforceSignals = [
  { label: "Backfills ready", value: "6", detail: "Offers signed" },
  { label: "Critical roles", value: "3", detail: ">30 days aging" },
];

const engagementGauge = {
  value: 87,
  change: "+4 pts vs last pulse",
};

const engagementSnapshot = [
  { label: "Listening participation", value: "92%", detail: "Pulse survey" },
  { label: "1:1 coverage", value: "86%", detail: "Rolling 30 days" },
  { label: "Learning completion", value: "64%", detail: "Q4 enablement" },
];

const teamCapacity = [
  { team: "Engineering", committed: 49, available: 52 },
  { team: "Product", committed: 38, available: 40 },
  { team: "CX Operations", committed: 27, available: 28 },
  { team: "People & Culture", committed: 10, available: 12 },
];

const attendanceStateStyles: Record<AttendanceState, string> = {
  "on-time":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  late: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  remote: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
  missing: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
};

const getWorkforceNormalizer = (points: WorkforcePoint[]): Normalizer => {
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
      const x =
        points.length <= 1 ? 0 : (index / (points.length - 1)) * 100;
      const normalized =
        ((point[key] - normalizer.min) / normalizer.range) * 100;
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
    const normalized =
      ((point[key] - normalizer.min) / normalizer.range) * 100;
    const y = 100 - normalized;
    return { ...point, x, y, value: point[key] };
  });

export default function HrAdminDashboardPage() {
  const attendanceMax =
    Math.max(...attendanceTrend.map((slot) => slot.onsite + slot.remote)) || 1;

  const workforceNormalizer = getWorkforceNormalizer(workforceCapacity);
  const workforceActualPath = buildLinePath(
    workforceCapacity,
    "actual",
    workforceNormalizer,
  );
  const workforcePlanPath = buildLinePath(
    workforceCapacity,
    "plan",
    workforceNormalizer,
  );
  const workforceActualPoints = buildPlotPoints(
    workforceCapacity,
    "actual",
    workforceNormalizer,
  );

  const gaugeAngle = (engagementGauge.value / 100) * 360;

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
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Tuesday, 10 Dec
              </p>
              <p>Payroll sprint · Week 2</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300">
              <p className="text-xs uppercase text-slate-400">Next sync</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                2:30 PM
              </p>
              <p>Attendance review</p>
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
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {card.descriptor}
              </p>
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
                Synced 2 minutes ago · Bio-metric + VPN sources
              </p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-5 py-4 text-right text-sm shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
              <p className="text-xs uppercase text-slate-400">Coverage</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                89% of 132
              </p>
              <p className="text-xs text-emerald-500">+4 vs yesterday</p>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.delta}
                </p>
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${item.gradient}`}
                    style={{ width: `${Math.min(item.value, 100)}%` }}
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
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Today&rsquo;s attendance log
              </h3>
              <p className="text-xs text-slate-400">Showing most recent</p>
            </div>
            <div className="mt-4 space-y-3">
              {attendanceLog.map((entry) => (
                <div
                  key={`${entry.name}-${entry.checkIn}`}
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
          <div className="mt-6 space-y-4">
            {leaveApprovals.map((request) => (
              <div
                key={request.name}
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
                  <Button
                    theme="secondary"
                    className="px-4 py-2 text-xs font-semibold"
                  >
                    Ask Manager
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80">
          <div>
            <p className="text-xs uppercase text-slate-400">Quick actions</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Resolve in seconds
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Frequently used HR workflows ready to launch.
            </p>
          </div>
          <div className="mt-6 space-y-5">
            {quickActions.map((action) => (
              <div
                key={action.title}
                className="rounded-2xl border border-slate-100/80 bg-white p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {action.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {action.detail}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase text-slate-400">
                    {action.meta}
                  </span>
                </div>
                <Button className="mt-4 w-full justify-center" theme="primary">
                  {action.cta}
                </Button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-slate-400">Workforce trend</p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Momentum vs hiring plan
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track how actual headcount is pacing against plan.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              Dec release
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-6 dark:border-slate-800/70 dark:bg-slate-900/40">
            <svg viewBox="0 0 100 100" className="h-48 w-full">
              <defs>
                <linearGradient id="actualGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d={workforcePlanPath}
                fill="none"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <path
                d={workforceActualPath}
                fill="none"
                stroke="url(#actualGradient)"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
              {workforceActualPoints.map((point) => (
                <circle
                  key={point.label}
                  cx={point.x}
                  cy={point.y}
                  r={1.5}
                  fill="#38bdf8"
                />
              ))}
            </svg>
            <div className="mt-4 grid grid-cols-6 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {workforceCapacity.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {workforceSignals.map((signal) => (
              <div
                key={signal.label}
                className="rounded-2xl border border-slate-100/80 bg-white px-4 py-3 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
              >
                <p className="text-xs uppercase text-slate-400">{signal.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {signal.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {signal.detail}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400">People pulse</p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Engagement & sentiment
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-200">
              Live
            </span>
          </div>
          <div className="mt-6 flex flex-col items-center">
            <div className="relative h-40 w-40">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from 180deg, #38bdf8 0deg, #38bdf8 ${gaugeAngle}deg, #e2e8f0 ${gaugeAngle}deg, #e2e8f0 360deg)`,
                }}
              />
              <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-950" />
              <div className="absolute inset-4 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-semibold text-slate-900 dark:text-slate-50">
                  {engagementGauge.value}%
                </span>
                <span className="text-xs uppercase text-slate-400">Engagement</span>
                <span className="text-xs font-semibold text-emerald-500">
                  {engagementGauge.change}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {engagementSnapshot.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-slate-100/80 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
              >
                <div>
                  <p className="text-xs uppercase text-slate-400">{item.label}</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {item.detail}
                  </p>
                </div>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/80 lg:col-span-2">
          <div>
            <p className="text-xs uppercase text-slate-400">Relative capacity</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Allocation by team
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compare current commitments against available FTE.
            </p>
          </div>
          <div className="mt-6 space-y-5">
            {teamCapacity.map((team) => {
              const percent = Math.round((team.committed / team.available) * 100);
              return (
                <div key={team.team}>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {team.team}
                    </p>
                    <p className="text-xs text-slate-500">{percent}% utilized</p>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {team.committed} / {team.available} FTE committed
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
