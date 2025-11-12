"use client"
import Text from "../components/atoms/Text/Text";
import Button from "../components/atoms/buttons/Button";
import { useState, useEffect } from "react";
import { Modal } from "../components/atoms/frame/Modal";
import { EmployeeHeader } from "../components/layouts/EmployeeHeader";
import { useRouter } from "next/navigation";

function AttendancePage() {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
  const [isBreakOver, setIsBreakOver] = useState<boolean>(false);
  const [isLeaved, setIsLeaved] = useState<boolean>(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);

  const [workTime, setWorkTime] = useState<number>(0);
  const [breakTime, setBreakTime] = useState<number>(0);

  const [workInterval, setWorkInterval] = useState<NodeJS.Timeout | null>(null);
  const [breakInterval, setBreakInterval] = useState<NodeJS.Timeout | null>(null);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const navigate = useRouter();
  const handleButtonClick = () => {
    navigate.push("/attendance/history")
  }

  const handleStart = () => {
    setIsStarted(true);
    setWorkInterval(
      setInterval(() => {
        setWorkTime((prev) => prev + 1);
      }, 1000)
    );
  };

  const handleBreak = () => {
    setIsBreakTime(true);

    if (workInterval) clearInterval(workInterval);

    setBreakInterval(
      setInterval(() => {
        setBreakTime((prev) => prev + 1);
      }, 1000)
    );
  };

  const handleBreakOver = () => {
    setIsBreakOver(true);

    if (breakInterval) clearInterval(breakInterval);

    setWorkInterval(
      setInterval(() => {
        setWorkTime((prev) => prev + 1);
      }, 1000)
    );
  };

  const handleLeave = () => {
    setIsLeaved(true);
    setIsLeaveModalOpen(false)

    if (workInterval) clearInterval(workInterval);
    if (breakInterval) clearInterval(breakInterval);
  };


  useEffect(() => {
    return () => {
      if (workInterval) clearInterval(workInterval);
      if (breakInterval) clearInterval(breakInterval);
    };
  }, [workInterval, breakInterval]);

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col gap-6 justify-center items-center">
      <EmployeeHeader
        name="Md. Rafidul Islam"
        designation="Software Engineer"
        joining_date="Aug 17, 2023"
        hasRightButton
        buttonText="Attendance History"
        onButtonClick={handleButtonClick}
      />
      <div className={`md:w-[60%] lg:w-[40%] h-[100%] flex flex-col gap-10 ${!isLeaved ? "justify-start" : "justify-center"} items-center`}>
        <Text
          text="Today’s Total Working Time"
          className="mt-12 font-semibold text-[24px]"
        />
        {!isStarted ? (
          <div className="w-full h-full mt-[30%]">
            <Button theme="primary" onClick={handleStart} className="w-full">
              <Text text="Start Working" className="py-1" />
            </Button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-10 items-center">
            {!isLeaved && (
              <div className="flex flex-row gap-4 text-[40px] font-semibold text-text_primary">
                <Text text={formatTime(workTime)} />
              </div>
            )}
            {!isLeaved && (
              <Text text="Lunch Break" className="font-semibold text-[24px]" />
            )}
            {!isLeaved && isBreakTime && (
              <>
                <div className="flex flex-row gap-4 text-[40px] font-semibold text-text_primary">
                  <Text text={formatTime(breakTime)} />
                </div>
              </>
            )}

            <div className="w-full flex flex-row gap-4 justify-center">
              {!isBreakTime && !isLeaved && !isBreakOver &&(
                <Button
                  theme="secondary"
                  onClick={handleBreak}
                  className="w-[220px]"
                >
                  Start
                </Button>
              )}
              {!isBreakOver && !isLeaved && (
                <Button
                  theme="cancel-secondary"
                  onClick={handleBreakOver}
                  className="w-[220px]"
                >
                  End
                </Button>
              )}
            </div>
            
            {!isLeaved ? (
              <Button theme="cancel" className="w-full" onClick={() => setIsLeaveModalOpen(true)}>
                <Text text="Leave" className="py-1" />
              </Button>
            ) : (
              <div className="flex flex-col gap-4 text-center">
                <div className="text-[40px] font-semibold text-text_primary">
                  <Text text={formatTime(workTime - breakTime)} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        doneButtonText="Leave"
        cancelButtonText="Cancel"
        isCancelButton
        className="h-auto w-[40%]"
        open={isLeaveModalOpen}
        setOpen={setIsLeaveModalOpen}
        title="Are you sure?"
        titleTextSize="text-[24px]"
        buttonWidth="120px"
        buttonHeight="40px"
        onDoneClick={() => handleLeave()}
        closeOnClick={() => setIsLeaveModalOpen(false)}
      >
        <Text text="Are you sure to leave from work for today?" className="my-6 text-[24px] font-semibold text-text_primary"/>
      </Modal>
    </div>
  );
}

export default AttendancePage;
