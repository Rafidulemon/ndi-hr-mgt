import Image from "next/image";
import Text from "../components/atoms/Text/Text";
import { CardWithHeader } from "../components/atoms/frame/CardWithHeader";

const holidayList = [
  { date: "23 Nov, 2024", label: "Labour Thanksgiving Day" },
  { date: "16 Dec, 2024", label: "Victory Day" },
  { date: "25 Dec, 2024", label: "Christmas Day" },
];

const notificationList = [
  { title: "System maintenance in progress", time: "Today, 09:00 AM" },
  { title: "Expense report approved", time: "Yesterday, 06:45 PM" },
  { title: "Team sync rescheduled to Monday", time: "Yesterday, 03:15 PM" },
  { title: "New security guidelines available", time: "2 days ago" },
];

const personalDetails = [
  { label: "Name", value: "Md. Rafidul Islam" },
  { label: "Designation", value: "Software Engineer" },
  { label: "Date of Birth", value: "12 Nov, 1996" },
  { label: "Gender", value: "Male" },
  { label: "Email", value: "example@gmail.com" },
  { label: "Phone", value: "+88011111111" },
  { label: "Local Address", value: "Dhaka, Bangladesh" },
  { label: "Permanent Address", value: "Dhaka, Bangladesh" },
];

const companyDetails = [
  { label: "Employee ID", value: "1324654984" },
  { label: "Department", value: "Frontend" },
  { label: "Joining Date", value: "17 Aug, 2023" },
  { label: "Employment Type", value: "Permanent" },
  { label: "Work Type", value: "Remote" },
  { label: "Reporting Manager", value: "Shahriar Duke" },
  { label: "Corporate Email", value: "example@gmail.com" },
];

const quickStats = [
  { label: "Leave balance", value: "12", helper: "days remaining" },
  { label: "Attendance", value: "98%", helper: "on time this month" },
  { label: "Pending actions", value: "03", helper: "reports & invoices" },
  { label: "Logged overtime", value: "14h", helper: "last 30 days" },
];

const monthSnapshot = [
  { label: "Days worked", value: "18" },
  { label: "Hours logged", value: "144" },
  { label: "Leaves taken", value: "01" },
];

function Index() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-sky-500 to-cyan-400 p-8 text-white shadow-2xl dark:shadow-slate-950/60">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              <div className="relative h-28 w-28 rounded-[32px] border-4 border-white/40 shadow-xl shadow-indigo-300 dark:border-slate-900/60 dark:shadow-slate-950/60">
                <Image
                  src="/dp.png"
                  alt="Profile"
                  fill
                  sizes="(max-width: 768px) 112px, 112px"
                  className="rounded-[28px] object-cover"
                  priority
                />
              </div>
              <div>
                <Text
                  text="Md. Rafidul Islam"
                  className="text-3xl font-semibold text-white"
                />
                <p className="text-sm text-white/70">Software Engineer</p>
                <p className="text-sm text-white/70">
                  Joined on 17 August, 2023
                </p>
              </div>
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-3">
              {monthSnapshot.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/40 bg-white/10 p-4 text-center backdrop-blur dark:border-slate-900/60 dark:bg-slate-900/40"
                >
                  <p className="text-3xl font-semibold text-white">
                    {item.value}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/80">
            <span className="rounded-full border border-white/40 px-4 py-2 dark:border-slate-900/60">
              Working hours · 10:00 AM – 06:00 PM
            </span>
            <span className="rounded-full border border-white/40 px-4 py-2 dark:border-slate-900/60">
              Current project · HR Management
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-xl shadow-indigo-100 backdrop-blur transition-colors duration-200 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stat.helper}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <CardWithHeader
          title="Personal Details"
          titleColor="bg-sky-500"
          className="h-full"
        >
          <div className="grid gap-3">
            {personalDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/60"
              >
                <span className="text-slate-500 dark:text-slate-400">
                  {detail.label}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </CardWithHeader>

        <CardWithHeader
          title="Company Details"
          titleColor="bg-indigo-500"
          className="h-full"
        >
          <div className="grid gap-3">
            {companyDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/60"
              >
                <span className="text-slate-500 dark:text-slate-400">
                  {detail.label}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </CardWithHeader>

        <CardWithHeader
          title="Availability & Notices"
          titleColor="bg-emerald-500"
          className="h-full"
        >
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 px-5 py-6 text-emerald-900 shadow-inner dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-200">
            <p className="text-sm font-semibold uppercase tracking-[0.3em]">
              Notices
            </p>
            <p className="mt-2 text-lg font-semibold">
              {"You're all caught up 🎉"}
            </p>
            <p className="text-sm text-emerald-700">
              No pending announcements for the team.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300">
            <p>Tip: Sync your leave plan with the team to avoid overlaps.</p>
          </div>
        </CardWithHeader>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CardWithHeader title="Upcoming Holidays" titleColor="bg-purple-500">
          <div className="space-y-4">
            {holidayList.map((holiday) => (
              <div
                key={holiday.label}
                className="flex flex-col rounded-2xl border border-white/60 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {holiday.label}
                </p>
                <span className="text-slate-500 dark:text-slate-400">
                  {holiday.date}
                </span>
              </div>
            ))}
          </div>
        </CardWithHeader>

        <CardWithHeader title="Notifications" titleColor="bg-amber-500">
          <div className="space-y-3">
            {notificationList.map((notification) => (
              <div
                key={notification.title}
                className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 text-sm shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300"
              >
                <p className="text-slate-900 dark:text-slate-100">
                  {notification.title}
                </p>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  {notification.time}
                </span>
              </div>
            ))}
          </div>
        </CardWithHeader>
      </section>
    </div>
  );
}

export default Index;
