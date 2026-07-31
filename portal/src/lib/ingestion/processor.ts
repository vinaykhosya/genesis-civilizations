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

  // Map deaths.csv for exact death locations and causes
  const rawDeaths = Papa.parse(parsed.deathsCsv || "", { header: true, skipEmptyLines: true }).data;
  const deathsMap = new Map<number, any>();
  rawDeaths.forEach((d: any) => {
    const rawId = d.agent_id !== undefined && d.agent_id !== "" ? d.agent_id : d.id;
    const aId = parseInt(rawId, 10);
    if (!isNaN(aId)) {
      deathsMap.set(aId, {
        primary_cause: d.primary_cause || d.cause_of_death || "unknown",
        secondary_cause: d.secondary_cause,
        x: parseFloat(d.location_x || d.x),
        y: parseFloat(d.location_y || d.y),
      });
    }
  });

  const colonyNameToId: Record<string, number> = {
    Alpha: 0,
    Beta: 1,
    Gamma: 2,
    Delta: 3,
  };
  const colonyIdToName: Record<number, string> = {
    0: "Alpha",
    1: "Beta",
    2: "Gamma",
    3: "Delta",
  };

  // Map agents census
  const rawAgents = Papa.parse(parsed.agentCensusCsv || "", { header: true, skipEmptyLines: true }).data;

  // Deduplicate snapshot rows keeping the latest tick record per agent ID
  const latestAgentsMap = new Map<number, any>();
  rawAgents.forEach((agent: any) => {
    const rawId = agent.id !== undefined && agent.id !== "" ? agent.id : agent.agent_id;
    const aId = parseInt(rawId, 10);
    if (!isNaN(aId)) {
      const snapTick = parseInt(agent.snapshot_tick, 10) || 0;
      const existing = latestAgentsMap.get(aId);
      if (!existing || snapTick >= (parseInt(existing.snapshot_tick, 10) || 0)) {
        latestAgentsMap.set(aId, agent);
      }
    }
  });

  const processedAgents = Array.from(latestAgentsMap.values()).map((agent: any) => {
    const rawId = agent.id !== undefined && agent.id !== "" ? agent.id : agent.agent_id;
    const aId = parseInt(rawId, 10);

    const colonyVal = agent.colony || agent.colony_name || agent.colony_id;
    let colonyId = parseInt(colonyVal, 10);
    let colonyName = agent.colony_name || agent.colony || "Unknown";

    if (isNaN(colonyId) && typeof colonyVal === "string") {
      colonyId = colonyNameToId[colonyVal] ?? 0;
      colonyName = colonyVal;
    } else if (!isNaN(colonyId) && (!colonyName || colonyName === "Unknown")) {
      colonyName = colonyIdToName[colonyId] || `Colony ${colonyId}`;
    }

    const deathInfo = deathsMap.get(aId);
    const causeOfDeath =
      deathInfo?.primary_cause ||
      (agent.cause_of_death && agent.cause_of_death !== "None"
        ? agent.cause_of_death
        : "alive");

    const deathLoc =
      deathInfo && !isNaN(deathInfo.x) && !isNaN(deathInfo.y)
        ? { x: deathInfo.x, y: deathInfo.y }
        : agent.death_location_x !== undefined && !isNaN(parseFloat(agent.death_location_x))
          ? { x: parseFloat(agent.death_location_x), y: parseFloat(agent.death_location_y) }
          : null;

    const birthLoc =
      agent.birth_location_x !== undefined && !isNaN(parseFloat(agent.birth_location_x))
        ? { x: parseFloat(agent.birth_location_x), y: parseFloat(agent.birth_location_y) }
        : null;

    return {
      agent_id: aId,
      colony_id: isNaN(colonyId) ? 0 : colonyId,
      colony_name: colonyName || "Unknown",
      generation: parseInt(agent.generation, 10) || 0,
      age_ticks: parseInt(agent.age_ticks, 10) || 0,
      lifespan_ticks: parseInt(agent.lifespan_ticks || agent.age_ticks, 10) || 0,
      health_at_death: parseFloat(agent.health_at_death || agent.health) || 0.0,
      children_count: parseInt(agent.children_count || agent.children, 10) || 0,
      shelter_level: parseInt(agent.shelter_level, 10) || 0,
      cause_of_death: causeOfDeath,
      birth_location: birthLoc,
      death_location: deathLoc,
      exploration_radius: parseFloat(agent.exploration_radius || agent.max_radius) || 0.0,
      genes: {},
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
