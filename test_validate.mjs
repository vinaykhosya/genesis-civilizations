import { readFileSync } from "fs";
import { parseExperimentZip } from "./portal/src/lib/ingestion/parser.ts";
import { validateExperiment } from "./portal/src/lib/ingestion/validator.ts";

const zipPath = "c:\\Users\\vinay\\Desktop\\project genesis\\experiments\\2026-07-13_08-58-04_fights alowwed with insta heal , new seed.zip";
const buffer = readFileSync(zipPath);

try {
  const parsed = await parseExperimentZip(buffer);
  const health = validateExperiment(parsed);
  console.log("Health Score:", health.score);
  console.log("Errors:");
  console.log(JSON.stringify(health.errors, null, 2));
  console.log("Warnings:");
  console.log(JSON.stringify(health.warnings, null, 2));
} catch (err) {
  console.error("Crash during parsing:", err);
}
