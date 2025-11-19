"use client";
import Table from "../../components/atoms/tables/Table";
import { ReactElement, useState } from "react";
import { IoEye } from "react-icons/io5";
import { Modal } from "../../components/atoms/frame/Modal";
import PasswordInput from "../../components/atoms/inputs/PasswordInput";
import { EmployeeHeader } from "../../components/layouts/EmployeeHeader";
import Pagination from "../../components/pagination/Pagination";
import { useRouter } from "next/navigation";

const invoiceTableHeader = ["Month", "Year", "Status", "Action"];

interface Row {
  Month: string;
  Year: string;
  Status: string;
  Action: ReactElement;
  [key: string]: string | ReactElement;
}

const rows: Row[] = [
  {
    Month: "January",
    Year: "2023",
    Status: "Pending",
    Action: <IoEye />,
  },
  {
    Month: "February",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "March",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "April",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "May",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "June",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "July",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "August",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "September",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "October",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "November",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "December",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "June",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "July",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "August",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "September",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "October",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "November",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
  {
    Month: "December",
    Year: "2023",
    Status: "Sent",
    Action: <IoEye />,
  },
];

const dynamicColorValues = [
  {
    columnName: "Status",
    textColors: [
      {
        text: "Pending",
        color: "#D20D0D",
      },
      {
        text: "Sent",
        color: "#046B53",
      },
    ],
  },
];

function InvoicePage() {
  const [currentPageData, setCurrentPageData] = useState<Row[]>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };
  const navigate = useRouter();
  return (
    <div className="flex w-full flex-col gap-10">
      <EmployeeHeader />

      <div className="flex w-full flex-col gap-6 rounded-[32px] border border-white/60 bg-white/85 py-8 shadow-xl shadow-indigo-100 transition-colors duration-200 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60">
        {currentPageData && (
          <Table
            headers={invoiceTableHeader}
            rows={currentPageData}
            onRowClick={handleButtonClick}
            dynamicColorValues={dynamicColorValues}
          />
        )}
        <div>
          <Pagination
            data={rows}
            postsPerPage={15}
            setCurrentPageData={setCurrentPageData}
          />
        </div>
      </div>

      <Modal
        title="Enter Password"
        className="w-[40%]"
        open={isModalOpen}
        setOpen={setIsModalOpen}
        isDoneButton
        doneButtonText="Confirm"
        isCancelButton
        cancelButtonText="Cancel"
        buttonWidth="120px"
        buttonHeight="40px"
        onDoneClick={() => navigate.push("/invoice/details")}
        closeOnClick={() => setIsModalOpen(false)}
        crossOnClick={() => setIsModalOpen(false)}
      >
        <PasswordInput label="Please enter password to view Invoice" />
      </Modal>
    </div>
  );
}

export default InvoicePage;
