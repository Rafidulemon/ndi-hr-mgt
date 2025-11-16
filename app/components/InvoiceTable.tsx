import Text from "../components/atoms/Text/Text";

const cellBorder = "border-slate-200 dark:border-slate-700/70";
const accentText = "text-blue-500 dark:text-sky-400";

export function InvoiceTable() {
  return (
    <div className="grid w-full grid-cols-11 overflow-hidden rounded-[28px] border border-white/60 bg-white/85 shadow-inner shadow-indigo-100 transition-colors duration-200 dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-slate-900/60">
      <div className={`col-span-5 flex flex-col gap-0 border-r ${cellBorder}`}>
        <Text
          text="Description"
          className={`w-full border-b ${cellBorder} py-2 text-center text-slate-900 dark:text-slate-100`}
          isBold
        />

        <div className={`grid w-full grid-cols-4 border-b ${cellBorder}`}>
          <Text
            text="Consignment fee"
            className={`col-span-2 w-full border-r ${cellBorder} px-6 py-2 text-slate-700 dark:text-slate-300`}
          />
          <Text
            text="September"
            className={`col-span-1 w-full border-r ${cellBorder} py-2 text-center text-slate-600 dark:text-slate-300`}
          />
        </div>
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
      </div>

      <div className={`col-span-2 flex flex-col gap-0 border-r ${cellBorder}`}>
        <Text
          text="Unit Price"
          className={`w-full border-b ${cellBorder} py-2 text-center text-slate-900 dark:text-slate-100`}
          isBold
        />
        <Text
          text="¥000000"
          className={`col-span-2 w-full border-b ${cellBorder} py-2 text-center ${accentText}`}
          isBold
        />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
      </div>

      <div className={`col-span-2 flex flex-col gap-0 border-r ${cellBorder}`}>
        <Text
          text="Quantity"
          className={`w-full border-b ${cellBorder} py-2 text-center text-slate-900 dark:text-slate-100`}
          isBold
        />
        <Text
          text="1"
          className={`col-span-2 w-full border-b ${cellBorder} py-2 text-center ${accentText}`}
          isBold
        />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
      </div>

      <div className="col-span-2 flex flex-col gap-0">
        <Text
          text="Amount"
          className={`w-full border-b ${cellBorder} py-2 text-center text-slate-900 dark:text-slate-100`}
          isBold
        />
        <Text
          text="¥000000"
          className={`col-span-2 w-full border-b ${cellBorder} py-2 text-center ${accentText}`}
          isBold
        />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
        <div className={`w-full border-b ${cellBorder} py-4`} />
      </div>

      <Text
        text="Subtotal"
        className={`col-span-9 w-full border-b border-r ${cellBorder} px-6 py-2 text-slate-900 dark:text-slate-100`}
        isBold
      />
      <Text
        text="¥000000"
        className={`col-span-2 w-full border-b ${cellBorder} py-2 text-center ${accentText}`}
        isBold
      />

      <Text
        text="Japanese Consumption Tax"
        className={`col-span-9 w-full border-b border-r ${cellBorder} px-6 py-2 text-slate-900 dark:text-slate-100`}
        isBold
      />
      <Text
        text="¥-"
        className={`col-span-2 w-full border-b ${cellBorder} py-2 text-center text-slate-700 dark:text-slate-300`}
        isBold
      />

      <Text
        text="Total"
        className={`col-span-9 w-full border-b border-r ${cellBorder} px-6 py-2 text-slate-900 dark:text-slate-100`}
        isBold
      />
      <Text
        text="¥000000"
        className={`col-span-2 w-full border-b ${cellBorder} py-2 text-center ${accentText}`}
        isBold
      />
    </div>
  );
}
