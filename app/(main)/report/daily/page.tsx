"use client"
import { useState } from "react";
import Text from "@/app/components/atoms/Text/Text";
import Button from "@/app/components/atoms/buttons/Button";
import { useRouter } from "next/navigation";

import { MdDeleteForever } from "react-icons/md";
import TextInput from "@/app/components/atoms/inputs/TextInput";
import SelectBox from "@/app/components/atoms/selectBox/SelectBox";
import { EmployeeHeader } from "@/app/components/layouts/EmployeeHeader";

function DailyReportPage() {
  const navigate = useRouter();
  const today = new Date();
  const day = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const options = [
    { label: "Project", value: "project" },
    { label: "Design", value: "design" },
    { label: "Development", value: "development" },
    { label: "Testing", value: "testing" },
  ];

  const [reports, setReports] = useState([
    {
      id: 1,
      workType: "",
      taskName: "",
      others: "",
      details: "",
      workingHours: "",
    },
  ]);

  const handleAddReport = () => {
    setReports((prevReports) => [
      ...prevReports,
      {
        id: prevReports.length + 1,
        workType: "",
        taskName: "",
        others: "",
        details: "",
        workingHours: "",
      },
    ]);
  };

  const handleDeleteReport = (id: number) => {
    setReports((prevReports) =>
      prevReports.filter((report) => report.id !== id)
    );
  };

  return (
    <div className="flex w-full flex-col gap-10">
      <EmployeeHeader
        hasRightButton
        buttonText="History"
        onButtonClick={() => navigate.push("/report/daily/history")}
      />
      <div className="flex w-full flex-col gap-6 rounded-[32px] border border-white/60 bg-white/85 p-8 shadow-xl shadow-indigo-100 transition-colors duration-200 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60">
        <div className="mb-6 flex flex-col gap-2">
          <Text
            text="Daily Report"
            className="text-[24px] font-semibold text-slate-900 dark:text-slate-100"
          />
          <Text
            text={day}
            className="text-text_primary dark:text-slate-300"
          />
        </div>

        {reports.map((report, index) => (
          <div
            key={report.id}
            className="relative mb-6 grid w-full grid-cols-1 gap-6 border-b border-slate-200 pb-6 transition-colors duration-200 md:grid-cols-2 dark:border-slate-700/60"
          >
            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => handleDeleteReport(report.id)}
                className="text-[30px] text-slate-400 transition-colors duration-150 hover:text-red-500 dark:text-slate-500"
                aria-label={`Delete Report ${index + 1}`}
              >
                <MdDeleteForever />
              </button>
            </div>
            <SelectBox
              label={`Work Type ${index + 1}`}
              options={options}
              isRequired
              name={`work-${report.id}`}
            />
            <TextInput
              label={`Task Name ${index + 1}`}
              placeholder="Enter task name"
            />
            <TextInput label={`Others ${index + 1}`} />
            <TextInput
              label={`Details ${index + 1}`}
              placeholder="Enter details of the task"
              isRequired
            />
            <TextInput
              label={`Working Hours ${index + 1}`}
              placeholder="Enter working hour"
              isRequired
            />
          </div>
        ))}

        <Button
          theme="secondary"
          className="w-[185px]"
          onClick={handleAddReport}
        >
          <Text text="Add New Report" className="font-semibold" />
        </Button>

        <div className="mt-10 flex w-full flex-row gap-6">
          <Button type="submit" className="w-[185px]">
            <Text text="Submit" className="font-semibold" />
          </Button>
          <Button
            theme="cancel"
            className="w-[185px]"
            onClick={() => navigate.push("/report/daily/history")}
          >
            <Text text="Cancel" className="font-semibold" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DailyReportPage;
