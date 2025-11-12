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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/auth/login");
    }, 800);
  };

  return (
    <AuthLayout
      hero={
        <div
          className={`${authHeroCardClass} flex h-full flex-col items-center justify-between gap-10 text-center`}
        >
          <div className="space-y-4">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/15">
              <svg
                viewBox="0 0 80 80"
                className="h-16 w-16"
                fill="none"
                stroke="white"
                strokeWidth="3"
              >
                <circle cx="40" cy="40" r="30" opacity="0.2" fill="white" />
                <path d="M26 40h28" strokeLinecap="round" />
                <path d="M36 30l-10 10 10 10" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-2xl font-semibold">Set a new password</p>
            <p className="text-sm text-white/90">
              Choose a strong password you do not use elsewhere. We will sign
              out other sessions once this is done.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="w-full rounded-full bg-white/90 px-5 py-3 text-center text-sm font-semibold text-cyan-600 hover:bg-white"
          >
            Go to login
          </Link>
        </div>
      }
      form={
        <div className={`${authFormCardClass} flex h-full flex-col gap-8`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              Reset password
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Secure your account
            </h2>
            <p className="text-sm text-slate-500">
              Passwords must be 12+ characters and include at least one number.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                New password
              </label>
              <input
                type="password"
                required
                placeholder="Create a new password"
                className={authFieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Confirm password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter password"
                className={authFieldClass}
              />
            </div>
            <Button
              type="submit"
              theme="aqua"
              isWidthFull
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500">
            Back to{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-cyan-600 hover:text-cyan-500"
            >
              login
            </Link>
          </p>
        </div>
      }
      cta={{ label: "Login", href: "/auth/login" }}
    />
  );
}
