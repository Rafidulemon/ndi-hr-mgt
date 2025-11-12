import Text from "../../components/atoms/Text/Text";

interface ApplicationPreviewProps {
  userData: {
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    designation: string;
    leave_type: string;
    reason: string;
    from: string;
    to: string;
    date: string;
  };
}

function ApplicationPreview({ userData }: ApplicationPreviewProps) {
  return (
    <div className="bg-white shadow-lg px-6 py-8 w-full max-w-3xl mx-auto">
      <Text
        text="Leave Application"
        className="text-center text-[30px] font-semibold"
      />
      <div className="mt-6 flex flex-col gap-8">
        <div className="flex flex-col gap-0">
          <Text text="Subject: Leave Application" />
          <div className="flex flex-row gap-2">
            <Text text="Date: " />
            <Text text={`${userData.date}`} isBold />
          </div>
        </div>

        <div className="flex flex-col gap-0">
          <Text text="To" />
          <Text text="Shahriar Mahmud" />
          <Text text="HR" />
          <Text text="Demo Company" />
        </div>

        <div className="flex flex-col gap-4">
          <Text text="Dear Sir" />
          <div className="flex flex-col gap-0">
            <Text
              text={
                <>
                  I am writing to request leave from work for 2 days, from{" "}
                  <span className="font-bold">{userData.from}</span> to{" "}
                  <span className="font-bold">{userData.to}</span>.
                </>
              }
            />
            <div className="flex flex-row gap-2">
              <Text text="Leave type: " />
              <Text text={`${userData.leave_type}`} isBold />
            </div>
            <div className="flex flex-row gap-2">
              <Text text="Reason: " />
              <Text text={`${userData.reason}`} isBold />
            </div>
          </div>
          <Text
            className="text-justify"
            text={`During my absence, I will ensure that all my current tasks are completed to the best of my ability. 
            I am also available via ${userData.email} and ${userData.phone} for any urgent matters that may arise during this period.`}
          />

          <Text text="I kindly request you to approve my leave for the mentioned dates." />
        </div>
        <Text text="Thank you for considering my request." />

        <div className="flex flex-col gap-0">
          <Text text="Sincerely," />
          <Text text={userData.name} isBold />
          <div className="flex flex-row gap-2">
            <Text text="ID: " />
            <Text text={`${userData.employeeId}`} isBold />
          </div>
          <div className="flex flex-row gap-2">
            <Text text="Department: " />
            <Text text={`${userData.department}`} isBold />
          </div>
          <Text text="Demo Company" />
        </div>
      </div>
    </div>
  );
}

export default ApplicationPreview;
