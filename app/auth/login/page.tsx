"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Button from "../../components/atoms/buttons/Button";
import Text from "../../components/atoms/Text/Text";

const loginHighlights = [
  {
    title: "One workspace",
    detail: "Attendance, leave, payroll, and compliance in a single canvas.",
  },
  {
    title: "Realtime awareness",
    detail: "Smart notifications keep your team aligned and proactive.",
  },
  {
    title: "Enterprise level protection",
    detail: "SSO, audit logs, and SOC-ready infrastructure protect your data.",
  },
];

const partnerStats = [
  { label: "Companies onboarded", value: "120+" },
  { label: "Employees served", value: "18k+" },
  { label: "Avg. resolution time", value: "2.4h" },
];

const fieldClass =
  "w-full rounded-2xl border border-white/60 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] border border-white/30 bg-white/[0.05] p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">
          Why teams trust NDI
        </p>
        <Text
          text="Chart every employee journey with clarity."
          className="mt-4 text-3xl font-semibold text-white"
        />
        <p className="mt-2 text-sm text-slate-200">
          Give your people predictable systems, delightful self-serve
          workflows, and timely context so they can focus on meaningful work.
        </p>
        <div className="mt-8 space-y-4">
          {loginHighlights.map((highlight) => (
            <div
              key={highlight.title}
              className="rounded-3xl border border-white/20 bg-white/[0.08] p-4 text-sm text-slate-100"
            >
              <p className="text-base font-semibold text-white">
                {highlight.title}
              </p>
              <p>{highlight.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {partnerStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-center"
            >
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-200">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.35em] text-slate-300">
          SOC2 · ISO 27001 · GDPR Ready
        </p>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/95 p-8 text-slate-700 shadow-2xl shadow-indigo-100 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Sign in
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">
          Welcome back
        </h2>
        <p className="text-sm text-slate-500">
          Access your personalised dashboard and keep your team in sync.
        </p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">
              Work Email
            </label>
            <input
              type="email"
              required
              placeholder="you@yourcompany.com"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              className={fieldClass}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-500">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Keep me signed in
            </label>
            <Link
              href="/auth/forgot-password"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            isWidthFull
            disabled={isSubmitting}
            className="mt-2"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
            or
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>
        <div className="mt-6 space-y-4 text-sm text-slate-500">
          <Button theme="white" isWidthFull>
            Continue with SSO
          </Button>
          <p className="text-center">
            Need an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Create one in minutes
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
