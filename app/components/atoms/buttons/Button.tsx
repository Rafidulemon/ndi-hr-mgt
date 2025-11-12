'use client';

import { type ReactNode } from "react";

type ButtonTheme =
  | "primary"
  | "secondary"
  | "cancel"
  | "cancel-secondary"
  | "white";

type Props = {
  children?: ReactNode;
  className?: string;
  theme?: ButtonTheme;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  isWidthFull?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const themeClasses: Record<ButtonTheme, string> = {
  primary:
    "border-transparent bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg hover:shadow-xl focus-visible:outline-indigo-500",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow hover:border-indigo-200 hover:text-indigo-600 focus-visible:outline-indigo-400",
  cancel:
    "border-transparent bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg hover:shadow-xl focus-visible:outline-rose-500",
  "cancel-secondary":
    "border border-rose-200 bg-white text-rose-500 shadow hover:bg-rose-50 focus-visible:outline-rose-400",
  white:
    "border border-white/60 bg-white/80 text-slate-700 shadow hover:-translate-y-0.5 focus-visible:outline-slate-300",
};

function Button({
  children,
  className = "",
  theme = "primary",
  onClick,
  isWidthFull = false,
  type = "button",
  disabled = false,
}: Props) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const widthClass = isWidthFull ? "w-full" : "w-fit";
  const themeClass = themeClasses[theme] ?? themeClasses.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${widthClass} ${baseClasses} ${themeClass} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
