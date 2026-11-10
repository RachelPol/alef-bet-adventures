import { it, expect } from "vitest";
import { draw, pickPair, LEVELS, type Level } from "./levels";
it("resets a cached deck when account selections change", () => {
  const level = { id: "filter-test", label: "", unit: "", items: [{ text: "א", say: "א" }, { text: "ב", say: "ב" }] };
  draw(level);
  const restricted = { ...level, items: [{ text: "ג", say: "ג" }] };
  expect(draw(restricted).text).toBe("ג");
  expect(pickPair(restricted).map(i => i.text)).toEqual(["ג"]);
  expect(pickPair({ ...level, items: [] })).toEqual([]);
});
it("draws every item once before repeating, including after switching levels", () => {
  const level: Level = { id:"test-deck",label:"test",unit:"words",items:[{text:"a",say:"a"},{text:"b",say:"b"},{text:"c",say:"c"}] };
  const other = {...level,id:"other-test"};
  const first=Array.from({length:3},()=>draw(level)); expect(new Set(first).size).toBe(3);
  draw(other); expect(draw(level)).not.toBe(first[2]);
});
it("always deals two defined different answers at each level",()=>{
  for(const level of LEVELS) for(let n=0;n<100;n++) {const pair=pickPair(level);expect(pair).toHaveLength(2);expect(pair[0]?.text).toBeTruthy();expect(pair[1]?.text).toBeTruthy();expect(pair[0]?.text).not.toBe(pair[1]?.text);}
});