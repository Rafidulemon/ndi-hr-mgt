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

const personalInfo = [
  { label: "First Name", value: "Md. Rafidul" },
  { label: "Last Name", value: "Islam" },
  { label: "Gender", value: "Male" },
  { label: "Date of Birth", value: "01 January 1996" },
  { label: "Nationality", value: "Bangladeshi" },
];

const contactInfo = [
  { label: "Work Email", value: "rafid@ndi.hr" },
  { label: "Work Phone", value: "+880 1711-000000" },
  { label: "Personal Email", value: "rafid.personal@example.com" },
  { label: "Personal Phone", value: "+880 1911-000000" },
  { label: "Emergency Contact", value: "Shahriar Duke (Brother)" },
  { label: "Emergency Phone", value: "+880 1811-000000" },
];

const addressInfo = [
  { label: "Home Address", value: "Comilla, Chittagong, Bangladesh" },
  { label: "Current Address", value: "Mohakhali, Dhaka, Bangladesh" },
  { label: "Preferred Work Model", value: "Hybrid · 2 days in office" },
];

const employmentInfo = [
  { label: "Employee ID", value: "2023080021004" },
  { label: "Department", value: "Frontend Engineering" },
  { label: "Designation", value: "Software Engineer" },
  { label: "Reporting Manager", value: "Shahriar Duke" },
  { label: "Employment Type", value: "Permanent · Full time" },
  { label: "Joined", value: "17 August, 2023" },
];

const payrollInfo = [
  { label: "Bank Name", value: "Eastern Bank Ltd." },
  { label: "Account Holder", value: "Md. Rafidul Islam" },
  { label: "Account Number", value: "1234 5678 9123" },
  { label: "Branch", value: "Gulshan Avenue, Dhaka" },
  { label: "SWIFT / IFSC", value: "EBLDBDDH" },
  { label: "TAX ID (TIN)", value: "12345-12345-12345" },
];

const skillTags = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind",
  "Unit Testing",
  "Design Systems",
  "Mentorship",
];

const careerTimeline = [
  {
    title: "Promoted to Software Engineer",
    time: "Oct 2024",
    detail: "Led the rollout of the attendance & payroll dashboard revamp.",
  },
  {
    title: "Employee of the Quarter",
    time: "Jun 2024",
    detail: "Recognised for improving build times by 35% and mentoring interns.",
  },
  {
    title: "Joined NDI HR Management",
    time: "Aug 2023",
    detail: "Started as a Junior Frontend Engineer within the platform team.",
  },
];

const quickStats = [
  { label: "Experience", value: "4 yrs", helper: "2 yrs at NDI" },
  { label: "Current Project", value: "HR Core", helper: "Payroll squad" },
  { label: "Next PTO", value: "Dec 26-29", helper: "Approved" },
  { label: "Performance", value: "Exceeds", helper: "FY 2024" },
];

function ProfilePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const infoSections = useMemo(
    () => [
      { title: "Basic Info", data: personalInfo },
      { title: "Contact & Emergency", data: contactInfo },
      { title: "Address & Preferences", data: addressInfo },
      { title: "Employment Details", data: employmentInfo },
      { title: "Bank & Payroll", data: payrollInfo },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <EmployeeHeader
        name="Md. Rafidul Islam"
        designation="Software Engineer"
        joining_date="Aug 17, 2023"
        hasRightButton
        buttonText="Edit Profile"
        onButtonClick={() => router.push("/profile/edit")}
      />

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card title="Profile Overview">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[28px] border border-white/60 shadow-lg shadow-indigo-100">
              <Image
                src="/dp.png"
                alt="Profile"
                fill
                sizes="128px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex-1 space-y-3">
              <Text
                text="Product-led engineer focused on crafting reliable HR experiences."
                className="text-base text-slate-600"
              />
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                <span>Frontend</span>
                <span>Performance Advocate</span>
                <span>Mentor</span>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.helper}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Skills & Tools">
          <div className="flex flex-wrap gap-2">
            {skillTags.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/60 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="section-divider" />
          <div>
            <p className="text-sm text-slate-500">
              Currently exploring: Design tokens, DX automation, AI-assisted QA.
            </p>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {infoSections.map((section) => (
          <Card key={section.title} title={section.title}>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.data.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Career Highlights">
          <div className="space-y-6">
            {careerTimeline.map((event) => (
              <div
                key={event.title}
                className="flex gap-4 rounded-2xl border border-white/60 bg-white/80 p-4"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.title}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {event.time}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{event.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Availability & Wellbeing">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900">
              <p className="text-sm font-semibold">
                Weekly focus blockers
              </p>
              <p>Deep work from 10 AM – 1 PM. Prefer meetings after 2 PM.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm">
              <p className="font-semibold text-slate-900">Health & wellbeing</p>
              <p>Enrolled in corporate wellness plan · Practising mindfulness.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm">
              <p className="font-semibold text-slate-900">Travel readiness</p>
              <p>Available for travel within APAC with 2 weeks notice.</p>
            </div>
          </div>
        </Card>
      </section>

      <div className="flex flex-wrap gap-4">
        <Button theme="secondary" onClick={() => router.push("/profile/edit")}>
          Edit Profile
        </Button>
        <Button onClick={() => setIsModalOpen(true)}>Change Password</Button>
      </div>

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
