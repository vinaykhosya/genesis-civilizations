import { z } from "zod";
import Papa from "papaparse";
import { ParsedExperiment, ExperimentHealthReport, IngestionError, IngestionWarning } from "./types";

// Schema Validation: Zod definitions matching shared contracts
const configSchema = z.object({
  seed: z.number().int(),
  ticks: z.number().int(),
  scarcity: z.number().min(0.1).max(10.0),
  max_population: z.number().int(),
  mutation_rate: z.number(),
  reproduction_enabled: z.boolean(),
  disputes_enabled: z.boolean(),
  disasters_enabled: z.boolean(),
  healing_speed_mult: z.number(),
  shelter_build_speed_mult: z.number(),
  shelter_search_dist: z.number(),
  planner_enabled: z.boolean(),
  sleep_consolidation_enabled: z.boolean(),
  checkpoint_interval: z.number().int(),
  world_preset: z.enum(["island_chains", "arid_continent", "green_continent", "boreal_highlands", "tropical_ring"]).nullable(),
  climate_epoch_mode: z.enum(["legacy", "stable", "slow_change", "rapid_change", "random"]),
  ecology_ablation: z.object({
    dehydration_ramp: z.boolean(),
    memory_fidelity: z.boolean(),
    water_caching: z.boolean(),
    deposit_utility_fix: z.boolean()
  }).optional()
});

const summarySchema = z.object({
  timestamp: z.string(),
  experiment: z.string(),
  seed: z.number().int(),
  ticks: z.number().int(),
  scarcity: z.number(),
  survivors: z.string(),
  avg_radius: z.number(),
  avg_discoveries: z.number(),
  tests_passed: z.boolean(),
  max_generation: z.number().int(),
  derived_metrics: z.object({
    avg_generation_interval: z.number(),
    population_doubling_time: z.number(),
    colony_lifespans: z.record(z.string(), z.number()),
    avg_genetic_diversity: z.number(),
    food_efficiency: z.number(),
    water_efficiency: z.number(),
    energy_efficiency: z.number(),
    avg_prediction_error: z.number(),
    concept_formation_rate: z.number(),
    procedure_creation_rate: z.number(),
    avg_social_degree: z.number(),
    avg_cooperation_score: z.number(),
    avg_conflict_score: z.number()
  })
});

export function validateExperiment(parsed: ParsedExperiment): ExperimentHealthReport {
  const errors: IngestionError[] = [];
  const warnings: IngestionWarning[] = [];

  // Stage 1: Structural Checks (Implicitly done by parser, verify file types here)
  if (!parsed.worldPngBytes) {
    errors.push({
      file: "world.png",
      message: "Missing required world image: world.png",
      tier: "structural"
    });
  }

  // Stage 2: Schema Checks
  const configParseResult = configSchema.safeParse(parsed.config);
  if (!configParseResult.success) {
    configParseResult.error.issues.forEach(issue => {
      errors.push({
        file: "config.json",
        field: issue.path.join("."),
        message: `Schema error: ${issue.message}`,
        tier: "schema"
      });
    });
  }

  const summaryParseResult = summarySchema.safeParse(parsed.summary);
  if (!summaryParseResult.success) {
    summaryParseResult.error.issues.forEach(issue => {
      errors.push({
        file: "summary.json",
        field: issue.path.join("."),
        message: `Schema error: ${issue.message}`,
        tier: "schema"
      });
    });
  }

  // Stage 3: Semantic Checks (Logical relationships)
  if (parsed.config && parsed.summary) {
    if (parsed.config.seed !== parsed.summary.seed) {
      errors.push({
        file: "summary.json",
        field: "seed",
        message: `Semantic error: Seed value mismatch (config.seed: ${parsed.config.seed}, summary.seed: ${parsed.summary.seed})`,
        tier: "semantic"
      });
    }

    if (parsed.summary.ticks > parsed.config.ticks) {
      errors.push({
        file: "summary.json",
        field: "ticks",
        message: `Semantic error: Summary ticks exceeds maximum configuration ticks`,
        tier: "semantic"
      });
    }
  }

  // Validate CSV structure and logical checks
  try {
    const populationData = Papa.parse(parsed.populationCsv, { header: true }).data as any[];
    if (populationData.length > 0) {
      // Validate chronological sort order of ticks
      let prevTick = -1;
      for (let i = 0; i < populationData.length; i++) {
        const row = populationData[i];
        if (!row.tick) continue;
        const tick = parseInt(row.tick, 10);
        if (tick < prevTick) {
          errors.push({
            file: "population.csv",
            field: `row[${i}].tick`,
            message: `Semantic error: Tick indices must be strictly increasing. Found tick ${tick} after tick ${prevTick}.`,
            tier: "semantic"
          });
          break;
        }
        prevTick = tick;
      }
    }
  } catch (err: any) {
    errors.push({
      file: "population.csv",
      message: `Failed to parse CSV: ${err.message || err}`,
      tier: "semantic"
    });
  }

  // Stage 4: Research Validation
  if (parsed.config) {
    if (parsed.config.ticks < 1000) {
      warnings.push({
        file: "config.json",
        message: `Research Warning: Run duration is very short (${parsed.config.ticks} ticks). Recommended runs should be at least 1,000 ticks.`,
        tier: "research"
      });
    }
  }

  if (!parsed.replayJsonStr) {
    warnings.push({
      file: "replay.json",
      message: "Research Warning: No replay.json was packaged with this export. Playback features will be disabled.",
      tier: "research"
    });
  }

  // Calculate Health Score (100% baseline, subtract per error/warning)
  const penalty = (errors.length * 20) + (warnings.length * 5);
  const score = Math.max(0, 100 - penalty);

  return {
    score,
    errors,
    warnings
  };
}
