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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/auth/reset-password");
    }, 800);
  };

  return (
    <AuthLayout
      hero={
        <div
          className={`${authHeroCardClass} flex h-full flex-col items-center justify-between gap-12 text-center`}
        >
          <div className="space-y-4">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/15">
              <svg
                viewBox="0 0 80 80"
                className="h-16 w-16"
                fill="none"
                stroke="white"
                strokeWidth="4"
              >
                <rect
                  x="18"
                  y="34"
                  width="44"
                  height="34"
                  rx="6"
                  stroke="white"
                  fill="white"
                  opacity="0.15"
                />
                <path d="M28 34v-8a12 12 0 0 1 24 0v8" />
                <circle cx="40" cy="52" r="4" fill="white" />
                <path d="M40 56v8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-2xl font-semibold">Need a reset?</p>
            <p className="text-sm text-white/90">
              Enter your work email and we will email you a secure link to get
              back into your account.
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
              Forgot password
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Send a recovery link
            </h2>
            <p className="text-sm text-slate-500">
              We only email verified company accounts. The link expires in 30
              minutes.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Work email
              </label>
              <input
                type="email"
                required
                placeholder="company@example.com"
                className={authFieldClass}
              />
            </div>
            <Button
              type="submit"
              theme="aqua"
              isWidthFull
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending link..." : "Email me a link"}
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-cyan-600 hover:text-cyan-500"
            >
              Log back in
            </Link>
          </p>
        </div>
      }
      cta={{ label: "Login", href: "/auth/login" }}
    />
  );
}
