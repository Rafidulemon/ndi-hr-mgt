const notificationSettings = [
  {
    label: "Daily attendance digest",
    description: "Receive a summary of late arrivals and missing check-ins.",
    enabled: true,
  },
  {
    label: "Offer signature alerts",
    description: "Be notified when candidates view or sign their offers.",
    enabled: true,
  },
  {
    label: "Policy change reminders",
    description: "Send yourself a checklist when policies need review.",
    enabled: false,
  },
];

const automationRules = [
  {
    title: "Auto-provision design tools",
    detail: "Figma, Zeplin, Notion",
    status: "Active",
  },
  {
    title: "Security training follow-up",
    detail: "Reminder at 7 & 14 days",
    status: "Active",
  },
  {
    title: "Laptop return workflow",
    detail: "Triggered for departures",
    status: "Paused",
  },
];

const statusStyles: Record<string, string> = {
  Active: "text-emerald-600 dark:text-emerald-300",
  Paused: "text-amber-600 dark:text-amber-300",
};

export default function HrAdminSettingsPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          HR Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Configure notifications, automation, and guardrails for your HR
          surface area.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900/80">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Notification preferences
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose which updates should nudge you instantly.
          </p>

          <div className="mt-6 space-y-5">
            {notificationSettings.map((setting) => (
              <label
                key={setting.label}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100/70 bg-white px-4 py-4 shadow-sm transition hover:border-indigo-200 dark:border-slate-800/70 dark:bg-slate-900/70"
              >
                <input
                  type="checkbox"
                  defaultChecked={setting.enabled}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {setting.label}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {setting.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900/80">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Automation rules
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Consistency without spreadsheets or scattered docs.
          </p>
          <div className="mt-6 space-y-4">
            {automationRules.map((rule) => (
              <div
                key={rule.title}
                className="rounded-2xl border border-slate-100/70 bg-white px-4 py-3 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {rule.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {rule.detail}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${statusStyles[rule.status] ?? ""}`}>
                    {rule.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
