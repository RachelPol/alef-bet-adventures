import { useCallback, useRef, useState } from "react";

export function elapsedSeconds(start: number, end: number) {
  return Math.max(0, Math.floor((end - start) / 1000));
}

export function completionTimeLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder} שְׁנִיּוֹת`;
  const minuteLabel = minutes === 1 ? "דַּקָּה אַחַת" : `${minutes} דַּקּוֹת`;
  return remainder === 0 ? minuteLabel : `${minuteLabel} ו־${remainder} שְׁנִיּוֹת`;
}

export function useCompletionTime() {
  const started = useRef<number | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null);
  const start = useCallback(() => { started.current = Date.now(); setSeconds(null); }, []);
  const finish = useCallback(() => {
    if (started.current === null) return;
    setSeconds(elapsedSeconds(started.current, Date.now()));
    started.current = null;
  }, []);
  return { seconds, start, finish };
}