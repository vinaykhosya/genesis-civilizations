import fs from "fs";
import path from "path";

const experimentsDir = "../experiments";

const mapping = {
  "GEN-0001": "2026-06-28_12-04-56_fights alowwed with instalnt heal to check realtionship logic",
  "GEN-0002": "2026-06-28_13-16-27_fights alowwed with instalnt heal to check realtionship logic",
  "GEN-0003": "2026-06-28_21-37-33_fights alowwed with insta heal , new seed",
  "GEN-0004": "2026-07-13_08-58-04_fights alowwed with insta heal , new seed",
  "GEN-VAL-001": "2026-07-16_22-40-00_atlas_verification_run",
  "GEN-VAL-002": "2026-06-28_19-23-06_reflex validation short"
};

for (const [id, folderName] of Object.entries(mapping)) {
  const folderPath = path.join(experimentsDir, folderName);
  const configPath = path.join(folderPath, "config.json");
  const summaryPath = path.join(folderPath, "summary.json");

  console.log(`\n================ ${id} ===============`);
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    console.log(`Config: ticks=${config.ticks}, seed=${config.seed}, scarcity=${config.scarcity}, preset=${config.world_preset}`);
  } else {
    console.log("Config: NOT FOUND");
  }
  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
    console.log(`Summary: ticks=${summary.ticks}, seed=${summary.seed}, max_generation=${summary.max_generation}, survivors=${summary.survivors}`);
  } else {
    console.log("Summary: NOT FOUND");
  }
}
