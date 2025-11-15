"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../../components/atoms/buttons/Button";
import Text from "../../../components/atoms/Text/Text";
import TextFeild from "../../../components/atoms/TextFeild/TextFeild";
import RadioGroup from "../../../components/atoms/inputs/RadioGroup";
import TextArea from "../../../components/atoms/inputs/TextArea";
import CustomDatePicker from "../../../components/atoms/inputs/DatePicker";
import { EmployeeHeader } from "../../../components/layouts/EmployeeHeader";
import ApplicationPreview from "../Preview";
import {
  leaveTypeOptionMap,
  leaveTypeOptions,
  leaveTypeValues,
  type LeaveTypeValue,
} from "@/lib/leave-types";
import { trpc } from "@/trpc/client";

const leaveApplicationSchema = z
  .object({
    leaveType: z.enum(leaveTypeValues, {
      errorMap: () => ({ message: "Please select a leave type" }),
    }),
    reason: z
      .string()
      .min(10, { message: "Please describe your leave in at least 10 characters." }),
    note: z
      .string()
      .max(2000, { message: "Notes must be under 2000 characters." })
      .optional()
      .or(z.literal("")),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date({ required_error: "End date is required" }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });

type FormData = z.infer<typeof leaveApplicationSchema>;

type AttachmentPreview = {
  id: string;
  file: File;
  dataUrl: string;
};

const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

const helperSteps = [
  "Fill in the leave window and reason with clear context for approvers.",
  "Attach supporting documents (medical slips, approvals) if needed.",
  "Preview the generated letter and export it as PDF for your records.",
];

const formatReadableDate = (value?: Date | string | null) => {
  if (!value) return "";
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const generateLocalId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error("Unable to read the selected attachment. Please try again."));
    reader.readAsDataURL(file);
  });

