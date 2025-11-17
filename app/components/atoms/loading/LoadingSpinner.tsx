'use client';

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
};

export const LoadingSpinner = ({
  label = "Loading...",
  className = "",
}: LoadingSpinnerProps) => (
  <div
    className={`flex flex-col items-center justify-center gap-4 text-center ${className}`}
  >
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-4 border-slate-200/70 dark:border-slate-700/70" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary_dark animate-spin dark:border-t-sky-400" />
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-100 via-white to-transparent blur-xl opacity-70 dark:from-slate-800 dark:via-slate-900" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
        {label}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Please hang tight while we prepare everything for you.
      </p>
    </div>
  </div>
);

export default LoadingSpinner;
