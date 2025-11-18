"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import AuthLayout from "../_components/AuthLayout";
import Button from "../../../components/atoms/buttons/Button";
import PasswordInput from "../../../components/atoms/inputs/PasswordInput";
import Text from "../../../components/atoms/Text/Text";
import { trpc } from "@/trpc/client";

const schema = z
  .object({
    password: z
      .string()
      .nonempty({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .nonempty({ message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const resetToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const tokenValidationQuery = trpc.auth.tokenValidate.useQuery(
    { token: resetToken },
    { enabled: Boolean(resetToken) },
  );
  const updatePasswordMutation = trpc.auth.updateUserPassword.useMutation({
    onSuccess: () => {
      setServerError(null);
      setServerMessage("Password updated successfully. Please sign in.");
      router.push("/auth/login");
    },
    onError: (error) => {
      setServerMessage(null);
      setServerError(error.message || "Unable to reset the password.");
    },
  });

  const handleSignUpButton = () => {
    router.push("/auth/signup");
  };

  const handleLogin = (data: FormData) => {
    if (!resetToken) {
      setServerError("Reset token missing. Please use the link from your email.");
      return;
    }

    const userId = tokenValidationQuery.data?.userId;
    if (!userId) {
      setServerError("Reset link is invalid or has expired.");
      return;
    }

    setServerError(null);
    setServerMessage(null);
    updatePasswordMutation.mutate({
      userId,
      password: data.password,
    });
  };

  return (
    <AuthLayout
      title="Set a fresh password"
      subtitle="Choose a new password to finish securing your account."
      description="Make it unique. We recommend combining upper & lowercase letters, numbers, and special characters."
      helper="Tip: Avoid using previous passwords from NDI HR or other apps. We'll let you know if your new password meets our security requirements."
      badge="Recovery portal"
      footer={
        <p className="text-sm">
          Ready to jump back in?
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="ml-2 font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Go to login
          </button>
        </p>
      }
      showcase={{
        footer: (
          <Button onClick={handleSignUpButton} theme="white" isWidthFull>
            <Text text="Invite a teammate" className="text-[15px] font-semibold" />
          </Button>
        ),
      }}
    >
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
        <PasswordInput
          name="password"
          error={errors?.password}
          register={register}
          label="New password"
          placeholder="Min. 8 characters"
          isRequired
        />
        <PasswordInput
          name="confirmPassword"
          error={errors?.confirmPassword}
          register={register}
          label="Confirm new password"
          placeholder="Re-enter password"
          isRequired
        />

        <ul className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          <li>At least 8 characters</li>
          <li>Include a number or symbol</li>
          <li>Avoid reusing old passwords</li>
        </ul>
        {!resetToken ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            Missing reset token. Please open this page using the link you received in your email.
          </p>
        ) : null}
        {tokenValidationQuery.isLoading ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200">
            Validating reset link...
          </p>
        ) : null}
        {tokenValidationQuery.error ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            {tokenValidationQuery.error.message || "Reset link is invalid or has expired."}
          </p>
        ) : null}
        {serverError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {serverError}
          </p>
        ) : null}
        {serverMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
            {serverMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          theme="primary"
          isWidthFull
          disabled={!resetToken || updatePasswordMutation.isPending}
        >
          <Text
            text={updatePasswordMutation.isPending ? "Updating password..." : "Update password"}
            className="text-[16px] font-semibold"
          />
        </Button>
      </form>
    </AuthLayout>
  );
}
