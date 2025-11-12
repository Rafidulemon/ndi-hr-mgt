"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Button from "../../components/atoms/buttons/Button";

const reassurance = [
  "We only send reset links to verified work emails.",
  "Reset links remain active for 30 minutes.",
  "Need urgent help? Ping security@ndi.hr anytime.",
];

const fieldClass =
  "w-full rounded-2xl border border-white/60 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

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
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] border border-white/30 bg-white/[0.05] p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">
          Security first
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          Reset your access with confidence
        </h2>
        <p className="mt-2 text-sm text-slate-200">
          Your account is protected with device fingerprinting and anomaly
          alerts. Tell us where to send recovery guidance.
        </p>
        <ul className="mt-8 space-y-4 text-sm text-slate-100">
          {reassurance.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.08] p-4"
            >
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-300" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-xs uppercase tracking-[0.35em] text-slate-200">
          Encrypted at rest · MFA enforced · Activity logs monitored 24/7
        </div>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/95 p-8 text-slate-700 shadow-2xl shadow-indigo-100 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Forgot password
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">
          We'll send a secure link
        </h2>
        <p className="text-sm text-slate-500">
          Enter your work email. If it matches a verified account, we’ll send a
          reset link and notify your security contact.
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
          <Button
            type="submit"
            isWidthFull
            disabled={isSubmitting}
            className="mt-2"
          >
            {isSubmitting ? "Sending link..." : "Send reset link"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </p>
      </section>
    </div>
  );
}
