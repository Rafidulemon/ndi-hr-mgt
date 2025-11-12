"use client";

import Link from "next/link";
import { ReactNode } from "react";

const navLinks = [
  { label: "Support", href: "/support" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

type AuthLayoutProps = {
  hero: ReactNode;
  form: ReactNode;
  flip?: boolean;
  cta?: { label: string; href: string };
};

export const authFieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500";

export const authFormCardClass =
  "h-full rounded-[32px] bg-slate-50 px-8 py-10 text-slate-800";

export const authHeroCardClass =
  "h-full rounded-[32px] bg-gradient-to-b from-cyan-400 to-cyan-500 px-8 py-10 text-white";

export default function AuthLayout({
  hero,
  form,
  flip = false,
  cta = { label: "Sign up", href: "/auth/signup" },
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-4 shadow">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-800"
          >
            <span className="rounded-xl bg-cyan-500 px-3 py-1 text-sm font-bold text-white">
              NDI
            </span>
            HR Management
          </Link>
          <div className="flex flex-1 items-center justify-end gap-4 text-sm font-semibold text-slate-500">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-cyan-600"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={cta.href}
              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
            >
              {cta.label}
            </Link>
          </div>
        </header>
        <div className="grid gap-0 overflow-hidden rounded-[32px] bg-white shadow-xl md:grid-cols-2">
          <section
            className={`order-1 border-r border-slate-100 ${
              flip ? "md:order-2" : ""
            }`}
          >
            {form}
          </section>
          <section
            className={`order-2 border-slate-100 ${
              flip ? "md:order-1 md:border-r" : ""
            }`}
          >
            {hero}
          </section>
        </div>
      </div>
    </div>
  );
}
