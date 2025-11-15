"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import AuthLayout from "../_components/AuthLayout";
import Button from "../../../components/atoms/buttons/Button";
import EmailInput from "../../../components/atoms/inputs/EmailInput";
import ImageInput from "../../../components/atoms/inputs/ImageInput";
import PasswordInput from "../../../components/atoms/inputs/PasswordInput";
import Text from "../../../components/atoms/Text/Text";
import TextInput from "../../../components/atoms/inputs/TextInput";

const schema = z
  .object({
    id: z.string().nonempty("Employee ID is required"),
    department: z.string().nonempty("Employee Department is required"),
    first_name: z.string().nonempty("Employee First Name is required"),
    last_name: z.string().nonempty("Employee Last Name is required"),
    designation: z.string().nonempty("Employee Designation is required"),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z.string().nonempty("Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleLoginButton = () => {
    router.push("/auth/login");
  };

  const handleOnSubmit = (data: FormData) => {
    console.log("Signup submitted:", data);
    router.push("/auth/login");
  };

  return (
    <AuthLayout
      title="Create workspace access"
      subtitle="Let’s get your employee workspace ready."
      description="Complete the onboarding form so we can tailor your dashboard, permissions and payroll lanes automatically."
      helper="Use your company-issued information so we can sync you with the right department, manager, and policy set."
      badge="Onboarding"
      footer={
        <p className="text-sm">
          Already invited?
          <button
            type="button"
            onClick={handleLoginButton}
            className="ml-2 font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Sign in instead
          </button>
        </p>
      }
      showcase={{
        footer: (
          <Button onClick={handleLoginButton} theme="white" isWidthFull>
            <Text text="Return to login" className="text-[15px] font-semibold" />
          </Button>
        ),
      }}
    >
      <form
        onSubmit={handleSubmit(handleOnSubmit)}
        className="space-y-6"
        autoComplete="off"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Employee ID"
            isRequired
            placeholder="1234564798"
            register={register}
            name="id"
            error={errors.id}
          />
          <TextInput
            label="Department"
            isRequired
            placeholder="Frontend"
            register={register}
            name="department"
            error={errors.department}
          />
          <TextInput
            label="First Name"
            isRequired
            placeholder="Md. Rafidul"
            register={register}
            name="first_name"
            error={errors.first_name}
          />
          <TextInput
            label="Last Name"
            isRequired
            placeholder="Islam"
            register={register}
            name="last_name"
            error={errors.last_name}
          />
          <TextInput
            label="Designation"
            isRequired
            placeholder="Software Engineer"
            register={register}
            name="designation"
            error={errors.designation}
          />
          <EmailInput
            label="Email"
            isRequired
            placeholder="you@ndi.team"
            register={register}
            name="email"
            error={errors.email}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PasswordInput
            label="Password"
            placeholder="Password"
            register={register}
            name="password"
            error={errors.password}
            isRequired
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm Password"
            register={register}
            name="confirm_password"
            error={errors.confirm_password}
            isRequired
          />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/70">
          <ImageInput
            label="Upload Profile Picture"
            isRequired
            id="profilePic"
            initialImage="/default_profile.png"
            onChange={(event) => console.log(event.target.files)}
          />
        </div>

        <Button type="submit" theme="primary" isWidthFull>
          <Text text="Create account" className="text-[16px] font-semibold" />
        </Button>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;
