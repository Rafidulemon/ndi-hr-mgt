"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { trpc } from "@/trpc/client";

import AuthLayout from "../_components/AuthLayout";
import Button from "../../../components/atoms/buttons/Button";
import EmailInput from "../../../components/atoms/inputs/EmailInput";
import ImageInput from "../../../components/atoms/inputs/ImageInput";
import PasswordInput from "../../../components/atoms/inputs/PasswordInput";
import Text from "../../../components/atoms/Text/Text";
import TextInput from "../../../components/atoms/inputs/TextInput";
import SelectBox from "../../../components/atoms/selectBox/SelectBox";

const schema = z
  .object({
    employeeId: z.string().nonempty("Employee ID is required"),
    organizationId: z.string().nonempty("Organization is required"),
    departmentId: z.string().nonempty("Department is required"),
    firstName: z.string().nonempty("Employee First Name is required"),
    lastName: z.string().nonempty("Employee Last Name is required"),
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
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationId: "",
      departmentId: "",
    },
  });
  const signupOptionsQuery = trpc.auth.signupOptions.useQuery();
  const signupMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setServerError(null);
      setServerMessage(null);
      setShowSuccessModal(true);
    },
    onError: (error) => {
      setServerMessage(null);
      setServerError(error.message || "Unable to create the account right now.");
    },
  });
  const isSubmitting = signupMutation.isPending;
  const selectedOrganizationId = watch("organizationId");
  const organizations = signupOptionsQuery.data?.organizations ?? [];
  const organizationOptions = organizations.map((organization) => ({
    label: organization.name,
    value: organization.id,
  }));
  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId,
  );
  const departmentOptions =
    selectedOrganization?.departments.map((department) => ({
      label: department.name,
      value: department.id,
    })) ?? [];

  useEffect(() => {
    setValue("departmentId", "");
  }, [selectedOrganizationId, setValue]);

  useEffect(() => {
    if (!showSuccessModal) {
      return;
    }
    const timeout = setTimeout(() => {
      router.push("/auth/login");
    }, 4000);
    return () => clearTimeout(timeout);
  }, [showSuccessModal, router]);

  const handleLoginButton = () => {
    router.push("/auth/login");
  };

  const handleOnSubmit = (data: FormData) => {
    setServerError(null);
    setServerMessage(null);
    if (!profilePhotoUrl) {
      setImageError("Please upload your profile photo.");
      return;
    }
    signupMutation.mutate({
      employeeId: data.employeeId,
      organizationId: data.organizationId,
      departmentId: data.departmentId,
      firstName: data.firstName,
      lastName: data.lastName,
      designation: data.designation,
      email: data.email,
      password: data.password,
      profilePhotoUrl: profilePhotoUrl ?? undefined,
    });
  };

  const handleProfilePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImageError(null);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/signup/photo", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to upload image");
      }
      setProfilePhotoUrl(payload.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image";
      setImageError(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <>
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
        {signupOptionsQuery.isError ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
            {signupOptionsQuery.error?.message ?? "Unable to load organization options right now."}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Employee ID"
            isRequired
            placeholder="1234564798"
            register={register}
            name="employeeId"
            error={errors.employeeId}
          />
          <SelectBox
            label="Organization"
            isRequired
            name="organizationId"
            register={register}
            options={organizationOptions}
            error={errors.organizationId}
            placeholderLabel={
              signupOptionsQuery.isLoading ? "Loading organizations..." : "Select organization"
            }
            isDisabled={signupOptionsQuery.isLoading}
          />
          <SelectBox
            label="Department"
            isRequired
            name="departmentId"
            register={register}
            options={departmentOptions}
            error={errors.departmentId}
            placeholderLabel={
              selectedOrganization
                ? departmentOptions.length
                  ? "Select department"
                  : "No departments found"
                : "Select organization first"
            }
            isDisabled={!selectedOrganization || signupOptionsQuery.isLoading}
          />
          <TextInput
            label="First Name"
            isRequired
            placeholder="Md. Rafidul"
            register={register}
            name="firstName"
            error={errors.firstName}
          />
          <TextInput
            label="Last Name"
            isRequired
            placeholder="Islam"
            register={register}
            name="lastName"
            error={errors.lastName}
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
            initialImage={profilePhotoUrl ?? "/default_profile.png"}
            onChange={handleProfilePhotoChange}
            isUploading={isUploadingImage}
            error={imageError}
          />
        </div>

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
          disabled={isSubmitting || isUploadingImage || signupOptionsQuery.isLoading}
        >
          <Text
            text={
              isUploadingImage
                ? "Uploading photo..."
                : isSubmitting
                  ? "Creating account..."
                  : "Create account"
            }
            className="text-[16px] font-semibold"
          />
        </Button>
      </form>
      </AuthLayout>
      {showSuccessModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-white/20 bg-white p-8 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <Text text="Signup request submitted" className="text-2xl font-semibold text-text_primary" />
            <p className="text-sm text-text_secondary">
              Your signup request has been submitted. After confirmation you will get email. Please
              wait.
            </p>
            <Button theme="primary" isWidthFull onClick={() => router.push("/auth/login")}>
              <Text text="Go to login" className="font-semibold" />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default SignupPage;
