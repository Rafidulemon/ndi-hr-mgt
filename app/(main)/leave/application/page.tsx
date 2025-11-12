"use client"
import TextFeild from "../../../components/atoms/TextFeild/TextFeild";
import TextInput from "../../../components/atoms/inputs/TextInput";
import EmailInput from "../../../components/atoms/inputs/EmailInput";
import PasswordInput from "../../../components/atoms/inputs/PasswordInput";
import Button from "../../../components/atoms/buttons/Button";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Text from "../../../components/atoms/Text/Text";
import RadioGroup from "../../../components/atoms/inputs/RadioGroup";
import { EmployeeHeader } from "../../../components/layouts/EmployeeHeader";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import ApplicationPreview from "../Preview";
import { Controller } from "react-hook-form";
import CustomDatePicker from "../../../components/atoms/inputs/DatePicker";

const leaveApplicationSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .regex(/^\+?\d+$/, { message: "Invalid phone number" }),
    options: z.string().nonempty({ message: "Please select a leave type" }),
    reason: z.string().nonempty({ message: "Reason is required" }),
    from: z
    .date()
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid from date",
    }),
  to: z
    .date()
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid to date",
    }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(8, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof leaveApplicationSchema>;

export default function LeaveApplicationPage() {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(leaveApplicationSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Form Data Submitted:", data);
    setUserData((prev) => ({
      ...prev,
      email: data.email,
      phone: data.phone,
      leave_type: data.options,
      reason: data.reason,
      from: data.from.toLocaleDateString("en-GB"),
      to: data.to.toLocaleDateString("en-GB"),
    }));
    console.log("Updated Data Submitted:", userData);
    setIsFormSubmitted(true);
  };
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB");

  const [userData, setUserData] = useState({
    name: "Md. Rafidul Islam",
    email: "rafid@example.com",
    phone: "+8801711111111",
    employeeId: "203214654731",
    department: "Frontend",
    designation: "Software Engineer",
    leave_type: "",
    reason: "",
    from: "",
    to: "",
    date: formattedDate,
  });

  const [selectedValue, setSelectedValue] = useState("");
  const navigate = useRouter();

  const highlightCards = [
    {
      label: "Status",
      value: isFormSubmitted ? "Preview ready" : "Draft in progress",
      description: isFormSubmitted
        ? "Download the formatted letter below."
        : "Complete the steps to generate the PDF.",
      accent: "from-emerald-500/10 via-white to-white",
    },
    {
      label: "Department",
      value: userData.department,
      description: userData.designation,
      accent: "from-sky-500/10 via-white to-white",
    },
    {
      label: "Employee ID",
      value: userData.employeeId,
      description: "Linked to your HR profile",
      accent: "from-indigo-500/10 via-white to-white",
    },
    {
      label: "Application Date",
      value: userData.date,
      description: "Captured automatically",
      accent: "from-violet-500/10 via-white to-white",
    },
  ];

  const profileFields = [
    { label: "Applicant Name", value: userData.name },
    { label: "Department", value: userData.department },
    { label: "Employee ID", value: userData.employeeId },
    { label: "Designation", value: userData.designation },
  ];

  const helperSteps = [
    "Double-check your contact information before you submit.",
    "Describe your leave clearly to help approvers decide quickly.",
    "Preview the formatted application and export it as PDF instantly.",
  ];

  const generatePDF = async () => {
    if (typeof window === "undefined") return;

    const element = document.getElementById("application-preview");
    if (element) {
      const applicantName = userData.name.replace(/\s+/g, "_").toLowerCase();
      const date = userData.date.replace(/\//g, "-");
      const fileName = `leave-application_${applicantName}-${date}.pdf`;

      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default ?? html2pdfModule;

      html2pdf().from(element).save(fileName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100/70 px-4 py-10 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <EmployeeHeader
          name="Md. Rafidul Islam"
          designation="Software Engineer"
          joining_date="Aug 17, 2023"
        />

        <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-lg sm:p-8 md:p-10">
          <div className="space-y-3 text-slate-600">
            <Text
              text="Leave Application"
              className="text-2xl font-semibold text-slate-900 md:text-3xl"
            />
            <p className="text-sm md:text-base">
              Capture every important detail, preview the formatted letter, and
              download a polished PDF that is ready to share with HR.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {highlightCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border border-white/60 bg-gradient-to-br ${card.accent} p-5 shadow-sm`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            {!isFormSubmitted ? (
              <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="space-y-6 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-lg md:p-8">
                  <div className="space-y-2">
                    <Text
                      text="Applicant Snapshot"
                      className="text-xl font-semibold text-slate-900"
                    />
                    <p className="text-sm text-slate-500">
                      These details come directly from your employee profile.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {profileFields.map((field) => (
                      <TextFeild
                        key={field.label}
                        label={field.label}
                        text={field.value}
                        textFontSize="16px"
                        className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm"
                      />
                    ))}
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <EmailInput
                      className="col-span-2 md:col-span-1"
                      label="Email"
                      defaultValue={userData.email}
                      name="email"
                      isRequired
                      register={register}
                      error={errors.email}
                    />
                    <TextInput
                      className="col-span-2 md:col-span-1"
                      label="Phone"
                      defaultValue={userData.phone}
                      name="phone"
                      isRequired
                      register={register}
                      error={errors.phone}
                    />
                    <RadioGroup
                      name="options"
                      title="Leave Type"
                      options={[
                        { label: "Casual", value: "casual" },
                        { label: "Sick", value: "sick" },
                        { label: "Annual", value: "annual" },
                        { label: "Paternity/Maternity", value: "maternity" },
                        { label: "Other", value: "other" },
                      ]}
                      selectedValue={selectedValue}
                      isRequired
                      onChange={(value) => {
                        setSelectedValue(value);
                        register("options", { value });
                      }}
                      error={errors.options}
                      className="col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4"
                    />
                    <TextInput
                      className="col-span-2"
                      label="Reason"
                      isRequired
                      placeholder="Explain why you need the leave"
                      name="reason"
                      register={register}
                      error={errors.reason}
                    />
                    <Controller
                      name="from"
                      control={control}
                      render={({ field }) => (
                        <CustomDatePicker
                          {...field}
                          label="From"
                          isRequired
                          error={errors.from}
                          placeholder="Select start date"
                          value={field.value ? new Date(field.value) : null}
                          className="col-span-2 md:col-span-1"
                        />
                      )}
                    />

                    <Controller
                      name="to"
                      control={control}
                      render={({ field }) => (
                        <CustomDatePicker
                          {...field}
                          label="To"
                          isRequired
                          error={errors.to}
                          placeholder="Select end date"
                          value={field.value ? new Date(field.value) : null}
                          className="col-span-2 md:col-span-1"
                        />
                      )}
                    />
                    <PasswordInput
                      className="col-span-2 md:col-span-1"
                      label="Password"
                      isRequired
                      name="password"
                      register={register}
                      error={errors.password}
                    />
                    <PasswordInput
                      className="col-span-2 md:col-span-1"
                      label="Confirm Password"
                      isRequired
                      name="confirm_password"
                      register={register}
                      error={errors.confirm_password}
                    />
                    <div className="col-span-2 flex flex-wrap justify-end gap-4 pt-2">
                      <Button
                        type="submit"
                        className="w-full sm:w-[185px]"
                      >
                        <Text
                          text="Submit Application"
                          className="text-[16px] font-semibold"
                        />
                      </Button>
                      <Button
                        theme="cancel"
                        type="button"
                        className="w-full sm:w-[185px]"
                        onClick={() => navigate.push("/leave")}
                      >
                        <Text
                          text="Cancel"
                          className="text-[16px] font-semibold"
                        />
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="flex flex-col gap-6 rounded-3xl border border-slate-100 bg-gradient-to-b from-indigo-50/80 via-white to-white p-6 shadow-inner">
                  <div>
                    <Text
                      text="Polish every request"
                      className="text-lg font-semibold text-slate-900"
                    />
                    <p className="mt-1 text-sm text-slate-500">
                      Use this mini checklist to keep your leave requests crisp
                      and approvable.
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {helperSteps.map((step) => (
                      <li
                        key={step}
                        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm"
                      >
                        <span className="mt-[6px] h-2 w-2 rounded-full bg-sky-500" />
                        <p className="text-sm text-slate-600">{step}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
                    <p>
                      Need help? Reach out to your team lead or HR partner after
                      you submit to keep everyone aligned.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Text
                      text="Preview & Export"
                      className="text-xl font-semibold text-slate-900"
                    />
                    <p className="text-sm text-slate-500">
                      Review the generated document before sharing it with HR.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-600">
                    Ready to download
                  </span>
                </div>
                <div
                  id="application-preview"
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner"
                >
                  <ApplicationPreview userData={userData} />
                </div>
                <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
                  <Button
                    className="w-full sm:w-[185px]"
                    onClick={generatePDF}
                    type="button"
                  >
                    <Text
                      text="Download PDF"
                      className="text-[16px] font-semibold"
                    />
                  </Button>
                  <Button
                    theme="secondary"
                    className="w-full sm:w-[185px]"
                    onClick={() => navigate.push("/leave")}
                    type="button"
                  >
                    <Text
                      text="Back to Leave"
                      className="text-[16px] font-semibold"
                    />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
