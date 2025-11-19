"use client"
import { EmployeeHeader } from "@/app/components/layouts/EmployeeHeader";
import { useRouter } from "next/navigation";
import Text from "@/app/components/atoms/Text/Text";
import { useState } from "react";
import Button from "@/app/components/atoms/buttons/Button";
import { MdDeleteForever } from "react-icons/md";
import TextInput from "@/app/components/atoms/inputs/TextInput";
export default function MonthlyReportApplication() {
  const navigate = useRouter();
  const day = new Date();
  const today = new Intl.DateTimeFormat("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(day);

  type Report = {
    id: number;
    taskName: string;
    storyPoint: string;
    workingHours: string;
  };
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      taskName: "",
      storyPoint: "",
      workingHours: "",
    },
  ]);

  const handleAddReport = () => {
    const newReport = {
      id: reports.length > 0 ? Math.max(...reports.map((r) => r.id)) + 1 : 1,
      taskName: "",
      storyPoint: "",
      workingHours: "",
    };

    setReports((prev) => {
      return [...prev, newReport];
    });
  };

  const handleDeleteReport = (id: number) => {
    setReports((prevReports) =>
      prevReports.filter((report) => report.id != id)
    );
  };

  return (
    <div className="flex w-full flex-col gap-10">
      <EmployeeHeader
        hasRightButton
        buttonText="History"
        onButtonClick={() => navigate.push("/report/monthly/history")}
      />
      <div className="flex w-full flex-col gap-6 rounded-[32px] border border-white/60 bg-white/85 p-8 shadow-xl shadow-indigo-100 transition-colors duration-200 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60">
        <div className="mb-6 flex flex-col gap-2">
          <Text
            text="Monthly Report"
            className="text-[24px] font-semibold text-slate-900 dark:text-slate-100"
          />
          <Text
            text={today}
            className="text-text_primary dark:text-slate-300"
          />
        </div>

        {reports.map((report, index) => (
          <div
            className="mb-10 border-b border-slate-200 pb-6 transition-colors duration-200 dark:border-slate-700/60"
            key={report.id}
          >
            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => handleDeleteReport(report?.id)}
                className="mb-4 text-[30px] text-slate-400 transition-colors duration-150 hover:text-red-500 dark:text-slate-500"
                aria-label={`Delete Report ${report.id}`}
              >
                <MdDeleteForever />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
              <TextInput
                label={`Task Name / Ticket Number ${index + 1}`}
                placeholder="Enter Task Name"
                isRequired
              />
              <TextInput
                placeholder="Enter Story point"
                label={`Story Point ${index + 1}`}
                isRequired
              />
              <TextInput
                placeholder="Enter Working Hours"
                label={`Working Hours ${index + 1}`}
                isRequired
              />
            </div>
          </div>
        ))}

        <Button
          theme="secondary"
          className="w-[185px]"
          onClick={handleAddReport}
        >
          <Text text="Add New Report" className="font-semibold" />
        </Button>

        <div className="w-full flex flex-row gap-6 mt-10">
          <Button type="submit" className="w-[185px]">
            <Text text="Submit" className="font-semibold" />
          </Button>
          <Button
            theme="cancel"
            className="w-[185px]"
            onClick={() => navigate.push("/report/monthly/history")}
          >
            <Text text="Cancel" className="font-semibold" />
          </Button>
        </div>
      </div>
    </div>
  );
}
