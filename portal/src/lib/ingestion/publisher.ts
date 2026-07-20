import { supabaseServer } from "@/lib/supabase-server";
import { CanonicalExperiment, IngestionError } from "./types";
import { UploadedPaths } from "./storage";

export async function publishExperiment(
  canonical: CanonicalExperiment,
  paths: UploadedPaths,
  customTitle?: string,
  customAbstract?: string,
  customTags?: string[],
  isFeatured = false,
): Promise<void> {
  const { id, slug, config, summary, events, population, agents, healthReport } = canonical;

  const storageUrlPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tyajlotsxwocxxawcwta.supabase.co"}/storage/v1/object/public`;

  const hasWorldImage = canonical.worldPngBytes && canonical.worldPngBytes.length > 0;
  const thumbnailUrl = hasWorldImage
    ? `${storageUrlPrefix}/experiments/${paths.thumbnailWebpPath}`
    : null;
  const ogUrl = hasWorldImage ? `${storageUrlPrefix}/experiments/${paths.ogWebpPath}` : null;
  const coverUrl = hasWorldImage ? `${storageUrlPrefix}/experiments/${paths.worldPngPath}` : null;

  // Record available maps in summary
  const availableMaps = [];
  if (canonical.biomesPngBytes && canonical.biomesPngBytes.length > 0) availableMaps.push("biomes");
  if (canonical.elevationPngBytes && canonical.elevationPngBytes.length > 0)
    availableMaps.push("elevation");
  if (canonical.temperaturePngBytes && canonical.temperaturePngBytes.length > 0)
    availableMaps.push("temperature");
  if (canonical.rainfallPngBytes && canonical.rainfallPngBytes.length > 0)
    availableMaps.push("rainfall");
  if (canonical.riversPngBytes && canonical.riversPngBytes.length > 0) availableMaps.push("rivers");
  if (canonical.habitabilityPngBytes && canonical.habitabilityPngBytes.length > 0)
    availableMaps.push("habitability");
  if (canonical.tradePngBytes && canonical.tradePngBytes.length > 0) availableMaps.push("trade");
  if (canonical.simulationPngBytes && canonical.simulationPngBytes.length > 0)
    availableMaps.push("simulation");

  const summaryWithMaps = {
    ...summary,
    available_maps: availableMaps,
  };

  // 1. Insert into experiments table
  const survivors = summary.survivors.split("/");
  const survivorsCount = parseInt(survivors[0], 10) || 0;
  const totalAgents = parseInt(survivors[1], 10) || 0;

  const { error: expError } = await supabaseServer.from("experiments").insert({
    id,
    slug,
    title: customTitle || summary.experiment || `Simulation Seed ${config.seed}`,
    abstract: customAbstract || "",
    tags: customTags || [],
    health_score: healthReport.score,
    health_warnings: healthReport.warnings.map((w) => w.message),
    schema_version: "1.0.0",
    engine_version: "9.2.0",
    seed: config.seed,
    ticks: config.ticks || summary.actual_ticks || summary.ticks,
    scarcity: config.scarcity,
    world_preset: config.world_preset,
    climate_epoch_mode: config.climate_epoch_mode,
    max_population: config.max_population,
    mutation_rate: config.mutation_rate,
    total_agents: totalAgents,
    survivors_count: survivorsCount,
    max_generation: summary.max_generation,
    avg_genetic_diversity: summary.derived_metrics.avg_genetic_diversity,
    config_json: config,
    summary_json: summaryWithMaps,
    storage_path: `${id}/`,
    thumbnail_url: thumbnailUrl,
    cover_url: coverUrl,
    og_url: ogUrl,
    has_replay: !!paths.replayJsonPath,
    is_published: true,
    is_featured: isFeatured,
    published_at: new Date().toISOString(),
  });

  if (expError) {
    throw {
      file: "database.experiments",
      message: `Failed to insert experiment record: ${expError.message}`,
      tier: "structural",
    } as IngestionError;
  }

  // Helper to chunk inserts
  const chunkAndInsert = async (table: string, items: any[]) => {
    const chunkSize = 500;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const { error } = await supabaseServer.from(table).insert(chunk);
      if (error) {
        throw {
          file: `database.${table}`,
          message: `Failed to insert records in chunk ${i}: ${error.message}`,
          tier: "structural",
        } as IngestionError;
      }
    }
  };

  // 2. Batch-insert events
  const mappedEvents = events.map((evt) => ({
    experiment_id: id,
    tick: evt.tick,
    year: evt.year,
    day: evt.day,
    event_type: evt.type,
    description: evt.description,
    metadata: evt.metadata,
  }));
  await chunkAndInsert("experiment_events", mappedEvents);

  // 3. Batch-insert agents
  const mappedAgents = agents.map((agent) => ({
    experiment_id: id,
    agent_id: agent.agent_id,
    colony_id: agent.colony_id,
    colony_name: agent.colony_name,
    generation: agent.generation,
    age_ticks: agent.age_ticks,
    lifespan_ticks: agent.lifespan_ticks,
    health_at_death: agent.health_at_death,
    children_count: agent.children_count,
    shelter_level: agent.shelter_level,
    cause_of_death: agent.cause_of_death,
    birth_location: agent.birth_location,
    death_location: agent.death_location,
    exploration_radius: agent.exploration_radius,
    genes: agent.genes,
  }));
  await chunkAndInsert("experiment_agents", mappedAgents);

  // 4. Batch-insert population data points
  const mappedPop = population.map((row) => ({
    experiment_id: id,
    tick: parseInt(row.tick, 10),
    total: parseInt(row.total, 10) || 0,
    alpha: parseInt(row.alpha, 10) || 0,
    beta: parseInt(row.beta, 10) || 0,
    gamma: parseInt(row.gamma, 10) || 0,
    delta: parseInt(row.delta, 10) || 0,
  }));
  await chunkAndInsert("experiment_population", mappedPop);
}
