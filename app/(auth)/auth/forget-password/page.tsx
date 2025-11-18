"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthLayout from "../_components/AuthLayout";
import Button from "../../../components/atoms/buttons/Button";
import EmailInput from "../../../components/atoms/inputs/EmailInput";
import Text from "../../../components/atoms/Text/Text";
import { trpc } from "@/trpc/client";

const schema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Enter a valid email address" }),
});

type FormData = z.infer<typeof schema>;

function ForgetPasswordPage() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const sendLinkMutation = trpc.auth.sendUserResetPasswordLink.useMutation({
    onSuccess: () => {
      setServerError(null);
      setServerMessage("If that account exists, a reset link is on the way.");
    },
    onError: (error) => {
      setServerMessage(null);
      setServerError(error.message || "Unable to process the request.");
    },
  });

  const handleSignUpButton = () => {
    router.push("/auth/signup");
  };

  const handleLoginButton = () => {
    router.push("/auth/login");
  };

  const handleSubmitForm = (data: FormData) => {
    setServerMessage(null);
    setServerError(null);
    sendLinkMutation.mutate({ email: data.email });
  };

  return (
    <AuthLayout
      title="Need a reset link?"
      subtitle="We’ll send a secure password reset link to your inbox."
      description="For security purposes, reset links expire after 30 minutes. If you don’t see the email, remember to check spam."
      helper="Enter the email associated with your workspace account. We’ll confirm your identity before you can pick a new password."
      badge="Recovery portal"
      footer={
        <p className="text-sm">
          Remembered your password?
          <button
            type="button"
            onClick={handleLoginButton}
            className="ml-2 font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Back to login
          </button>
        </p>
      }
      showcase={{
        footer: (
          <Button onClick={handleSignUpButton} theme="white" isWidthFull>
            <Text text="Create an account" className="text-[15px] font-semibold" />
          </Button>
        ),
      }}
    >
      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
        <EmailInput
          name="email"
          error={errors?.email}
          label="Work email"
          register={register}
          placeholder="you@ndi.team"
          isRequired
        />
        {serverError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200">
            {serverError}
          </p>
        ) : null}
        {serverMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
            {serverMessage}
          </p>
        ) : null}

        <Button type="submit" theme="primary" isWidthFull disabled={sendLinkMutation.isPending}>
          <Text
            text={sendLinkMutation.isPending ? "Sending link..." : "Send reset link"}
            className="text-[16px] font-semibold"
          />
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ForgetPasswordPage;
