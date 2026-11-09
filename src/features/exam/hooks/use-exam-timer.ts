"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { formatExamTime, getExamTimerColorClass } from "@/core/examTimer";

interface UseExamTimerOptions {
  durationMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export function useExamTimer({
  durationMinutes,
  onTimeUp,
  isPaused = false,
}: UseExamTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const timerColorClass = useMemo(() => {
    return getExamTimerColorClass(timeLeft);
  }, [timeLeft]);

  const resetTimer = () => {
    setTimeLeft(durationMinutes * 60);
  };

  return {
    timeLeft,
    formattedTime: formatExamTime(timeLeft),
    timerColorClass,
    resetTimer,
  };
}
