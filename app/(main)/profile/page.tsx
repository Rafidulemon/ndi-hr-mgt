"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import Button from "../../components/atoms/buttons/Button";
import PasswordInput from "../../components/atoms/inputs/PasswordInput";
import { Card } from "../../components/atoms/frame/Card";
import { Modal } from "../../components/atoms/frame/Modal";
import Text from "../../components/atoms/Text/Text";
import { EmployeeHeader } from "../../components/layouts/EmployeeHeader";
import { trpc } from "@/trpc/client";

const formatDate = (input?: Date | string | null) => {
  if (!input) return "—";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatValue = (value?: string | null, fallback = "—") =>
  value && value.trim().length > 0 ? value : fallback;

const toTitleCase = (value?: string | null) =>
  value ? value.toLowerCase().replace(/(^|\s)\w/g, (m) => m.toUpperCase()) : "—";

const calculateExperience = (start?: Date | string | null) => {
  if (!start) return "—";
  const date = start instanceof Date ? start : new Date(start);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
  return years < 1 ? "< 1 yr" : `${years} yr${years > 1 ? "s" : ""}`;
};

function ProfilePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, error } = trpc.user.profile.useQuery();

  const infoSections = useMemo(() => {
    if (!data) {
      return [];
    }

    const emergency = data.emergencyContact;
    const bank = data.bankAccount;
    const employment = data.employment;
    const profile = data.profile;

    return [
      {
        title: "Basic Info",
        data: [
          { label: "First Name", value: formatValue(profile?.firstName) },
          { label: "Last Name", value: formatValue(profile?.lastName) },
          { label: "Gender", value: formatValue(profile?.gender) },
          { label: "Date of Birth", value: formatDate(profile?.dateOfBirth) },
          { label: "Nationality", value: formatValue(profile?.nationality) },
        ],
      },
      {
        title: "Contact & Emergency",
        data: [
          { label: "Work Email", value: formatValue(profile?.workEmail ?? data.email) },
          { label: "Work Phone", value: formatValue(profile?.workPhone ?? data.phone) },
          { label: "Personal Email", value: formatValue(profile?.personalEmail) },
          { label: "Personal Phone", value: formatValue(profile?.personalPhone) },
          {
            label: "Emergency Contact",
            value: emergency
              ? `${emergency.name} (${emergency.relationship})`
              : "—",
          },
          {
            label: "Emergency Phone",
            value: emergency ? formatValue(emergency.phone) : "—",
          },
        ],
      },
      {
        title: "Address & Preferences",
        data: [
          { label: "Home Address", value: formatValue(profile?.permanentAddress) },
          { label: "Current Address", value: formatValue(profile?.currentAddress) },
          { label: "Preferred Work Model", value: formatValue(profile?.workModel) },
        ],
      },
      {
        title: "Employment Details",
        data: [
          { label: "Employee ID", value: formatValue(employment?.employeeCode) },
          { label: "Department", value: formatValue(employment?.departmentName) },
          { label: "Team", value: formatValue(employment?.teamName) },
          { label: "Designation", value: formatValue(employment?.designation) },
          { label: "Reporting Manager", value: formatValue(employment?.managerName) },
          { label: "Employment Type", value: formatValue(toTitleCase(employment?.employmentType)) },
          { label: "Joined", value: formatDate(employment?.startDate ?? null) },
        ],
      },
      {
        title: "Bank & Payroll",
        data: [
          { label: "Bank Name", value: formatValue(bank?.bankName) },
          { label: "Account Holder", value: formatValue(bank?.accountHolder) },
          { label: "Account Number", value: formatValue(bank?.accountNumber) },
          { label: "Branch", value: formatValue(bank?.branch) },
          { label: "SWIFT / IFSC", value: formatValue(bank?.swiftCode) },
        ],
      },
    ];
  }, [data]);

  const quickStats = useMemo(() => {
    if (!data) return [];
    const employment = data.employment;
    return [
      { label: "Experience", value: calculateExperience(employment?.startDate), helper: employment?.teamName ?? "Since joining" },
      {
        label: "Employment Status",
        value: formatValue(toTitleCase(employment?.status)),
        helper: formatValue(toTitleCase(employment?.employmentType)),
      },
      {
        label: "Department",
        value: formatValue(employment?.departmentName),
        helper: formatValue(employment?.teamName, "—"),
      },
      {
        label: "Last Login",
        value: formatDate(data.lastLoginAt),
        helper: data.organizationName || "Workspace",
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-500">We couldn&apos;t load your profile right now.</p>
        <Button onClick={() => router.refresh()}>
          <Text text="Retry" className="font-semibold" />
        </Button>
      </div>
    );
  }

  const profile = data.profile;
  const employment = data.employment;
  const avatarSrc = profile?.profilePhotoUrl ?? "/dp.png";
  const personaTags = [employment?.teamName, employment?.employmentType, profile?.workModel]
    .filter(Boolean)
    .map((tag) => toTitleCase(tag as string));
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    data.email;
  const designation = employment?.designation ?? "Team Member";
  const joiningDate = formatDate(employment?.startDate);

  return (
    <div className="space-y-8">
      <EmployeeHeader
        name={fullName}
        designation={designation}
        joining_date={joiningDate}
        hasRightButton
        buttonText="Edit Profile"
        onButtonClick={() => router.push("/profile/edit")}
      />

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card title="Profile Overview">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border border-white/60 shadow-lg shadow-indigo-100 transition-colors duration-200 dark:border-slate-700/70 dark:shadow-slate-900/60">
              <Image
                src={avatarSrc}
                alt={fullName}
                fill
                sizes="128px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex-1 space-y-3">
              <Text
                text={formatValue(profile?.bio, "Product-first engineer focused on reliable HR experiences.")}
                className="text-base text-slate-600 dark:text-slate-300"
              />
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                {personaTags.length > 0
                  ? personaTags.map((tag) => <span key={tag}>{tag}</span>)
                  : ["Employee", data.organizationName].map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/60"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.helper}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Security">
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>Maintain a strong password to keep your workplace data secure.</p>
            <Button theme="secondary" isWidthFull onClick={() => setIsModalOpen(true)}>
              <Text text="Update password" className="font-semibold" />
            </Button>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/70">
              Last login: {formatDate(data.lastLoginAt)}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {infoSections.map((section) => (
          <Card key={section.title} title={section.title}>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.data.map((item) => (
                <div
                  key={`${section.title}-${item.label}`}
                  className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/60"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </section>

      <Modal
        title="Change Password"
        open={isModalOpen}
        setOpen={setIsModalOpen}
        isDoneButton
        doneButtonText="Save"
        isCancelButton
        cancelButtonText="Cancel"
        buttonWidth="140px"
        buttonHeight="44px"
        onDoneClick={() => setIsModalOpen(false)}
        closeOnClick={() => setIsModalOpen(false)}
        crossOnClick={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          <PasswordInput label="Current Password" />
          <PasswordInput label="New Password" />
          <PasswordInput label="Confirm New Password" />
        </div>
      </Modal>
    </div>
  );
}

export default ProfilePage;
