import { z } from "zod";
import Papa from "papaparse";
import {
  ParsedExperiment,
  ExperimentHealthReport,
  IngestionError,
  IngestionWarning,
} from "./types";

// Schema Validation: Zod definitions matching shared contracts
const configSchema = z.object({
  seed: z.number().int(),
  ticks: z.number().int(),
  scarcity: z.number().min(0.1).max(10.0),
  max_population: z.number().int().optional(),
  mutation_rate: z.number().optional(),
  reproduction_enabled: z.boolean().optional(),
  disputes_enabled: z.boolean().optional(),
  disasters_enabled: z.boolean().optional(),
  healing_speed_mult: z.number().optional(),
  shelter_build_speed_mult: z.number().optional(),
  shelter_search_dist: z.number().optional(),
  planner_enabled: z.boolean().optional(),
  sleep_consolidation_enabled: z.boolean().optional(),
  checkpoint_interval: z.number().int().optional(),
  world_preset: z.string().nullable().optional(),
  climate_epoch_mode: z.string().nullable().optional(),
  ecology_ablation: z
    .object({
      dehydration_ramp: z.boolean().optional(),
      memory_fidelity: z.boolean().optional(),
      water_caching: z.boolean().optional(),
      deposit_utility_fix: z.boolean().optional(),
    })
    .optional(),
});

const summarySchema = z.object({
  timestamp: z.string().optional(),
  experiment: z.string().optional(),
  seed: z.number().int(),
  ticks: z.number().int(),
  scarcity: z.number().optional(),
  survivors: z.union([z.string(), z.number()]).transform((val) => String(val)),
  avg_radius: z.number().optional(),
  avg_discoveries: z.number().optional(),
  tests_passed: z.boolean().optional(),
  max_generation: z.number().int().optional(),
  derived_metrics: z
    .object({
      avg_generation_interval: z.number().optional(),
      population_doubling_time: z.number().optional(),
      colony_lifespans: z.record(z.string(), z.number()).optional(),
      avg_genetic_diversity: z.number().optional(),
      food_efficiency: z.number().optional(),
      water_efficiency: z.number().optional(),
      energy_efficiency: z.number().optional(),
      avg_prediction_error: z.number().optional(),
      concept_formation_rate: z.number().optional(),
      procedure_creation_rate: z.number().optional(),
      avg_social_degree: z.number().optional(),
      avg_cooperation_score: z.number().optional(),
      avg_conflict_score: z.number().optional(),
    })
    .optional(),
});

