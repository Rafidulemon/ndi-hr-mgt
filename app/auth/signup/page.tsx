"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Button from "../../components/atoms/buttons/Button";
import AuthLayout, {
  authFieldClass,
  authFormCardClass,
  authHeroCardClass,
} from "../components/AuthLayout";

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
    <AuthLayout
      flip
      hero={
        <div
          className={`${authHeroCardClass} flex h-full flex-col items-center justify-between gap-12 text-center`}
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Demo Site
            </div>
            <p className="text-3xl font-semibold">Everything HR in one place</p>
            <p className="text-sm text-white/90">
              Collect attendance, track leave balances, and hand payroll off to
              finance with confidence.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="w-full rounded-full bg-white/90 px-5 py-3 text-center text-sm font-semibold text-cyan-600 hover:bg-white"
          >
            Back to login
          </Link>
        </div>
      }
      form={
        <div className={`${authFormCardClass} flex h-full flex-col gap-8`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              Sign up
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Create your workspace
            </h2>
            <p className="text-sm text-slate-500">
              Fill in a few employee details to spin up your HR portal.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Employee ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  className={authFieldClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  placeholder="People Operations"
                  className={authFieldClass}
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  First name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Md. Rafidul"
                  className={authFieldClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Last name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Islam"
                  className={authFieldClass}
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Software Engineer"
                  className={authFieldClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+8801 2345 6789"
                  className={authFieldClass}
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Company email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="company@example.com"
                  className={authFieldClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create a password"
                  className={authFieldClass}
                />
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-semibold text-cyan-600 hover:text-cyan-500"
              >
                Terms & Privacy
              </Link>
              .
            </label>
            <Button
              type="submit"
              theme="aqua"
              isWidthFull
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500">
            Already joined?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-cyan-600 hover:text-cyan-500"
            >
              Login
            </Link>
          </p>
        </div>
      }
      cta={{ label: "Login", href: "/auth/login" }}
    />
  );
}
