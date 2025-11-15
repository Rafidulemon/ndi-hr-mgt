"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import AuthLayout from "../_components/AuthLayout";
import Button from "../../../components/atoms/buttons/Button";
import EmailInput from "../../../components/atoms/inputs/EmailInput";
import Text from "../../../components/atoms/Text/Text";

const schema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Enter a valid email address" }),
});

type FormData = z.infer<typeof schema>;

function ForgetPasswordPage() {
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

  const handleLoginButton = () => {
    router.push("/auth/login");
  };

  const handleSubmitForm = (data: FormData) => {
    console.log("Password reset requested:", data);
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
        <Button type="submit" theme="primary" isWidthFull>
          <Text text="Send reset link" className="text-[16px] font-semibold" />
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ForgetPasswordPage;
