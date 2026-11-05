import { useCallback, useRef, useState } from "react";

export function elapsedSeconds(start: number, end: number) {
  return Math.max(0, Math.floor((end - start) / 1000));
}

export function completionTimeLabel(seconds: number) {
  return `${Math.floor(seconds / 60)} דַּקּוֹת ו־${seconds % 60} שְׁנִיּוֹת`;
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