'use client';

type DashboardLoadingIndicatorProps = {
  label?: string;
  helper?: string;
  fullscreen?: boolean;
  subtle?: boolean;
};

const pulseRing =
  "absolute inset-0 rounded-full border-2 border-indigo-400/60 animate-[ping_2s_linear_infinite]";

export const DashboardLoadingIndicator = ({
  label = "Loading your dashboard...",
  helper = "Crunching attendance, leave, and notifications in one place.",
  fullscreen = false,
  subtle = false,
}: DashboardLoadingIndicatorProps) => {
  const containerClass = fullscreen
    ? "min-h-screen"
    : "min-h-[160px] rounded-3xl border border-white/70 bg-white/80 shadow-xl dark:border-slate-700/70 dark:bg-slate-900/70";

  return (
    <div
      className={`flex items-center justify-center px-6 py-8 text-center ${
        subtle ? "bg-transparent" : "bg-slate-50/80 dark:bg-slate-950/80"
      } ${containerClass}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-sky-400 to-cyan-300 opacity-70 blur-2xl" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-2xl shadow-indigo-500/40 dark:shadow-slate-950/70">
            <div className="h-3 w-3 rounded-full bg-white shadow" />
          </div>
          <span className={`${pulseRing} delay-100`} />
          <span className={`${pulseRing} delay-300 border-sky-300/50`} />
          <span className={`${pulseRing} delay-500 border-cyan-200/40`} />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-white/70" />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-50">
            {label}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{helper}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoadingIndicator;
