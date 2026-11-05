import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { elapsedSeconds, useCompletionTime } from "./completion-time";

afterEach(() => vi.useRealTimers());
describe("Game completion time", () => {
  it("measures minutes and seconds from game start to completion", () => {
    expect(elapsedSeconds(1000, 126000)).toBe(125);
  });
  it("freezes the completed duration and resets for a new game", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCompletionTime());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(125000));
    act(() => result.current.finish());
    expect(result.current.seconds).toBe(125);
    act(() => vi.advanceTimersByTime(60000));
    act(() => result.current.finish());
    expect(result.current.seconds).toBe(125);
    act(() => result.current.start());
    expect(result.current.seconds).toBeNull();
    act(() => vi.advanceTimersByTime(3000));
    act(() => result.current.finish());
    expect(result.current.seconds).toBe(3);
  });
});