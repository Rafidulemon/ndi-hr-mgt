const conversations = [
  {
    id: "1",
    participant: "People Ops Squad",
    role: "Private channel",
    lastMessage: "Reminder: calibration packets due by Thursday.",
    timestamp: "2m ago",
    unread: 2,
  },
  {
    id: "2",
    participant: "Leif Anderson",
    role: "Engineering Lead",
    lastMessage: "Shared the updated headcount plan.",
    timestamp: "18m ago",
    unread: 0,
  },
  {
    id: "3",
    participant: "All Company",
    role: "Announcement",
    lastMessage: "Town hall recording is now available.",
    timestamp: "1h ago",
    unread: 0,
  },
];

const threadMessages = [
  {
    id: "m1",
    sender: "People Ops Squad",
    content:
      "We have six reviews this cycle that still need calibration notes. Can you nudge the managers?",
    time: "09:14 AM",
    isSelf: false,
  },
  {
    id: "m2",
    sender: "You",
    content:
      "Yes, sending a reminder in the #leads channel and logging tasks in the tracker.",
    time: "09:16 AM",
    isSelf: true,
  },
  {
    id: "m3",
    sender: "People Ops Squad",
    content:
      "Perfect. Also, we just added a guide for calibrations—feel free to share that link.",
    time: "09:18 AM",
    isSelf: false,
  },
];

export default function HrAdminMessagesPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Messages
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Coordinate decisions, follow up on requests, and keep teams aligned.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="rounded-[32px] border border-white/60 bg-white/90 p-4 shadow-lg dark:border-slate-700/70 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Conversations
          </p>
          <div className="mt-4 space-y-3">
            {conversations.map((conversation, index) => {
              const isActive = index === 0;
              return (
              <button
                key={conversation.id}
                type="button"
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-transparent bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <p className="text-sm font-semibold">{conversation.participant}</p>
                <p className="text-xs">{conversation.role}</p>
                <div
                  className={`mt-2 flex items-center justify-between text-xs ${isActive ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
                >
                  <span
                    className="truncate"
                    title={conversation.lastMessage}
                  >
                    {conversation.lastMessage}
                  </span>
                  <span>{conversation.timestamp}</span>
                </div>
                {conversation.unread > 0 && (
                  <span
                    className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {conversation.unread} unread
                  </span>
                )}
              </button>
            );
            })}
          </div>
        </aside>

        <div className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-lg dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Private channel
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                People Ops Squad
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              6 members
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {threadMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isSelf ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md rounded-3xl px-4 py-3 text-sm ${
                    message.isSelf
                      ? "bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30"
                      : "border border-slate-100 bg-white text-slate-700 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    {message.sender}
                  </p>
                  <p className="mt-1">{message.content}</p>
                  <p
                    className={`mt-2 text-[10px] uppercase tracking-wide ${
                      message.isSelf ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
