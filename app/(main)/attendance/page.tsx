"use client"
import Text from "../../components/atoms/Text/Text";
import Button from "../../components/atoms/buttons/Button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "../../components/atoms/frame/Modal";
import { EmployeeHeader } from "../../components/layouts/EmployeeHeader";
import { useRouter } from "next/navigation";
import DashboardLoadingIndicator from "../../components/dashboard/DashboardLoadingIndicator";
import { trpc } from "@/trpc/client";

const STORAGE_KEY = "ndi.attendance.timer.v1";

type TimerState = {
  dateKey: string;
  hasStarted: boolean;
  isOnBreak: boolean;
  isLeaved: boolean;
  workSeconds: number;
  breakSeconds: number;
  workTimerStartedAt: number | null;
  breakTimerStartedAt: number | null;
};

const getTodayKey = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const buildInitialState = (dateKey = getTodayKey()): TimerState => ({
  dateKey,
  hasStarted: false,
  isOnBreak: false,
  isLeaved: false,
  workSeconds: 0,
  breakSeconds: 0,
  workTimerStartedAt: null,
  breakTimerStartedAt: null,
});

const ensureTodayState = (state: TimerState): TimerState => {
  if (state.dateKey === getTodayKey()) {
    return state;
  }
  return buildInitialState();
};

const isInitialTimerState = (state: TimerState) =>
  !state.hasStarted &&
  !state.isOnBreak &&
  !state.isLeaved &&
  state.workSeconds === 0 &&
  state.breakSeconds === 0 &&
  state.workTimerStartedAt === null &&
  state.breakTimerStartedAt === null;

const computeLiveSeconds = (total: number, startedAt: number | null, now = Date.now()) => {
  if (!startedAt) return total;
  const diff = Math.floor((now - startedAt) / 1000);
  return total + (diff > 0 ? diff : 0);
};

const computeWorkSeconds = (state: TimerState) =>
  computeLiveSeconds(state.workSeconds, state.workTimerStartedAt);

const computeBreakSeconds = (state: TimerState) =>
  computeLiveSeconds(state.breakSeconds, state.breakTimerStartedAt);

const finalizeWorkSeconds = (state: TimerState, now: number) =>
  computeLiveSeconds(state.workSeconds, state.workTimerStartedAt, now);

const finalizeBreakSeconds = (state: TimerState, now: number) =>
  computeLiveSeconds(state.breakSeconds, state.breakTimerStartedAt, now);

const readStoredState = (): TimerState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimerState;
    if (parsed.dateKey !== getTodayKey()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const formatDisplayDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);

const formatDisplayTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

