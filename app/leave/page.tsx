"use client"
import { useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Table from "../components/atoms/tables/Table";
import Text from "../components/atoms/Text/Text";
import { useRouter } from "next/navigation";
import { EmployeeHeader } from "../components/layouts/EmployeeHeader";

export default function EmployeeLeavePage() {
  const [year, setYear] = useState(2021);
  const navigate = useRouter()
  const handleButtonClick = () => {
    navigate.push("/leave/application")
  }

  const headers = [
    "Application Id",
    "Application Date",
    "Leave Type",
    "Form",
    "To",
    "Status",
  ];
  const rows = [
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Waiting",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Pending",
    },
    {
      "Application Id": "10001",
      "Application Date": "10/12/2024",
      "Leave Type": "Casual",
      Form: "15/12/2024",
      To: "17/12/2024",
      Status: "Waiting",
    },
  ];

  const dynamicColorValues = [
    {
      columnName: "Status",
      textColors: [
        {
          text: "Pending",
          color: "#835600",
        },
        {
          text: "Approved",
          color: "#046B53",
        },
        {
          text: "Denied",
          color: "#D20D0D",
        },
        {
          text: "Pending",
          color: "#835600",
        },

        {
          text: "Waiting",
          color: "#8200E9",
        },
      ],
    },
  ];

  const decrementYear = () => {
    setYear((prevYear) => prevYear - 1);
  };

  const incrementYear = () => {
    setYear((prevYear) => prevYear + 1);
  };
  return (
    <div>
      <EmployeeHeader
        name="Md. Rafidul Islam"
        designation="Software Engineer"
        joining_date="Aug 17, 2023"
        hasRightButton
        buttonText="Leave Application"
        onButtonClick={handleButtonClick}
      />

      <div className="flex flex-col gap-[100px] bg-white mt-10 py-12 px-4">
        <div className="flex flex-col gap-[40px]">
          <div className="flex justify-center items-center">
            <div className="h-[46px] w-[194px] border border-primary flex justify-between items-center px-[4px]">
              <MdKeyboardArrowLeft
                size={19}
                color="#0dbad2"
                className="cursor-pointer"
                onClick={decrementYear}
              />
              <Text
                text={year.toString()}
                className="text-[16px] font-semibold text-primary"
              />
              <MdKeyboardArrowRight
                size={19}
                color="#0dbad2"
                className="cursor-pointer"
                onClick={incrementYear}
              />
            </div>
          </div>

          <div className="flex flex-col gap-[20px] justify-center items-center">
            <Text text="Leave History" className="text-[18px] font-semibold" />
            <div className="w-[300px] flex  justify-between">
              <div className="flex flex-col gap-[10px]">
                <Text
                  text="Type"
                  className="text-[16px] font-semibold mb-[10px]"
                />
                <Text
                  text="Casual"
                  className="text-[16px] font-semibold text-[#555454]"
                />
                <Text
                  text="Sick"
                  className="text-[16px] font-semibold text-[#555454]"
                />

                <Text
                  text="Annual"
                  className="text-[16px] font-semibold text-[#555454]"
                />

                <Text
                  text="paternity/Maternity"
                  className="text-[16px] font-semibold text-[#555454]"
                />
              </div>

              <div className="flex flex-col gap-[10px]">
                <Text
                  text="Amount"
                  className="text-[16px] font-semibold mb-[10px]"
                />
                <Text
                  text="15"
                  className="text-[16px] font-semibold text-[#555454] text-center"
                />
                <Text
                  text="10"
                  className="text-[16px] font-semibold text-[#555454] text-center"
                />
                <Text
                  text="08"
                  className="text-[16px] font-semibold text-[#555454] text-center"
                />
                <Text
                  text="30"
                  className="text-[16px] font-semibold text-[#555454] text-center "
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <Table
            headers={headers}
            rows={rows}
            dynamicColorValues={dynamicColorValues}
            isTextCenter
          />
        </div>
      </div>
    </div>
  );
}
