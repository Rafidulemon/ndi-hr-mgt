"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Button from "../../components/atoms/buttons/Button";

const fieldClass =
  "w-full rounded-2xl border border-white/60 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

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
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] border border-white/30 bg-white/[0.05] p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">
          Final step
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          Create a password that’s truly yours
        </h2>
        <p className="mt-2 text-sm text-slate-200">
          Use at least 12 characters, mix upper and lower case letters, add a
          number, and include a symbol. Avoid phrases used elsewhere.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-slate-100">
          <li className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.08] p-4">
            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" />
            Disable password reuse every 90 days.
          </li>
          <li className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.08] p-4">
            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" />
            Store credentials in a secure manager endorsed by your IT team.
          </li>
          <li className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.08] p-4">
            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" />
            Report unusual account activity immediately.
          </li>
        </ul>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/95 p-8 text-slate-700 shadow-2xl shadow-indigo-100 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Reset password
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">
          Secure your account
        </h2>
        <p className="text-sm text-slate-500">
          The reset link is tied to your device. Complete the update within 30
          minutes to keep it valid.
        </p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="Create a new password"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">
              Confirm Password
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter to confirm"
              className={fieldClass}
            />
          </div>
          <Button
            type="submit"
            isWidthFull
            disabled={isSubmitting}
            className="mt-2"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Back to{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            login
          </Link>
        </p>
      </section>
    </div>
  );
}
