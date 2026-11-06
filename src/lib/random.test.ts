import { it, expect } from "vitest";
import { shuffled } from "./random";
it("Fisher–Yates reaches each permutation with equal choices", () => {
  const counts = new Map<string, number>();
  for (let a=0;a<3;a++) for (let b=0;b<2;b++) {
    const draws=[(a+.5)/3,(b+.5)/2]; let n=0;
    const key=shuffled([0,1,2],()=>draws[n++] ?? 0).join();
    counts.set(key,(counts.get(key)??0)+1);
  }
  expect(counts.size).toBe(6); expect([...counts.values()]).toEqual([1,1,1,1,1,1]);
});
it("does not change the original items",()=>{const items=[1,2,3];expect(shuffled(items,()=>0)).toEqual([2,3,1]);expect(items).toEqual([1,2,3]);});