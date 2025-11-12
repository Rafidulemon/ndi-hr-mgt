"use client"
import { ReactElement, useState } from "react";
import { EmployeeHeader } from "../../components/layouts/EmployeeHeader";
import Table from "../../components/atoms/tables/Table";
import Pagination from "../../components/pagination/Pagination";
import { IoEye } from "react-icons/io5";
import { useRouter } from "next/navigation";

const notificationTableHeader = ["Date", "Notification", "From", "Action"];

interface Row {
  Date: string;
  Notification: string;
  From: string;
  Action: ReactElement;
  [key: string]: string | ReactElement;
}

const rows: Row[] = [
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
  {
    Date: "2022-01-01",
    Notification: "Notification 1",
    From: "John Doe",
    Action: <IoEye />,
  },
];

function NotificationPage() {
  const [currentPageData, setCurrentPageData] = useState<Row[]>();
  const navigate = useRouter();
  return (
    <div className="flex w-full flex-col gap-10">
      <EmployeeHeader
        name="Md. Rafidul Islam"
        designation="Software Engineer"
        joining_date="Aug 17, 2023"
      />

      <div className="flex w-full flex-col gap-6 rounded-[32px] border border-white/60 bg-white/85 py-8 shadow-xl shadow-indigo-100 transition-colors duration-200 md:min-h-[500px] xl:min-h-[680px] dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60">
        {currentPageData && (
          <Table
            headers={notificationTableHeader}
            rows={currentPageData}
            onRowClick={() => navigate.push("/notification/details")}
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
    </div>
  );
}

export default NotificationPage;
