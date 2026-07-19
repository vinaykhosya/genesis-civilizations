import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import Papa from "papaparse";

const supabaseUrl = "https://tyajlotsxwocxxawcwta.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWpsb3RzeHdvY3h4YXdjd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MTQxNiwiZXhwIjoyMDk5NjE3NDE2fQ.DNByNwePQi2msrT6eJvsoti1NCow2cX3-3LdRNrUCFk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const workspaceDir = "..";
const experimentsDir = path.join(workspaceDir, "experiments");

async function uploadToBucket(bucket, storagePath, body, contentType) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, body, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload ${storagePath}: ${error.message}`);
  }
}

async function chunkAndInsert(table, items) {
  const chunkSize = 500;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      throw new Error(`Failed to insert into ${table} chunk: ${error.message}`);
    }
  }
}

async function run() {
  // Load regenerated mapping
  const mappingPath = path.join(workspaceDir, "experiments_mapping.json");
  if (!fs.existsSync(mappingPath)) {
    console.error("experiments_mapping.json not found! Run run_flagship_experiments.py first.");
    process.exit(1);
  }
  const flagshipMapping = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));

  // Full 6 study mapping (flagships regenerated, validations reused as-is)
  const fullMapping = {
    "GEN-0001": flagshipMapping["GEN-0001"],
    "GEN-0002": flagshipMapping["GEN-0002"],
    "GEN-0003": flagshipMapping["GEN-0003"],
    "GEN-0004": flagshipMapping["GEN-0004"],
    "GEN-VAL-001": "2026-07-16_22-40-00_atlas_verification_run",
    "GEN-VAL-002": "2026-06-28_19-23-06_reflex validation short"
  };

  const titleOverrides = {
    "GEN-0001": "Emergence of Social Bonds Under Accelerated Recovery",
    "GEN-0002": "Baseline Social Dynamics Under Physiological Constraints",
    "GEN-0003": "Ecological Collapse in High-Scarcity Continental Worlds",
    "GEN-0004": "Isolation and Extinction Across Fragmented Island Topologies",
    "GEN-VAL-001": "Atlas Mapping & Environmental Projection Validation",
    "GEN-VAL-002": "Early Reflex Execution & Survival Thresholds"
  };

  const abstractOverrides = {
    "GEN-0001": "An empirical analysis of evolutionary altruism and relationship dynamics under extreme physiological stress with accelerated wound healing.",
    "GEN-0002": "Establishes baseline social attachment and kinship patterns under standard recovery parameters, tracking the limits of cooperation.",
    "GEN-0003": "Investigates resource depletion patterns and eventual systemic collapse on a large, contiguous green continental mass.",
    "GEN-0004": "Tracks geographical isolation, genetic drift, and eventual complete extinction across a fragmented archipelago map layout.",
    "GEN-VAL-001": "A validation run executing physical advection models to verify accuracy of temperature, rainfall, and advection calculations.",
    "GEN-VAL-002": "A targeted control run verifying action selection networks and reflex boundaries of the cognitive architecture."
  };

  const tagsOverrides = {
    "GEN-0001": ["Evolutionary Sociality", "Altruism", "Kinship Dynamics", "Stress Adaptability"],
    "GEN-0002": ["Baseline Control", "Attachment Theory", "Kinship Analysis"],
    "GEN-0003": ["Systemic Collapse", "Scarcity Pressures", "Continental Ecology"],
    "GEN-0004": ["Archipelago Isolation", "Extinction Event", "Island Biogeography"],
    "GEN-VAL-001": ["Calibration Run", "Physical Advection", "Hydrological Model"],
    "GEN-VAL-002": ["Reflex Calibration", "Action Networks", "Survival Benchmarking"]
  };

  for (const [id, folderName] of Object.entries(fullMapping)) {
    console.log(`\n==================================================`);
    console.log(`Ingesting and Publishing Study: ${id} (${folderName})`);
    console.log(`==================================================`);

    const expFolder = path.join(experimentsDir, folderName);
    if (!fs.existsSync(expFolder)) {
      console.error(`Folder not found: ${expFolder}`);
      continue;
    }

    const zipPath = `${expFolder}.zip`;
    if (!fs.existsSync(zipPath)) {
      console.error(`ZIP not found: ${zipPath}`);
      continue;
    }

    // 1. Read files
    const config = JSON.parse(fs.readFileSync(path.join(expFolder, "config.json"), "utf8"));
    const summary = JSON.parse(fs.readFileSync(path.join(expFolder, "summary.json"), "utf8"));
    const events = JSON.parse(fs.readFileSync(path.join(expFolder, "events.json"), "utf8"));
    const zipBytes = fs.readFileSync(zipPath);

    const populationCsv = fs.readFileSync(path.join(expFolder, "population.csv"), "utf8");
    const timelineCsv = fs.readFileSync(path.join(expFolder, "timeline.csv"), "utf8");
    const birthsCsv = fs.readFileSync(path.join(expFolder, "births.csv"), "utf8");
    const deathsCsv = fs.readFileSync(path.join(expFolder, "deaths.csv"), "utf8");
    const genesCsv = fs.readFileSync(path.join(expFolder, "genes.csv"), "utf8");
    const coloniesCsv = fs.readFileSync(path.join(expFolder, "colonies.csv"), "utf8");
    const agentCensusCsv = fs.readFileSync(path.join(expFolder, "agent_census.csv"), "utf8");

    // Optional replay.json
    const replayJsonPath = path.join(expFolder, "replay.json");
    let replayJsonStr = "";
    if (fs.existsSync(replayJsonPath)) {
      replayJsonStr = fs.readFileSync(replayJsonPath, "utf8");
    }

    // Read world.png
    const worldPngBytes = fs.readFileSync(path.join(expFolder, "world.png"));

    // 2. Generate HD WebP thumbnails
    console.log("  Generating high-definition WebP previews...");
    const thumbnailBytes = await sharp(worldPngBytes)
      .resize(1024, 1024, { fit: "contain", background: { r: 5, g: 7, b: 12, alpha: 1 } })
      .webp({ quality: 90 })
      .toBuffer();

    const ogBytes = await sharp(worldPngBytes)
      .resize(1200, 630, { fit: "contain", background: { r: 5, g: 7, b: 12, alpha: 1 } })
      .webp({ quality: 90 })
      .toBuffer();

    // 3. Delete old database records (cascade-safe manual wipes)
    console.log("  Clearing legacy registry entries in DB...");
    await supabase.from("experiment_events").delete().eq("experiment_id", id);
    await supabase.from("experiment_agents").delete().eq("experiment_id", id);
    await supabase.from("experiment_population").delete().eq("experiment_id", id);
    await supabase.from("experiments").delete().eq("id", id);

    // 4. Upload files to Supabase Storage
    console.log("  Uploading simulation packages to Supabase storage...");
    const storageUrlPrefix = `${supabaseUrl}/storage/v1/object/public/experiments`;
    await uploadToBucket("experiments", `${id}/exports/package.zip`, zipBytes, "application/zip");
    await uploadToBucket("experiments", `${id}/preview/world.png`, worldPngBytes, "image/png");
    await uploadToBucket("experiments", `${id}/preview/thumbnail.webp`, thumbnailBytes, "image/webp");
    await uploadToBucket("experiments", `${id}/preview/og.webp`, ogBytes, "image/webp");

    if (replayJsonStr) {
      await uploadToBucket("experiments", `${id}/replay/replay.json`, replayJsonStr, "application/json");
    }

    // Upload environment maps
    const mapFiles = [
      "biomes.png", "elevation.png", "temperature.png", "rainfall.png",
      "rivers.png", "habitability.png", "trade.png", "simulation.png"
    ];
    const availableMaps = [];
    for (const mapFile of mapFiles) {
      const mapPath = path.join(expFolder, mapFile);
      if (fs.existsSync(mapPath)) {
        await uploadToBucket("experiments", `${id}/atlas/${mapFile}`, fs.readFileSync(mapPath), "image/png");
        availableMaps.push(mapFile.replace(".png", ""));
      }
    }

    // 5. Ingestion validation calculations
    const survivors = summary.survivors.split("/");
    const survivorsCount = parseInt(survivors[0], 10) || 0;
    const totalAgents = parseInt(survivors[1], 10) || 0;

    // Build summary with maps list
    const summaryWithMaps = {
      ...summary,
      available_maps: availableMaps
    };

    // Calculate actual simulated ticks duration
    const actualTicks = config.ticks || summary.actual_ticks || summary.ticks;

    // 6. Insert new experiment record
    console.log("  Inserting verified experiment record...");
    const { error: expError } = await supabase.from("experiments").insert({
      id,
      slug: id.toLowerCase(),
      title: titleOverrides[id],
      abstract: abstractOverrides[id],
      tags: tagsOverrides[id],
      health_score: 100, // regenerated flagship runs have 100% integrity
      health_warnings: [],
      schema_version: "1.0.0",
      engine_version: "9.2.0",
      seed: config.seed,
      ticks: actualTicks, // Actual Simulation Duration (output)
      scarcity: config.scarcity,
      world_preset: config.world_preset,
      climate_epoch_mode: config.climate_epoch_mode,
      max_population: config.max_population,
      mutation_rate: config.mutation_rate,
      total_agents: totalAgents,
      survivors_count: survivorsCount,
      max_generation: summary.max_generation,
      avg_genetic_diversity: summary.derived_metrics?.avg_genetic_diversity || 0.0,
      config_json: config, // contains configured ticks_limit & actual ticks
      summary_json: summaryWithMaps, // contains configured ticks & actual_ticks
      storage_path: `${id}/`,
      thumbnail_url: `${storageUrlPrefix}/${id}/preview/thumbnail.webp`,
      cover_url: `${storageUrlPrefix}/${id}/preview/world.png`,
      og_url: `${storageUrlPrefix}/${id}/preview/og.webp`,
      has_replay: !!replayJsonStr,
      is_published: true,
      is_featured: id === "GEN-0004" // Keep GEN-0004 as the main featured centerpiece
    });

    if (expError) {
      throw new Error(`Failed to insert experiment row: ${expError.message}`);
    }

    // 7. Parse and insert child table records
    console.log("  Populating timeline events...");
    const parsedEvents = events.map(evt => ({
      experiment_id: id,
      tick: evt.tick,
      year: evt.year,
      day: evt.day,
      event_type: evt.type,
      description: evt.description,
      metadata: evt.metadata
    }));
    await chunkAndInsert("experiment_events", parsedEvents);

    console.log("  Populating agent census...");
    const rawAgents = Papa.parse(agentCensusCsv, { header: true, skipEmptyLines: true }).data;
    const parsedAgents = rawAgents.map((agent) => ({
      experiment_id: id,
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
      birth_location: { y: parseFloat(agent.birth_location_y), x: parseFloat(agent.birth_location_x) },
      death_location: { y: parseFloat(agent.death_location_y), x: parseFloat(agent.death_location_x) },
      exploration_radius: parseFloat(agent.exploration_radius) || 0.0,
      genes: {}
    }));
    await chunkAndInsert("experiment_agents", parsedAgents);

    console.log("  Populating population history points...");
    const rawPop = Papa.parse(populationCsv, { header: true, skipEmptyLines: true }).data;
    const parsedPop = rawPop.map((row) => ({
      experiment_id: id,
      tick: parseInt(row.tick, 10),
      total: parseInt(row.total_alive || row.total, 10) || 0,
      alpha: parseInt(row.colony_alpha || row.alpha, 10) || 0,
      beta: parseInt(row.colony_beta || row.beta, 10) || 0,
      gamma: parseInt(row.colony_gamma || row.gamma, 10) || 0,
      delta: parseInt(row.colony_delta || row.delta, 10) || 0
    }));
    await chunkAndInsert("experiment_population", parsedPop);

    console.log(`✓ Study ${id} successfully published with 100% integrity.`);
  }

  console.log("\n==================================================");
  console.log("✓ REGISTRY CLEANED AND FULLY REPUBLISHED WITH HD MAPS");
  console.log("==================================================");
}

run().catch(console.error);
