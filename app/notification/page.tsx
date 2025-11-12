"use client"
import { ReactElement, useState } from "react";
import { EmployeeHeader } from "../components/layouts/EmployeeHeader";
import Table from "../components/atoms/tables/Table";
import Pagination from "../components/pagination/Pagination";
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
    <div className="w-full flex flex-col gap-10">
      <EmployeeHeader
        name="Md. Rafidul Islam"
        designation="Software Engineer"
        joining_date="Aug 17, 2023"
      />

      <div className="w-full md:min-h-[500px] xl:min-h-[680px] bg-white shadow py-8 flex flex-col gap-6">
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
