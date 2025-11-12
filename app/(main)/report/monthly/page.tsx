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
    <div className="w-full flex flex-col gap-10">
      <EmployeeHeader
        name="Md. Rafidul Islam"
        designation="Software Engineer"
        joining_date="Aug 17, 2023"
        hasRightButton
        buttonText="History"
        onButtonClick={() => navigate.push("/monthly/report-history")}
      />
      <div className="w-full bg-white shadow p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2 mb-6">
          <Text text="Daily Report" className="text-[24px] font-semibold" />
          <Text text={today} className="text-text_primary" />
        </div>

        {reports.map((report, index) => (
          <div className="border-b pb-6 mb-10" key={report.id}>
            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => handleDeleteReport(report?.id)}
                className="text-[30px] hover:text-red-500 mb-4"
                aria-label={`Delete Report ${report.id}`}
              >
                <MdDeleteForever />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-10">
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
            onClick={() => navigate.push("/monthly/report-history")}
          >
            <Text text="Cancel" className="font-semibold" />
          </Button>
        </div>
      </div>
    </div>
  );
}
