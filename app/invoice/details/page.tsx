"use client"
import { EmployeeHeader } from "../../components/layouts/EmployeeHeader";
import Text from "../../components/atoms/Text/Text";
import { InvoiceTable } from "../InvoiceTable";
import Button from "../../components/atoms/buttons/Button";
import { useRouter } from "next/navigation";

function InvoiceDetails() {
  const navigate = useRouter();
  return (
    <div className="w-full flex flex-col gap-10">
      <EmployeeHeader
        name="Md. Rafidul Islam"
        designation="Software Engineer"
        joining_date="Aug 17, 2023"
      />

      <div className="w-full bg-white shadow-lg py-8 flex flex-col gap-6">
        <div className="flex justify-between items-center gap-2 px-8">
          <div>
            <Text text="Invoice" className="text-[24px]" isBold />
            <Text
              text="November 27, 2024"
              className="font-semibold text-text_bold"
            />
          </div>
          <Button
            onClick={() => navigate.push("/invoice")}
            className="w-[230px] pb-[10px]"
            theme="primary"
          >
            Back To Invoice List
          </Button>
        </div>
        <hr className="w-full border border-[1px] border-[#7E7D7D]" />
        <div className="flex flex-col gap-2 text-[14px]">
          <div className="w-full grid grid-cols-2 gap-6 px-8">
            <div className="col-span-1 flex flex-col gap-6">
              <div className="max-w-[154px]">
                <img
                  src="/demo_logo.png"
                  className="cursor-pointer w-full mt-2"
                  alt="Logo"
                />
              </div>
              <div className="w-full grid grid-cols-2">
                <div className="col-span-1 flex flex-col gap-2">
                  <Text text="Project:" />
                  <Text text="Total (incl. TAX):" />
                  <Text text="Payment Due:" />
                </div>
                <div className="col-span-1 flex flex-col gap-2">
                  <Text
                    text="Business Consignment Fee"
                    className="text-text_bold"
                  />
                  <Text
                    text="$000000"
                    className="font-semibold text-blue-500"
                  />
                  <Text
                    text="Md. Rafidul Islam"
                    className="font-semibold text-blue-500"
                  />
                </div>
              </div>
              <hr className="w-full border border-[1px] border-[#7E7D7D]" />
              <Text
                text="Thank you for your Business."
                className="text-text_bold"
              />
              <div className="-mt-4 flex flex-row gap-1">
                <Text
                  text="If you have any questions about this invoice, please contact:"
                  className="text-text_bold"
                />
                <Text
                  text="rafidulemon@gmail.com"
                  className="font-semibold text-blue-500"
                />
              </div>
            </div>
            <div className="w-full grid grid-cols-2">
              <div className="col-span-1 flex flex-col gap-2">
                <Text text="Address:" />
                <Text text="Tel:" />
                <Text text="Name:" />
              </div>
              <div className="col-span-1 flex flex-col gap-2">
                <Text
                  text="Patiya-4370, Chittagong"
                  className="font-semibold text-blue-500"
                />
                <Text
                  text="+880165416554"
                  className="font-semibold text-blue-500"
                />
                <Text
                  text="Md. Rafidul Islam"
                  className="font-semibold text-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="w-full my-6">
            <InvoiceTable />
          </div>
          <Text
            text="Transfer Account (Please pay the transfer fee at your company.)"
            className="px-8 text-text_bold font-medium"
          />
          <div className="w-full grid grid-cols-2 gap-6 px-8">
            <div className="col-span-1 flex flex-col gap-6">
              <div className="w-full grid grid-cols-2">
                <div className="col-span-1 flex flex-col gap-2">
                  <Text text="Beneficiary Bank:" />
                  <Text text="Bank Routing Number:" />
                  <Text text="Branch Name:" />
                </div>
                <div className="col-span-1 flex flex-col gap-2">
                  <Text
                    text="Eastern Bank Ltd."
                    className="text-text_bold font-semibold text-blue-500"
                  />
                  <Text
                    text="132465469465"
                    className="font-semibold text-blue-500"
                  />
                  <Text
                    text="Gulshan Avenue Branch"
                    className="font-semibold text-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-2">
              <div className="col-span-1 flex flex-col gap-2">
                <Text text="Account No:" />
                <Text text="Account Name:" />
              </div>
              <div className="col-span-1 flex flex-col gap-2">
                <Text
                  text="132465469465"
                  className="font-semibold text-blue-500"
                />
                <Text
                  text="Md. Rafidul Islam"
                  className="font-semibold text-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetails;
