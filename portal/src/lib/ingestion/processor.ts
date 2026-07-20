import Papa from "papaparse";
import { ParsedExperiment, CanonicalExperiment, ExperimentHealthReport } from "./types";

export function processExperiment(
  id: string,
  slug: string,
  parsed: ParsedExperiment,
  healthReport: ExperimentHealthReport,
  rawZipBytes: Buffer,
): CanonicalExperiment {
  // Downsample population data to max 5,000 rows to ensure fast chart loads
  const rawPop = Papa.parse(parsed.populationCsv, { header: true, skipEmptyLines: true }).data;
  let downsampledPop = rawPop;

  if (rawPop.length > 5000) {
    const sampleEvery = Math.max(1, Math.floor(rawPop.length / 5000));
    downsampledPop = rawPop.filter((row: any, i: number) => {
      const tick = parseInt(row.tick, 10);
      // Keep early simulation dynamics (first 1000 ticks) intact, sample the rest
      return tick < 1000 || i % sampleEvery === 0;
    });
  }

  // Map agents final census
  const rawAgents = Papa.parse(parsed.agentCensusCsv, { header: true, skipEmptyLines: true }).data;
  const processedAgents = rawAgents.map((agent: any) => {
    // Parse numeric fields safely
    return {
      agent_id: parseInt(agent.agent_id, 10),
      colony_id: parseInt(agent.colony_id, 10),
      colony_name: agent.colony_name || "Unknown",
      generation: parseInt(agent.generation, 10) || 0,
      age_ticks: parseInt(agent.age_ticks, 10) || 0,
      lifespan_ticks: parseInt(agent.lifespan_ticks, 10) || 0,
      health_at_death: parseFloat(agent.health_at_death) || 0.0,
      children_count: parseInt(agent.children_count, 10) || 0,
      shelter_level: parseInt(agent.shelter_level, 10) || 0,
      cause_of_death: agent.cause_of_death || "unknown",
      birth_location: {
        y: parseFloat(agent.birth_location_y),
        x: parseFloat(agent.birth_location_x),
      },
      death_location: {
        y: parseFloat(agent.death_location_y),
        x: parseFloat(agent.death_location_x),
      },
      exploration_radius: parseFloat(agent.exploration_radius) || 0.0,
      genes: {}, // Extracted from genes.csv or summary later if needed
    };
  });

  return {
    id,
    slug,
    config: parsed.config,
    summary: parsed.summary,
    events: parsed.events,
    population: downsampledPop,
    agents: processedAgents,
    healthReport,
    rawZipBytes,
    worldPngBytes: parsed.worldPngBytes || Buffer.alloc(0),
    biomesPngBytes: parsed.biomesPngBytes,
    elevationPngBytes: parsed.elevationPngBytes,
    temperaturePngBytes: parsed.temperaturePngBytes,
    rainfallPngBytes: parsed.rainfallPngBytes,
    riversPngBytes: parsed.riversPngBytes,
    habitabilityPngBytes: parsed.habitabilityPngBytes,
    tradePngBytes: parsed.tradePngBytes,
    simulationPngBytes: parsed.simulationPngBytes,
  };
}
