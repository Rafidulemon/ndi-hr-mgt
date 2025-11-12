"use client";

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-2 text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
            NDI HR Management
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white">
            Securely access your workspace
          </h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Centralize attendance, leave, payroll, and compliance in one place.
            Craft delightful employee experiences backed by dependable tooling.
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}
