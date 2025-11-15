"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthLayout from "../_components/AuthLayout";
import Button from "../../../components/atoms/buttons/Button";
import EmailInput from "../../../components/atoms/inputs/EmailInput";
import PasswordInput from "../../../components/atoms/inputs/PasswordInput";
import Text from "../../../components/atoms/Text/Text";
import { trpc } from "@/trpc/client";

const schema = z.object({
  email: z.string().nonempty({ message: "Email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      remember: false,
    },
  });
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      setFormError(null);
      router.push("/");
    },
    onError: (error) => {
      setFormError(error.message || "Unable to sign in with those credentials.");
    },
  });

  const handleForgotPasswordClick = () => {
    router.push("/auth/forget-password");
  };

  const handleSignUpButton = () => {
    router.push("/auth/signup");
  };

  const handleLogin = (data: FormData) => {
    setFormError(null);
    loginMutation.mutate({
      email: data.email,
      password: data.password,
      remember: data.remember ?? false,
    });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue"
      description="Use your corporate credentials to jump back into your workspace. Multifactor encryption keeps every session protected."
      helper="Need SSO instead? Use your company login portal to switch authentication methods."
      footer={
        <p className="text-sm">
          New to NDI HR?
          <button
            type="button"
            onClick={handleSignUpButton}
            className="ml-2 font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Create an account
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
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
        <div className="space-y-4">
          <EmailInput
            name="email"
            error={errors?.email}
            label="Work email"
            register={register}
            placeholder="you@company.com"
            isRequired
          />
          <PasswordInput
            name="password"
            error={errors?.password}
            register={register}
            label="Password"
            placeholder="Your secure password"
            isRequired
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
              {...register("remember")}
            />
            <span>Keep me signed in for 30 days</span>
          </label>
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Forgot password?
          </button>
        </div>

        {formError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200">
            {formError}
          </p>
        ) : null}

        <Button type="submit" theme="primary" isWidthFull disabled={loginMutation.isPending}>
          <Text
            text={loginMutation.isPending ? "Signing in..." : "Sign in"}
            className="text-[16px] font-semibold"
          />
        </Button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
