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
    <div className="w-full flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <Text
          text="Monthly Report History"
          className="font-semibold text-[30px]"
        />
        <div className="h-[46px] w-[250px] bg-primary rounded-md flex justify-between items-center px-[4px]">
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

      <div className="w-full bg-white shadow p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Text text="Monthly Report" className="font-semibold text-[24px]" />
          <Text
            text={`${months[currentMonth]}, ${year}`}
            className="text-text_bold"
          />
        </div>

        <div className="w-full mt-4 grid grid-cols-2 gap-6">
          <div className="col-span-1 flex flex-col gap-12">
            <TextFeild label="Task Done" text="5" />
            <TextFeild label="Story Point" text="20" />
            <TextFeild label="Working Hours" text="80" />
            <Button
              theme="secondary"
              className="w-[185px]"
              onClick={() => navigate.push("/monthly/report")}
            >
              <Text text="Add New Report" className="font-semibold" />
            </Button>
          </div>
          <div className="col-span-1 flex flex-col gap-2">
            <Text
              text="Task Name/ Ticket Number"
              className="text-text_bold font-semibold"
            />
            <div className="flex flex-col gap-1 text-text_primary font-semibold">
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
