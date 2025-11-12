"use client"
import { useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Table from "../../../components/atoms/tables/Table";
import Text from "../../../components/atoms/Text/Text";
import Pagination from "../../../components/pagination/Pagination";
import { months } from "../../../utils/dateAndMonth";
const attendenceTableHeader = [
  "Date",
  "Day of the week",
  "Start Time",
  "End Time",
  "Start Time2",
  "End Time2",
  "Working Hours",
];

interface Row {
  Date: string;
  "Day of the week": string;
  "Start Time": string;
  "End Time": string;
  "Start Time2": string;
  "End Time2": string;
  "Working Hours": string;
  [key: string]: string | number;
}

const rows: Row[] = [
  {
    Date: "01/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "02/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "03/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "04/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "05/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "06/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "07/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "08/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "09/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "10/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "11/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "12/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "13/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "14/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "15/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "16/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "17/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },

  {
    Date: "18/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "19/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },

  {
    Date: "20/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "21/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },

  {
    Date: "22/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "23/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "24/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "25/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "26/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },

  {
    Date: "27/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
  {
    Date: "28/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },

  {
    Date: "29/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },

  {
    Date: "30/11",
    "Day of the week": "Friday",
    "Start Time": "08:30:00",
    "End Time": "12:30:00",
    "Start Time2": "13:30:00",
    "End Time2": "17:30:00",
    "Working Hours": "8:00",
  },
];

export default function AttendanceHistory() {
  const date = new Date();
  const currentMonthIndex = date.getMonth();
  const [currentMonth, setCurrentMonth] = useState<number>(currentMonthIndex);
  const [currentPageData, setCurrentPageData] = useState<Row[]>();

  const preMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <Text text="Attendance History" className="font-semibold text-[30px]" />
        <div className="h-[46px] w-[250px] bg-primary rounded-md flex justify-between items-center px-[4px]">
          <MdKeyboardArrowLeft
            size={20}
            color="white"
            className="cursor-pointer"
            onClick={preMonth}
          />
          <Text
            text={months[currentMonth]}
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

      <div className="mt-[20px]">
        {currentPageData && (
          <Table
            headers={attendenceTableHeader}
            rows={currentPageData}
            className="shadow-lg py-6"
            isTextCenter
          />
        )}
      </div>

      <div>
        <Pagination
          data={rows}
          postsPerPage={10}
          setCurrentPageData={setCurrentPageData}
        />
      </div>
    </div>
  );
}
