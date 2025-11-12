"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Button from "../../components/atoms/buttons/Button";

const cultureNotes = [
  "Collaborate across HR, finance, and leadership from day one.",
  "Offer employees transparent access to their leave, salary, and docs.",
  "Capture approvals with audit-ready workflows and digital traces.",
];

const fieldClass =
  "w-full rounded-2xl border border-white/60 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/auth/verify");
    }, 800);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] border border-white/30 bg-white/[0.05] p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">
          Build a people ops hub
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          Launch in less than a week
        </h2>
        <p className="mt-2 text-sm text-slate-200">
          From onboarding to payroll, create an experience your team will
          champion. NDI HR Management scales with every stage.
        </p>
        <ul className="mt-8 space-y-4 text-sm text-slate-100">
          {cultureNotes.map((note) => (
            <li
              key={note}
              className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.08] p-4"
            >
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              {note}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-sm text-slate-200">
          <p className="text-sm font-semibold text-white">
            “We unified 7 spreadsheets and 4 tools in a single workspace, saving
            15 hours per week.”
          </p>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
            Head of People · Loop Logistics
          </p>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/95 p-8 text-slate-700 shadow-2xl shadow-indigo-100 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Create account
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">
          Start with a 30-day pilot
        </h2>
        <p className="text-sm text-slate-500">
          No credit card required. Invite teammates, automate workflows, and
          export data anytime.
        </p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Md. Rafidul Islam"
                className={fieldClass}
              />
            </div>
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
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">
              Company Name
            </label>
            <input
              type="text"
              required
              placeholder="NDI Technologies"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">
              Team Size
            </label>
            <select className={fieldClass} required defaultValue="">
              <option value="" disabled>
                Select range
              </option>
              <option value="1-50">1-50</option>
              <option value="51-200">51-200</option>
              <option value="201-1000">201-1,000</option>
              <option value="1000+">1,000+</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Create a secure password"
              className={fieldClass}
            />
          </div>
          <label className="flex items-start gap-3 text-xs text-slate-500">
            <input
              type="checkbox"
              required
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-indigo-600">
              Terms & Privacy
            </Link>
            .
          </label>
          <Button
            type="submit"
            isWidthFull
            disabled={isSubmitting}
            className="mt-2"
          >
            {isSubmitting ? "Creating workspace..." : "Create workspace"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already on NDI?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}
