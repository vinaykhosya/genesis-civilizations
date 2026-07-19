import { readFileSync } from "fs";
import { parseExperimentZip } from "./portal/src/lib/ingestion/parser.ts";

const zipPath = "c:\\Users\\vinay\\Desktop\\project genesis\\experiments\\2026-07-13_08-58-04_fights alowwed with insta heal , new seed.zip";
const buffer = readFileSync(zipPath);

try {
  const parsed = await parseExperimentZip(buffer);
  console.log("Config ticks:", parsed.config.ticks);
  console.log("Summary ticks:", parsed.summary.ticks);
} catch (err) {
  console.error(err);
}
