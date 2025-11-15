"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import AuthLayout from "../_components/AuthLayout";
import Button from "../../../components/atoms/buttons/Button";
import PasswordInput from "../../../components/atoms/inputs/PasswordInput";
import Text from "../../../components/atoms/Text/Text";

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

function ResetPasswordPage() {
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleSignUpButton = () => {
    router.push("/auth/signup");
  };

  const handleLogin = (data: FormData) => {
    console.log("Password reset:", data);
    router.push("/auth/login");
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

        <Button type="submit" theme="primary" isWidthFull>
          <Text
            text="Update password"
            className="text-[16px] font-semibold"
          />
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ResetPasswordPage;
