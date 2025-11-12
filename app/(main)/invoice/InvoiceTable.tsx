import Text from "../../components/atoms/Text/Text";
export function InvoiceTable() {
  return (
    <div className="bg-white overflow-x-auto border-t border-text_primary w-full grid grid-cols-11">
      <div className="col-span-5 border-r border-text_primary flex flex-col gap-0">
        <Text text="Description" className="border-b border-text_primary py-2 w-full text-center" isBold/>

        <div className="w-full border-b border-text_primary grid grid-cols-4">
          <Text text="Consignment fee" className="col-span-2 border-r border-text_primary py-2 w-full px-6" />
          <Text text="September" className="col-span-1 border-r border-text_primary py-2 w-full text-center" />
        </div>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
      </div>

      <div className="col-span-2 border-r border-text_primary flex flex-col gap-0">
        <Text text="Unit Price" className="border-b border-text_primary py-2 w-full text-center" isBold/>
        <Text text="¥000000" className="col-span-2 border-b border-text_primary py-2 w-full text-center text-blue-500" isBold/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
      </div>

      <div className="col-span-2 border-r border-text_primary flex flex-col gap-0">
        <Text text="Quantity" className="border-b border-text_primary py-2 w-full text-center" isBold/>
        <Text text="1" className="col-span-2 border-b border-text_primary py-2 w-full text-center text-blue-500" isBold/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
      </div>
      
      <div className="col-span-2 flex flex-col gap-0">
        <Text text="Amount" className="border-b border-text_primary py-2 w-full text-center" isBold/>
        <Text text="¥000000" className="col-span-2 border-b border-text_primary py-2 w-full text-center text-blue-500" isBold/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
        <div className="border-b border-text_primary py-4 w-full"/>
      </div>

      <Text text="Subtotal" className="col-span-9 border-b border-r border-text_primary py-2 w-full px-6" isBold/>
      <Text text="¥000000" className="col-span-2 border-b border-text_primary py-2 w-full text-center text-blue-500 " isBold/>

      <Text text="Japanese Consumption Tax" className="col-span-9 border-b border-r border-text_primary py-2 w-full px-6" isBold/>
      <Text text="¥-" className="col-span-2 border-b border-text_primary py-2 w-full text-center" isBold/>

      <Text text="Total" className="col-span-9 border-b border-r border-text_primary py-2 w-full px-6" isBold/>
      <Text text="¥000000" className="col-span-2 border-b border-text_primary py-2 w-full text-center text-blue-500 " isBold/>
    </div>
  );
}
