const reports = [
  {
    title: "Headcount & Growth",
    description: "Track hiring versus plan by department and location.",
    frequency: "Updated every Monday at 09:00 AM",
    format: "Interactive dashboard",
  },
  {
    title: "Compensation Insights",
    description: "Equity, salary bands, and compa-ratio across job levels.",
    frequency: "Refreshed after each payroll cycle",
    format: "CSV + charts",
  },
  {
    title: "Engagement & Wellbeing",
    description: "Pulse survey scores, participation rate, follow-up actions.",
    frequency: "Realtime tiles",
    format: "Live board",
  },
];

const analyticsHighlights = [
  { label: "Attrition (rolling 12m)", value: "6.5%", sentiment: "Healthy" },
  { label: "Offer acceptance", value: "89%", sentiment: "On watch" },
  { label: "Internal mobility", value: "23%", sentiment: "Record high" },
];

export default function HrAdminReportsPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Reports & Analytics
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Share people insights with leaders without recreating spreadsheets.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {analyticsHighlights.map((item) => (
          <article
            key={item.label}
            className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900/80"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {item.value}
            </p>
            <p className="text-sm text-indigo-600 dark:text-sky-300">
              {item.sentiment}
            </p>
          </article>
        ))}
      </section>

      <section className="space-y-5">
        {reports.map((report) => (
          <article
            key={report.title}
            className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {report.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {report.description}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {report.format}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {report.frequency}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
