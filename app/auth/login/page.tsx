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
    <AuthLayout
      hero={
        <div
          className={`${authHeroCardClass} flex h-full flex-col items-center justify-between gap-10 text-center`}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-48 w-48 items-center justify-center rounded-full bg-white/15">
              <svg
                viewBox="0 0 120 120"
                className="h-36 w-36 text-cyan-900/20"
                aria-hidden
              >
                <circle cx="60" cy="60" r="50" fill="white" opacity="0.15" />
                <path
                  d="M40 78h40M40 62h40M40 46h24"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle cx="78" cy="46" r="6" fill="white" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold">Stay on top of work</p>
              <p className="text-sm text-white/90">
                Attendance, leave, and payroll in one clean dashboard.
              </p>
            </div>
          </div>
          <Link
            href="/auth/signup"
            className="w-full rounded-full bg-white/90 px-5 py-3 text-center text-sm font-semibold text-cyan-600 hover:bg-white"
          >
            Create an account
          </Link>
        </div>
      }
      form={
        <div className={`${authFormCardClass} flex h-full flex-col gap-8`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              Login
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500">
              Sign in with your company credentials to continue.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Email
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
                Password
              </label>
              <input
                type="password"
                required
                placeholder="password"
                className={authFieldClass}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-500">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Keep me logged in
              </label>
              <Link
                href="/auth/forgot-password"
                className="font-semibold text-cyan-600 hover:text-cyan-500"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              theme="aqua"
              isWidthFull
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-cyan-600 hover:text-cyan-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      }
      cta={{ label: "Sign up", href: "/auth/signup" }}
    />
  );
}