export function validateExperiment(parsed: ParsedExperiment): ExperimentHealthReport {
  const errors: IngestionError[] = [];
  const warnings: IngestionWarning[] = [];

  // Stage 1: Structural Checks (Implicitly done by parser, verify file types here)
  if (!parsed.worldPngBytes) {
    warnings.push({
      file: "world.png",
      message: "Missing world image: world.png (legacy run)",
      tier: "research",
    });
  }

  // Stage 2: Schema Checks
  const configParseResult = configSchema.safeParse(parsed.config);
  if (!configParseResult.success) {
    configParseResult.error.issues.forEach((issue) => {
      errors.push({
        file: "config.json",
        field: issue.path.join("."),
        message: `Schema error: ${issue.message}`,
        tier: "schema",
      });
    });
  }

  const summaryParseResult = summarySchema.safeParse(parsed.summary);
  if (!summaryParseResult.success) {
    summaryParseResult.error.issues.forEach((issue) => {
      errors.push({
        file: "summary.json",
        field: issue.path.join("."),
        message: `Schema error: ${issue.message}`,
        tier: "schema",
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
        tier: "semantic",
      });
    }

    if (parsed.summary.ticks > parsed.config.ticks) {
      warnings.push({
        file: "summary.json",
        message: `Semantic Warning: Summary ticks (${parsed.summary.ticks}) exceeds maximum configuration ticks (${parsed.config.ticks}). This may represent an extended or manual run.`,
        tier: "research",
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
            tier: "semantic",
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
      tier: "semantic",
    });
  }

  // Stage 4: Research Validation & Advanced Data Integrity
  if (parsed.config) {
    if (parsed.config.ticks < 1000) {
      warnings.push({
        file: "config.json",
        message: `Research Warning: Run duration is very short (${parsed.config.ticks} ticks). Recommended runs should be at least 1,000 ticks.`,
        tier: "research",
      });
    }
  }

  // 1. Replay Ticks Match Check
  if (parsed.replayJsonStr && parsed.config) {
    try {
      const replayObj = JSON.parse(parsed.replayJsonStr);
      const replayTicks = replayObj.states?.length || 0;
      const configTicks = parsed.config.ticks;
      if (replayTicks > 0 && Math.abs(replayTicks - configTicks) > 100) {
        errors.push({
          file: "replay.json",
          field: "states",
          message: `Validation Error: Replay states count (${replayTicks}) does not match configured ticks (${configTicks}).`,
          tier: "semantic",
        });
      }
    } catch (e) {}
  } else if (!parsed.replayJsonStr) {
    warnings.push({
      file: "replay.json",
      message:
        "Research Warning: No replay.json was packaged with this export. Playback features will be disabled.",
      tier: "research",
    });
  }

  // 2. Generations Match Census Check
  if (parsed.agentCensusCsv && parsed.summary && parsed.summary.max_generation !== undefined) {
    try {
      const censusRows = Papa.parse(parsed.agentCensusCsv, { header: true }).data as any[];
      const maxGenInCensus = Math.max(0, ...censusRows.map((r) => parseInt(r.generation, 10) || 0));
      if (maxGenInCensus !== parsed.summary.max_generation) {
        errors.push({
          file: "agent_census.csv",
          field: "generation",
          message: `Validation Error: Max generation in census (${maxGenInCensus}) does not match summary max_generation (${parsed.summary.max_generation}).`,
          tier: "semantic",
        });
      }
    } catch (e) {}
  }

  // 3. Deaths Count Match Check
  if (parsed.deathsCsv && parsed.agentCensusCsv) {
    try {
      const deathsRows = Papa.parse(parsed.deathsCsv, { header: true }).data as any[];
      const censusRows = Papa.parse(parsed.agentCensusCsv, { header: true }).data as any[];
      const deadInCensus = censusRows.filter(
        (r) => r.cause_of_death && r.cause_of_death.toLowerCase() !== "none",
      ).length;
      if (deathsRows.length !== deadInCensus) {
        warnings.push({
          file: "deaths.csv",
          message: `Validation Warning: Deaths logged in deaths.csv (${deathsRows.length}) does not match total dead agents in census (${deadInCensus}).`,
          tier: "research",
        });
      }
    } catch (e) {}
  }

  // 4. Environmental Maps Integrity Check
  const requiredMaps = [
    { name: "biomes.png", bytes: parsed.biomesPngBytes },
    { name: "elevation.png", bytes: parsed.elevationPngBytes },
    { name: "temperature.png", bytes: parsed.temperaturePngBytes },
    { name: "rainfall.png", bytes: parsed.rainfallPngBytes },
    { name: "rivers.png", bytes: parsed.riversPngBytes },
    { name: "habitability.png", bytes: parsed.habitabilityPngBytes },
    { name: "trade.png", bytes: parsed.tradePngBytes },
  ];
  requiredMaps.forEach((m) => {
    if (!m.bytes || m.bytes.length === 0) {
      errors.push({
        file: m.name,
        message: `Validation Error: Map visualization ${m.name} is missing or empty.`,
        tier: "structural",
      });
    }
  });

  // Calculate Health Score (100% baseline, subtract per error/warning)
  const penalty = errors.length * 20 + warnings.length * 5;
  const score = Math.max(0, 100 - penalty);

  return {
    score,
    errors,
    warnings,
  };
}
