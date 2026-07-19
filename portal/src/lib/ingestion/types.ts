import { ExperimentConfig, ExperimentSummary } from "../../../shared/types";

export interface IngestionError {
  file: string;
  field?: string;
  message: string;
  tier: "structural" | "schema" | "semantic" | "research";
}

export interface IngestionWarning {
  file: string;
  message: string;
  tier: "structural" | "schema" | "semantic" | "research";
}

export interface ExperimentHealthReport {
  score: number; // 0 to 100
  warnings: IngestionWarning[];
  errors: IngestionError[];
}

export interface ParsedExperiment {
  config: ExperimentConfig;
  summary: ExperimentSummary;
  events: any[];
  populationCsv: string;
  timelineCsv: string;
  birthsCsv: string;
  deathsCsv: string;
  genesCsv: string;
  coloniesCsv: string;
  agentCensusCsv: string;
  worldPngBytes: Buffer | null;
  replayJsonStr?: string;
  // Atlas dynamic maps
  biomesPngBytes?: Buffer | null;
  elevationPngBytes?: Buffer | null;
  temperaturePngBytes?: Buffer | null;
  rainfallPngBytes?: Buffer | null;
  riversPngBytes?: Buffer | null;
  habitabilityPngBytes?: Buffer | null;
  tradePngBytes?: Buffer | null;
  simulationPngBytes?: Buffer | null;
}

export interface CanonicalExperiment {
  id: string;
  slug: string;
  config: ExperimentConfig;
  summary: ExperimentSummary;
  events: any[];
  population: any[];
  agents: any[];
  healthReport: ExperimentHealthReport;
  rawZipBytes: Buffer;
  worldPngBytes: Buffer;
  // Atlas dynamic maps
  biomesPngBytes?: Buffer | null;
  elevationPngBytes?: Buffer | null;
  temperaturePngBytes?: Buffer | null;
  rainfallPngBytes?: Buffer | null;
  riversPngBytes?: Buffer | null;
  habitabilityPngBytes?: Buffer | null;
  tradePngBytes?: Buffer | null;
  simulationPngBytes?: Buffer | null;
}