export default function LeaveApplicationPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const leaveMutation = trpc.leave.submitApplication.useMutation();
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = trpc.user.profile.useQuery();

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB");

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    designation: "",
    leaveType: "",
    reason: "",
    note: "",
    from: "",
    to: "",
    date: formattedDate,
    organization: profileData?.organizationName || "",
  });

  useEffect(() => {
    if (!profileData) return;

    const preferredName = profileData.profile?.preferredName;
    const nameFromProfile = [profileData.profile?.firstName, profileData.profile?.lastName]
      .filter(Boolean)
      .join(" ");
    const fullName = preferredName ?? nameFromProfile ?? profileData.email ?? "";

    setUserData((prev) => ({
      ...prev,
      name: fullName || prev.name,
      email: profileData.profile?.workEmail ?? profileData.email ?? prev.email,
      phone:
        profileData.profile?.workPhone ??
        profileData.profile?.personalPhone ??
        profileData.phone ??
        prev.phone,
      employeeId: profileData.employment?.employeeCode ?? prev.employeeId,
      department:
        profileData.employment?.departmentName ??
        profileData.employment?.teamName ??
        prev.department,
      designation: profileData.employment?.designation ?? prev.designation,
    }));
  }, [profileData]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(leaveApplicationSchema),
    defaultValues: {
      leaveType: leaveTypeOptions[0]?.value,
      reason: "",
      note: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const valueOrFallback = (value?: string | null) => {
    if (value && value.trim().length > 0) return value;
    return isProfileLoading ? "Loading..." : "—";
  };

  const joiningDateDisplay = profileData?.employment?.startDate
    ? formatReadableDate(profileData.employment.startDate)
    : "";
  const headerJoiningDate = joiningDateDisplay || valueOrFallback("");
  const headerName = valueOrFallback(userData.name);
  const headerDesignation = valueOrFallback(userData.designation);

  const highlightCards = [
    {
      label: "Department",
      value: valueOrFallback(userData.department),
      description: valueOrFallback(userData.designation),
    },
    {
      label: "Employee ID",
      value: valueOrFallback(userData.employeeId),
      description: "Linked to your HR profile",
    },
    {
      label: "Application Date",
      value: userData.date,
      description: "Captured automatically",
    },
  ];

  const profileFields = [
    { label: "Applicant Name", value: valueOrFallback(userData.name) },
    { label: "Department", value: valueOrFallback(userData.department) },
    { label: "Employee ID", value: valueOrFallback(userData.employeeId) },
    { label: "Designation", value: valueOrFallback(userData.designation) },
  ];

  const handleAttachmentChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const availableSlots = MAX_ATTACHMENTS - attachments.length;
    if (availableSlots <= 0) {
      setAttachmentError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
      event.target.value = "";
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    const processed: AttachmentPreview[] = [];

    for (const file of filesToProcess) {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setAttachmentError("Attachments must be smaller than 5 MB.");
        continue;
      }

      try {
        const dataUrl = await fileToDataUrl(file);
        processed.push({
          id: generateLocalId(),
          file,
          dataUrl,
        });
      } catch (error) {
        setAttachmentError(
          error instanceof Error ? error.message : "Failed to read the file.",
        );
      }
    }

    setAttachments((prev) => [...prev, ...processed]);
    if (processed.length > 0) {
      setAttachmentError(null);
    }
    event.target.value = "";
  };

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));

  const onSubmit = async (data: FormData) => {
    setFormMessage(null);

    try {
      await leaveMutation.mutateAsync({
        leaveType: data.leaveType as LeaveTypeValue,
        reason: data.reason,
        note: data.note || undefined,
        startDate: data.startDate,
        endDate: data.endDate,
        attachments: attachments.length
          ? attachments.map((attachment) => ({
              name: attachment.file.name,
              type: attachment.file.type,
              size: attachment.file.size,
              content: attachment.dataUrl,
            }))
          : undefined,
      });

      const leaveMeta = leaveTypeOptionMap[data.leaveType as LeaveTypeValue];

      setUserData((prev) => ({
        ...prev,
        leaveType: leaveMeta?.label ?? data.leaveType,
        reason: data.reason,
        note: data.note ?? "",
        from: data.startDate.toLocaleDateString("en-GB"),
        to: data.endDate.toLocaleDateString("en-GB"),
        date: new Date().toLocaleDateString("en-GB"),
      }));
      setIsFormSubmitted(true);
      setAttachments([]);
      setFormMessage({
        type: "success",
        text: "Leave application submitted successfully.",
      });
      await utils.leave.summary.invalidate();
    } catch (error) {
      setFormMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to submit the application right now.",
      });
      setIsFormSubmitted(false);
    }
  };

  const generatePDF = async () => {
    if (typeof window === "undefined" || !isFormSubmitted) return;

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
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <EmployeeHeader
          name={headerName}
          designation={headerDesignation}
          joining_date={headerJoiningDate}
        />

        {profileError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-100">
            Unable to load your employee profile right now. {profileError.message}
          </div>
        )}

        <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-sm transition-colors duration-200 sm:p-8 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Leave application
            </p>
            <Text
              text="Submit a clear request"
              className="text-2xl font-semibold text-slate-900 transition-colors duration-200 dark:text-slate-100 md:text-3xl"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Describe your leave window, attach supporting files, and get a PDF-ready
              application instantly.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlightCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {card.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-6 transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70">
              <div className="space-y-2">
                <Text
                  text="Applicant snapshot"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pulled directly from your employee profile. Update there if something
                  looks off.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {profileFields.map((field) => (
                  <TextFeild
                    key={field.label}
                    label={field.label}
                    text={field.value}
                    textFontSize="16px"
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70"
                  />
                ))}
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="leaveType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      name="leaveType"
                      title="Leave Type"
                      options={leaveTypeOptions.map((option) => ({
                        label: option.label,
                        value: option.value,
                      }))}
                      selectedValue={field.value}
                      onChange={(value) => field.onChange(value)}
                      isRequired
                      error={errors.leaveType}
                      className="col-span-2 rounded-2xl border border-dashed border-slate-200 bg-white p-4 transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70"
                    />
                  )}
                />
                <TextArea
                  className="col-span-2"
                  label="Reason"
                  isRequired
                  placeholder="Explain why you need this leave"
                  register={register}
                  name="reason"
                  error={errors.reason}
                  height="120px"
                />
                <TextArea
                  className="col-span-2"
                  label="Additional note"
                  placeholder="Optional context for HR or your manager"
                  register={register}
                  name="note"
                  error={errors.note}
                  height="100px"
                />
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <CustomDatePicker
                      {...field}
                      label="From"
                      isRequired
                      error={errors.startDate}
                      placeholder="Select start date"
                      value={field.value}
                      onChange={(date) => field.onChange(date ?? field.value)}
                      className="col-span-2 md:col-span-1"
                    />
                  )}
                />
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <CustomDatePicker
                      {...field}
                      label="To"
                      isRequired
                      error={errors.endDate}
                      placeholder="Select end date"
                      value={field.value}
                      onChange={(date) => field.onChange(date ?? field.value)}
                      className="col-span-2 md:col-span-1"
                    />
                  )}
                />

                <div className="col-span-2 space-y-3 rounded-2xl border border-dashed border-slate-200 bg-white p-4 transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Attachments (optional)
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upload PDFs or images. Max {MAX_ATTACHMENTS} files, 5 MB each.
                      </p>
                    </div>
                    <label className="cursor-pointer rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-primary_dark/40 hover:text-primary_dark dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-500/60 dark:hover:text-sky-300">
                      Browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        multiple
                        onChange={handleAttachmentChange}
                      />
                    </label>
                  </div>
                  {attachmentError && (
                    <p className="text-xs text-rose-500 dark:text-rose-300">{attachmentError}</p>
                  )}
                  {attachments.length > 0 && (
                    <ul className="space-y-2">
                      {attachments.map((attachment) => (
                        <li
                          key={attachment.id}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 transition-colors duration-200 dark:bg-slate-900/70 dark:text-slate-300"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {attachment.file.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {(attachment.file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            className="text-xs font-semibold text-rose-500 transition-colors duration-150 hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-200"
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {formMessage && (
                  <div
                    className={`col-span-2 rounded-xl border px-4 py-3 text-sm ${
                      formMessage.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100"
                    }`}
                  >
                    {formMessage.text}
                  </div>
                )}

                <div className="col-span-2 flex flex-wrap justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    theme="aqua"
                    className="w-full sm:w-auto"
                    disabled={leaveMutation.isPending}
                  >
                    <Text
                      text={leaveMutation.isPending ? "Submitting..." : "Submit application"}
                      className="text-[15px] font-semibold"
                    />
                  </Button>
                  <Button
                    theme="secondary"
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() => router.push("/leave")}
                  >
                    <Text text="Cancel" className="text-[15px] font-semibold" />
                  </Button>
                </div>
              </form>
            </div>

            <aside className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-slate-900/60">
              {isFormSubmitted ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <Text
                        text="Preview & export"
                        className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Review the generated document before pushing it to HR.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                      Ready
                    </span>
                  </div>
                  <div
                    id="application-preview"
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70"
                  >
                    <ApplicationPreview userData={userData} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      theme="aqua"
                      className="flex-1 min-w-[160px]"
                      onClick={generatePDF}
                      type="button"
                    >
                      <Text text="Download PDF" className="text-[15px] font-semibold" />
                    </Button>
                    <Button
                      theme="secondary"
                      className="flex-1 min-w-[160px]"
                      onClick={() => {
                        setIsFormSubmitted(false);
                        setFormMessage(null);
                      }}
                      type="button"
                    >
                      <Text text="Edit details" className="text-[15px] font-semibold" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Text
                      text="Keep it approvable"
                      className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      A short checklist to hand approvers everything they need.
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {helperSteps.map((step) => (
                      <li
                        key={step}
                        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary_dark dark:bg-sky-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">{step}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 transition-colors duration-200 dark:border-slate-700/60 dark:text-slate-400">
                    Need support? Ping {" "}
                    <a
                      href="mailto:hr@ndi.hr"
                      className="font-semibold text-primary_dark dark:text-sky-400"
                    >
                      hr@ndi.hr
                    </a>{" "}
                    or talk to your manager before submitting.
                  </div>
                </>
              )}
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
