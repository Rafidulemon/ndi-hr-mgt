"use client";
import { EmployeeHeader } from "../../../components/layouts/EmployeeHeader";
import Text from "../../../components/atoms/Text/Text";
import Button from "../../../components/atoms/buttons/Button";
import { useRouter } from "next/navigation";

function NotificationDetails() {
  const navigate = useRouter();
  return (
    <div className="flex w-full flex-col gap-10">
      <EmployeeHeader />

      <div className="flex w-full flex-col gap-6 rounded-[32px] border border-white/60 bg-white/85 py-8 shadow-xl shadow-indigo-100 transition-colors duration-200 md:min-h-[500px] xl:min-h-[680px] dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60">
        <div className="flex flex-col gap-2 px-8">
          <Text
            text="Leave Application Approved"
            className="text-[24px] text-slate-900 dark:text-slate-100"
            isBold
          />
          <Text
            text="November 27, 2024"
            className="font-semibold text-text_bold dark:text-slate-300"
          />
        </div>
        <hr className="w-full border border-[1px] border-[#7E7D7D] dark:border-slate-700/60" />
        <div className="my-10 flex flex-col gap-2 px-8 font-semibold text-text_bold dark:text-slate-200">
          <Text text="Your leave application has been approved by HR." />
          <Text text="Date: 30.12.2024" />
          <Text text="Leave Type: Sick" />
        </div>
        <Button
          theme="secondary"
          onClick={() => navigate.push("/notification")}
          className="w-[230px] px-8"
        >
          <Text text="Back to Notification" className="font-semibold" />
        </Button>
      </div>
    </div>
  );
}

export default NotificationDetails;
