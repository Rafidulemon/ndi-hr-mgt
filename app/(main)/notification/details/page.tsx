"use client"
import { EmployeeHeader } from "../../../components/layouts/EmployeeHeader"
import Text from "../../../components/atoms/Text/Text"
import Button from "../../../components/atoms/buttons/Button"
import { useRouter } from "next/navigation";

function NotificationDetails() {
    const navigate = useRouter();
  return (
    <div className="w-full flex flex-col gap-10">
    <EmployeeHeader
      name="Md. Rafidul Islam"
      designation="Software Engineer"
      joining_date="Aug 17, 2023"/>
      
      <div className="w-full md:min-h-[500px] xl:min-h-[680px] bg-white shadow py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2 px-8">
            <Text text="Leave Application Approved" className="text-[24px]" isBold/>
            <Text text="November 27, 2024" className="font-semibold text-text_bold"/>
        </div>
        <hr className="w-full border border-[1px] border-[#7E7D7D]" />
        <div className="my-10 flex flex-col gap-2 px-8 font-semibold text-text_bold">
            <Text text="Your leave application has been approved by HR."/>
            <Text text="Date: 30.12.2024"/>
            <Text text="Leave Type: Sick"/>
        </div>
        <Button theme="secondary" onClick={()=> navigate.push("/notification")} className="px-8 w-[230px]">
            <Text text="Back to Notification" className="font-semibold"/>
        </Button>
      </div>
    </div>
  )
}

export default NotificationDetails
