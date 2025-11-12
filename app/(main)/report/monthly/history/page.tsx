"use client"
import { useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Text from "@/app/components/atoms/Text/Text";
import { useRouter } from "next/navigation";
import TextFeild from "@/app/components/atoms/TextFeild/TextFeild";
import { months } from "@/app/utils/dateAndMonth";
import Button from "@/app/components/atoms/buttons/Button";

function MonthlyHistory() {
  const navigate = useRouter();
  const date = new Date();
  const currentMonthIndex = date.getMonth();
  const currentYear = date.getFullYear();
  const [currentMonth, setCurrentMonth] = useState<number>(currentMonthIndex);
  const [year, setYear] = useState<number>(currentYear);

  const preMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="flex items-center justify-between">
        <Text
          text="Monthly Report History"
          className="text-[30px] font-semibold text-slate-900 dark:text-slate-100"
        />
        <div className="flex h-[46px] w-[250px] items-center justify-between rounded-md bg-primary px-[4px] text-white shadow-sm shadow-indigo-200 transition-colors duration-200 dark:bg-sky-600 dark:shadow-sky-900/50">
          <MdKeyboardArrowLeft
            size={20}
            color="white"
            className="cursor-pointer"
            onClick={preMonth}
          />
          <Text
            text={`${months[currentMonth]}, ${year}`}
            className="text-[16px] font-semibold text-white"
          />
          <MdKeyboardArrowRight
            size={20}
            color="white"
            className="cursor-pointer"
            onClick={nextMonth}
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 rounded-[32px] border border-white/60 bg-white/85 p-8 shadow-xl shadow-indigo-100 transition-colors duration-200 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60">
        <div className="flex flex-col gap-2">
          <Text
            text="Monthly Report"
            className="text-[24px] font-semibold text-slate-900 dark:text-slate-100"
          />
          <Text
            text={`${months[currentMonth]}, ${year}`}
            className="text-text_bold dark:text-slate-300"
          />
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-1 flex flex-col gap-12">
            <TextFeild
              label="Task Done"
              text="5"
              className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70"
            />
            <TextFeild
              label="Story Point"
              text="20"
              className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70"
            />
            <TextFeild
              label="Working Hours"
              text="80"
              className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/70"
            />
            <Button
              theme="secondary"
              className="w-[185px]"
              onClick={() => navigate.push("/report/monthly")}
            >
              <Text text="Add New Report" className="font-semibold" />
            </Button>
          </div>
          <div className="col-span-1 flex flex-col gap-2">
            <Text
              text="Task Name/ Ticket Number"
              className="font-semibold text-text_bold dark:text-slate-200"
            />
            <div className="flex flex-col gap-1 font-semibold text-text_primary dark:text-slate-300">
              <Text text="Task-1" />
              <Text text="Task-2" />
              <Text text="Task-3" />
              <Text text="Task-4" />
              <Text text="Task-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyHistory;
