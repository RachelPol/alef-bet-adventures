import { useCallback, useEffect, useRef, useState } from "react";
import { LEVELS, type Level } from "./levels";

export function useLevel(): [Level, (id: string) => void] {
  const [id, setId] = useState("letters");
  useEffect(() => {
    const s = localStorage.getItem("level");
    if (s && LEVELS.some((l) => l.id === s)) setId(s);
  }, []);
  const set = (v: string) => {
    setId(v);
    localStorage.setItem("level", v);
  };
  return [LEVELS.find((l) => l.id === id)!, set];
}

export const TEST_SECONDS = 60;

export function useSpeedTest() {
  const [active, setActive] = useState(false);
  const [left, setLeft] = useState(TEST_SECONDS);
  const [count, setCount] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const countRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const end = Date.now() + TEST_SECONDS * 1000;
    const t = setInterval(() => {
      const l = Math.max(0, (end - Date.now()) / 1000);
      setLeft(l);
      if (l <= 0) {
        clearInterval(t);
        setActive(false);
        setResult(countRef.current);
      }
    }, 100);
    return () => clearInterval(t);
  }, [active]);

  const start = useCallback(() => {
    countRef.current = 0;
    setCount(0);
    setLeft(TEST_SECONDS);
    setResult(null);
    setActive(true);
  }, []);
  const record = useCallback(() => {
    countRef.current += 1;
    setCount(countRef.current);
  }, []);
  const stop = useCallback(() => setActive(false), []);
  const close = useCallback(() => setResult(null), []);

  return { active, left, count, result, start, record, stop, close };
}

export function useCelebrate(): [number, () => void] {
  const [n, setN] = useState(0);
  return [n, () => setN((x) => x + 1)];
}
