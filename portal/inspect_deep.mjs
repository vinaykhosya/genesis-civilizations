import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const experimentsDir = "c:/Users/vinay/Desktop/project genesis/experiments";
const directories = readdirSync(experimentsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`Analyzing ${directories.length} experiments in-depth...\n`);

const results = [];

for (const dirName of directories) {
  const dirPath = join(experimentsDir, dirName);
  const configPath = join(dirPath, "config.json");
  const summaryPath = join(dirPath, "summary.json");
  const deathsPath = join(dirPath, "deaths.csv");
  const birthsPath = join(dirPath, "births.csv");

  let config = {};
  let summary = {};

  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf8"));
    } catch (e) {}
  }

  if (existsSync(summaryPath)) {
    try {
      summary = JSON.parse(readFileSync(summaryPath, "utf8"));
    } catch (e) {}
  }

  // Parse deaths.csv for causes of death and location centroids
  const deathCauses = {};
  const colonyLocations = {};

  if (existsSync(deathsPath)) {
    try {
      const lines = readFileSync(deathsPath, "utf8").split("\n").map(l => l.trim()).filter(Boolean);
      const headers = lines[0].split(",");
      const xIdx = headers.indexOf("location_x");
      const yIdx = headers.indexOf("location_y");
      const causeIdx = headers.indexOf("primary_cause");
      const colonyIdx = headers.indexOf("colony_id");

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        if (parts.length < headers.length) continue;

        // Cause of death
        const cause = parts[causeIdx];
        if (cause) {
          deathCauses[cause] = (deathCauses[cause] || 0) + 1;
        }

        // Location mapping
        const colony = parts[colonyIdx] || "0";
        const x = parseFloat(parts[xIdx]);
        const y = parseFloat(parts[yIdx]);
        if (!isNaN(x) && !isNaN(y)) {
          if (!colonyLocations[colony]) {
            colonyLocations[colony] = { sumX: 0, sumY: 0, count: 0 };
          }
          colonyLocations[colony].sumX += x;
          colonyLocations[colony].sumY += y;
          colonyLocations[colony].count += 1;
        }
      }
    } catch (e) {}
  }

  // Average the coordinates to find colony center coordinates
  const centroids = {};
  for (const [colony, data] of Object.entries(colonyLocations)) {
    centroids[colony] = {
      x: Math.round(data.sumX / data.count),
      y: Math.round(data.sumY / data.count)
    };
  }

  results.push({
    folderName: dirName,
    seed: config.seed ?? summary.seed ?? null,
    actualTicks: summary.ticks ?? config.ticks ?? null,
    configuredTicks: config.ticks ?? null,
    scarcity: config.scarcity ?? summary.scarcity ?? null,
    worldPreset: config.world_preset ?? summary.world_preset ?? "Flat/Standard",
    disputes: config.disputes_enabled ?? false,
    healing: config.healing_speed_mult ?? 1.0,
    maxPop: config.max_population ?? 200,
    mutationRate: config.mutation_rate ?? 0.05,
    planner: config.planner_enabled ?? false,
    survivors: summary.survivors ?? "0",
    maxGen: summary.max_generation ?? 0,
    avgGeneticDiversity: summary.derived_metrics?.avg_genetic_diversity ?? 0,
    avgCooperation: summary.derived_metrics?.avg_cooperation_score ?? 0,
    avgConflict: summary.derived_metrics?.avg_conflict_score ?? 0,
    deathCauses,
    centroids,
    epochMode: config.climate_epoch_mode ?? "legacy",
    ablation: config.ecology_ablation ?? {}
  });
}

console.log(JSON.stringify(results, null, 2));
