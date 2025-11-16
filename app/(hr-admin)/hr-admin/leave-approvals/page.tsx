const leaveRequests = [
  {
    name: "Nahia Sultana",
    role: "Product Marketing",
    type: "Vacation",
    duration: "May 10 — May 17",
    handover: "Campaign files to Alex",
    status: "Pending",
  },
  {
    name: "Sameer Rahman",
    role: "Backend Engineer",
    type: "Sick Leave",
    duration: "May 6 — May 8",
    handover: "Code freeze, no handover",
    status: "In Review",
  },
  {
    name: "Rachel Morris",
    role: "Finance Manager",
    type: "Parental Leave",
    duration: "Jun 1 — Aug 30",
    handover: "Budget tracker to Daniel",
    status: "Pending",
  },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  "In Review": "bg-indigo-100 text-indigo-700 dark:bg-sky-500/10 dark:text-sky-200",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
};

export default function HrAdminLeaveApprovalsPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Leave Approvals
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Verify coverage, context, and policy compliance before approving.
        </p>
      </header>

      <section className="space-y-5">
        {leaveRequests.map((request) => (
          <article
            key={request.name}
            className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-indigo-100 transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/50"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {request.role}
                </p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {request.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {request.duration}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {request.type}
              </div>
              <span
                className={`rounded-full px-4 py-1 text-xs font-semibold uppercase ${statusStyles[request.status] ?? ""}`}
              >
                {request.status}
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100/70 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Handover plan
              </p>
              {request.handover}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600"
              >
                Review Calendar
              </button>
              <button
                type="button"
                className="rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-200"
              >
                Approve
              </button>
              <button
                type="button"
                className="rounded-xl border border-rose-200 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-200"
              >
                Request Changes
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
