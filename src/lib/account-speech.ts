import { readingDialect, type ReadingDialect } from "./reading-dialect";

let dialect: ReadingDialect = "israeli";
export function setAccountDialect(value: unknown) { dialect = readingDialect(value); }
export function getAccountDialect() { return dialect; }