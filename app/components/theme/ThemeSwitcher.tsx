'use client';

import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "./ThemeProvider";

type ThemeSwitcherProps = {
  className?: string;
};

export function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const nextThemeLabel = isDark ? "light" : "dark";

  const containerClasses = [
    "group flex w-full items-center gap-4 rounded-3xl border px-4 py-3 text-left transition-all duration-200",
    "border-white/60 bg-white/80 text-slate-700 hover:border-white hover:bg-white/90 hover:shadow-lg",
    "dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconClasses = [
    "flex h-10 w-10 items-center justify-center rounded-2xl text-xl transition-colors duration-200",
    isDark
      ? "bg-slate-800/70 text-sky-300"
      : "bg-indigo-50 text-indigo-500 shadow-inner",
    "dark:bg-slate-800/70 dark:text-sky-300 dark:shadow-none",
  ].join(" ");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Activate ${nextThemeLabel} theme`}
      aria-pressed={isDark}
      className={containerClasses}
    >
      <span className={iconClasses}>{isDark ? <FiMoon /> : <FiSun />}</span>
      <span className="flex flex-1 flex-col">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400 transition-colors duration-150 dark:text-slate-500">
          Theme
        </span>
        <span className="text-sm font-semibold text-slate-900 transition-colors duration-150 dark:text-slate-100">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      </span>
    </button>
  );
}
