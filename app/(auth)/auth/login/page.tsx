"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import AuthLayout from "../_components/AuthLayout";
import Button from "../../../components/atoms/buttons/Button";
import EmailInput from "../../../components/atoms/inputs/EmailInput";
import PasswordInput from "../../../components/atoms/inputs/PasswordInput";
import Text from "../../../components/atoms/Text/Text";

const schema = z.object({
  email: z.string().nonempty({ message: "Email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

type FormData = z.infer<typeof schema>;

function LoginPage() {
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleForgotPasswordClick = () => {
    router.push("/auth/forget-password");
  };

  const handleSignUpButton = () => {
    router.push("/auth/signup");
  };

  const handleLogin = (data: FormData) => {
    console.log("Form submitted:", data);
    router.push("/");
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

        <Button type="submit" theme="primary" isWidthFull>
          <Text text="Sign in" className="text-[16px] font-semibold" />
        </Button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