function AttendancePage() {
  const [timerState, setTimerState] = useState<TimerState>(() => buildInitialState());
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [workDisplaySeconds, setWorkDisplaySeconds] = useState<number>(() =>
    computeWorkSeconds(timerState),
  );
  const [breakDisplaySeconds, setBreakDisplaySeconds] = useState<number>(() =>
    computeBreakSeconds(timerState),
  );
  const [now, setNow] = useState<Date>(() => new Date());
  const stateRef = useRef<TimerState>(timerState);
  const startDayMutation = trpc.attendance.startDay.useMutation();
  const completeDayMutation = trpc.attendance.completeDay.useMutation();
  const todayAttendanceQuery = trpc.attendance.today.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  const formatTime = (time: number) => {
    const safeTime = Math.max(0, time);
    const hours = Math.floor(safeTime / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((safeTime % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (safeTime % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const persistState = useCallback((state: TimerState) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore write errors
    }
  }, []);

  const updateTimerState = useCallback(
    (updater: (prev: TimerState) => TimerState) => {
      setTimerState((prev) => {
        const normalized = ensureTodayState(prev);
        const next = updater(normalized);
        stateRef.current = next;
        persistState(next);
        return next;
      });
    },
    [persistState],
  );

  const resetTimerState = useCallback(() => {
    const initial = buildInitialState();
    stateRef.current = initial;
    setTimerState(initial);
    setWorkDisplaySeconds(0);
    setBreakDisplaySeconds(0);
    persistState(initial);
  }, [persistState]);

  useEffect(() => {
    stateRef.current = timerState;
  }, [timerState]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = readStoredState();
    if (!stored) return;
    stateRef.current = stored;
    /* eslint-disable react-hooks/set-state-in-effect */
    // Hydration-safe: we intentionally sync client state to match persisted data after mount.
    setTimerState(stored);
    setWorkDisplaySeconds(computeWorkSeconds(stored));
    setBreakDisplaySeconds(computeBreakSeconds(stored));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (todayAttendanceQuery.isFetching || todayAttendanceQuery.isPending) {
      return;
    }
    const record = todayAttendanceQuery.data?.record;
    if (!record && !isInitialTimerState(stateRef.current)) {
      // No server record for today; ensure client timer is reset so user can start again.
      /* eslint-disable react-hooks/set-state-in-effect */
      resetTimerState();
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [todayAttendanceQuery.data, todayAttendanceQuery.isFetching, todayAttendanceQuery.isPending, resetTimerState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tick = () => {
      const current = stateRef.current;
      if (current.dateKey !== getTodayKey()) {
        const resetState = buildInitialState();
        stateRef.current = resetState;
        setTimerState(resetState);
        persistState(resetState);
        setWorkDisplaySeconds(0);
        setBreakDisplaySeconds(0);
        return;
      }
      setWorkDisplaySeconds(computeWorkSeconds(current));
      setBreakDisplaySeconds(computeBreakSeconds(current));
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [persistState]);

  const navigate = useRouter();
  const handleButtonClick = () => {
    navigate.push("/attendance/history");
  };
  const hasExistingServerAttendance = Boolean(todayAttendanceQuery.data?.record);

  const isInitialLoading = todayAttendanceQuery.isLoading || todayAttendanceQuery.isPending;
  const hasError = todayAttendanceQuery.isError;
  const refetchToday = () => {
    void todayAttendanceQuery.refetch();
  };

  const handleStart = async () => {
    const currentState = stateRef.current;
    if (currentState.hasStarted && !currentState.isLeaved) {
      return;
    }
    if (startDayMutation.isPending || hasExistingServerAttendance) {
      return;
    }

    try {
      await startDayMutation.mutateAsync();
      const now = Date.now();
      updateTimerState(() => ({
        ...buildInitialState(),
        hasStarted: true,
        workTimerStartedAt: now,
      }));
      await todayAttendanceQuery.refetch();
    } catch (error) {
      console.error("Failed to start attendance", error);
    }
  };

  const handleBreak = () => {
    const now = Date.now();
    updateTimerState((prev) => {
      if (!prev.hasStarted || prev.isOnBreak || prev.isLeaved) {
        return prev;
      }
      return {
        ...prev,
        workSeconds: finalizeWorkSeconds(prev, now),
        workTimerStartedAt: null,
        isOnBreak: true,
        breakTimerStartedAt: now,
      };
    });
  };

  const handleBreakOver = () => {
    const now = Date.now();
    updateTimerState((prev) => {
      if (!prev.isOnBreak || prev.isLeaved) {
        return prev;
      }
      return {
        ...prev,
        breakSeconds: finalizeBreakSeconds(prev, now),
        breakTimerStartedAt: null,
        isOnBreak: false,
        workTimerStartedAt: now,
      };
    });
  };

  const handleLeave = async () => {
    if (completeDayMutation.isPending) {
      return;
    }

    setIsLeaveModalOpen(false);
    const now = Date.now();
    const currentState = stateRef.current;

    if (!currentState.hasStarted || currentState.isLeaved) {
      return;
    }

    const finalWorkSeconds = finalizeWorkSeconds(currentState, now);
    const finalBreakSeconds = finalizeBreakSeconds(currentState, now);

    updateTimerState((prev) => {
      if (!prev.hasStarted || prev.isLeaved) {
        return prev;
      }
      return {
        ...prev,
        workSeconds: finalWorkSeconds,
        breakSeconds: finalBreakSeconds,
        workTimerStartedAt: null,
        breakTimerStartedAt: null,
        isOnBreak: false,
        isLeaved: true,
      };
    });

    try {
      await completeDayMutation.mutateAsync({
        workSeconds: finalWorkSeconds,
        breakSeconds: finalBreakSeconds,
      });
      await todayAttendanceQuery.refetch();
    } catch (error) {
      console.error("Failed to complete attendance", error);
    }
  };

  const isStarted = timerState.hasStarted;
  const isOnBreak = timerState.isOnBreak;
  const isLeaved = timerState.isLeaved;
  const formattedTodayDate = formatDisplayDate(now);
  const formattedCurrentTime = formatDisplayTime(now);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (isInitialLoading) {
    return (
      <DashboardLoadingIndicator
        fullscreen
        label="Loading attendance"
        helper="Fetching today’s log and timer state."
      />
    );
  }

  if (hasError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <Text
          text="We couldn’t load your attendance right now."
          className="text-lg text-text_primary"
        />
        <Button onClick={refetchToday} disabled={todayAttendanceQuery.isFetching}>
          <Text
            text={todayAttendanceQuery.isFetching ? "Refreshing..." : "Try again"}
            className="font-semibold"
          />
        </Button>
      </div>
    );
  }

  const showInlineLoader =
    todayAttendanceQuery.isFetching ||
    startDayMutation.isPending ||
    completeDayMutation.isPending;

  const inlineLoaderLabel = startDayMutation.isPending
    ? "Starting your workday..."
    : completeDayMutation.isPending
      ? "Wrapping up your hours..."
      : "Syncing attendance...";

  return (
    <div className="relative flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center gap-6">
      <EmployeeHeader
        name="Md. Rafidul Islam"
        designation="Software Engineer"
        joining_date="Aug 17, 2023"
        hasRightButton
        buttonText="Attendance History"
        onButtonClick={handleButtonClick}
      />
      <div className={`md:w-[60%] lg:w-[40%] h-[100%] flex flex-col gap-10 ${!isLeaved ? "justify-start" : "justify-center"} items-center`}>
        <div className="flex flex-col items-center text-center gap-1">
          <Text text={formattedTodayDate} className="text-lg font-semibold" />
          <Text text={formattedCurrentTime} className="text-sm text-text_secondary" />
        </div>
        <Text
          text="Today’s Total Working Time"
          className="mt-12 font-semibold text-[24px]"
        />
        {!isStarted ? (
          <div className="w-full h-full mt-[30%]">
            <Button
              theme="primary"
              onClick={() => void handleStart()}
              className="w-full"
              disabled={startDayMutation.isPending || hasExistingServerAttendance}
            >
              <Text text="Start Working" className="py-1" />
            </Button>
            {hasExistingServerAttendance && (
              <Text
                text="You have already submitted today’s attendance."
                className="mt-4 text-sm text-amber-600"
              />
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-10 items-center">
            {!isLeaved && (
              <div className="flex flex-row gap-4 text-[40px] font-semibold text-text_primary">
                <Text text={formatTime(workDisplaySeconds)} />
              </div>
            )}
            {!isLeaved && (
              <Text text="Lunch Break" className="font-semibold text-[24px]" />
            )}
            {!isLeaved && isOnBreak && (
              <div className="flex flex-row gap-4 text-[40px] font-semibold text-text_primary">
                <Text text={formatTime(breakDisplaySeconds)} />
              </div>
            )}

            <div className="w-full flex flex-row gap-4 justify-center">
              {!isOnBreak && !isLeaved && (
                <Button theme="secondary" onClick={handleBreak} className="w-[220px]">
                  Start
                </Button>
              )}
              {isOnBreak && !isLeaved && (
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
              <Button
                theme="cancel"
                className="w-full"
                onClick={() => setIsLeaveModalOpen(true)}
                disabled={completeDayMutation.isPending}
              >
                <Text text="Leave" className="py-1" />
              </Button>
            ) : (
              <div className="flex flex-col gap-4 text-center">
                <div className="text-[40px] font-semibold text-text_primary">
                  <Text text={formatTime(workDisplaySeconds)} />
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
          <Text
            text="Are you sure to leave from work for today?"
            className="my-6 text-[24px] font-semibold text-text_primary"
          />
        </Modal>
      </div>
  );
}
export default AttendancePage;
