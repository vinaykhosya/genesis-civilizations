/**
 * One-shot CLI publisher for:
 *   GEN-EXP-0001: Baseline Civilization Emergence under Ideal Conditions
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import Papa from "papaparse";
import JSZip from "jszip";

const SUPABASE_URL = "https://tyajlotsxwocxxawcwta.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWpsb3RzeHdvY3h4YXdjd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MTQxNiwiZXhwIjoyMDk5NjE3NDE2fQ.DNByNwePQi2msrT6eJvsoti1NCow2cX3-3LdRNrUCFk";

const EXPERIMENT_ID = "GEN-EXP-0001";
const EXPERIMENT_SLUG = "gen-exp-0001";
const FOLDER_NAME = "emergence_social_bonds_accelerated_COMPLETE";
const TITLE = "GEN-EXP-0001: Baseline Civilization Emergence under Ideal Conditions";
const ABSTRACT = "Baseline longitudinal experiment evaluating the stability of Project Genesis under ideal environmental conditions. The world was simulated for 100,228 ticks (~300 simulated years) using seed 1720 with instant healing enabled and disputes disabled. The objective was to validate long-term ecological stability, multi-generational reproduction, colony persistence, and emergent behavioral diversity before introducing additional environmental stressors.";
const TAGS = ["baseline","longitudinal","100k-ticks","seed-1720","ideal-conditions","civilization-emergence","agent-based","social-bonds"];
const IS_FEATURED = true;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..", "..");
const EXP_FOLDER = path.join(WORKSPACE, "experiments", FOLDER_NAME);
const ZIP_PATH = path.join(WORKSPACE, "experiments", FOLDER_NAME + ".zip");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const STORAGE_PREFIX = SUPABASE_URL + "/storage/v1/object/public/experiments";

async function upload(storagePath, body, contentType) {
  console.log("  up: experiments/" + storagePath);
  const { error } = await supabase.storage.from("experiments").upload(storagePath, body, { contentType, upsert: true });
  if (error) throw new Error("Upload failed for " + storagePath + ": " + error.message);
}

async function chunkInsert(table, rows) {
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from(table).insert(rows.slice(i, i + CHUNK));
    if (error) throw new Error("Insert failed in " + table + ": " + error.message);
  }
  console.log("  inserted " + rows.length + " rows into " + table);
}

async function run() {
  console.log("\n=== Publishing " + EXPERIMENT_ID + " ===\n");
  if (!fs.existsSync(EXP_FOLDER)) throw new Error("Folder not found: " + EXP_FOLDER);

  const config = JSON.parse(fs.readFileSync(path.join(EXP_FOLDER, "config.json"), "utf8"));
  const summary = JSON.parse(fs.readFileSync(path.join(EXP_FOLDER, "summary.json"), "utf8"));
  const events = JSON.parse(fs.readFileSync(path.join(EXP_FOLDER, "events.json"), "utf8"));
  const populationCsv = fs.readFileSync(path.join(EXP_FOLDER, "population.csv"), "utf8");
  const agentCensusCsv = fs.readFileSync(path.join(EXP_FOLDER, "agent_census.csv"), "utf8");
  const worldPngBytes = fs.readFileSync(path.join(EXP_FOLDER, "world.png"));
  const replayPath = path.join(EXP_FOLDER, "replay.json");
  const replayExists = fs.existsSync(replayPath);

  let zipBytes;
  if (fs.existsSync(ZIP_PATH)) {
    console.log("Using existing ZIP...");
    zipBytes = fs.readFileSync(ZIP_PATH);
  } else {
    console.log("Generating ZIP from folder...");
    const zip = new JSZip();
    for (const file of fs.readdirSync(EXP_FOLDER)) {
      const fp = path.join(EXP_FOLDER, file);
      if (fs.statSync(fp).isFile()) zip.file(file, fs.readFileSync(fp));
    }
    zipBytes = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  }

  console.log("Generating WebP previews...");
  const thumbnailBytes = await sharp(worldPngBytes).resize(1024,1024,{fit:"contain",background:{r:5,g:7,b:12,alpha:1}}).webp({quality:90}).toBuffer();
  const ogBytes = await sharp(worldPngBytes).resize(1200,630,{fit:"contain",background:{r:5,g:7,b:12,alpha:1}}).webp({quality:90}).toBuffer();

  console.log("Clearing old DB records...");
  await supabase.from("experiment_events").delete().eq("experiment_id", EXPERIMENT_ID);
  await supabase.from("experiment_agents").delete().eq("experiment_id", EXPERIMENT_ID);
  await supabase.from("experiment_population").delete().eq("experiment_id", EXPERIMENT_ID);
  await supabase.from("experiments").delete().eq("id", EXPERIMENT_ID);

  console.log("Uploading to storage...");
  await upload(EXPERIMENT_ID+"/exports/package.zip", zipBytes, "application/zip");
  await upload(EXPERIMENT_ID+"/preview/world.png", worldPngBytes, "image/png");
  await upload(EXPERIMENT_ID+"/preview/thumbnail.webp", thumbnailBytes, "image/webp");
  await upload(EXPERIMENT_ID+"/preview/og.webp", ogBytes, "image/webp");
  if (replayExists) await upload(EXPERIMENT_ID+"/replay/replay.json", fs.readFileSync(replayPath), "application/json");

  const MAP_FILES = ["biomes.png","elevation.png","temperature.png","rainfall.png","rivers.png","habitability.png","trade.png","simulation.png"];
  const availableMaps = [];
  for (const mf of MAP_FILES) {
    const mp = path.join(EXP_FOLDER, mf);
    if (fs.existsSync(mp)) {
      await upload(EXPERIMENT_ID+"/atlas/"+mf, fs.readFileSync(mp), "image/png");
      availableMaps.push(mf.replace(".png",""));
    }
  }

  const survivorsRaw = summary.survivors;
  let survivorsCount, totalAgents;
  if (typeof survivorsRaw === "string" && survivorsRaw.includes("/")) {
    const parts = survivorsRaw.split("/");
    survivorsCount = parseInt(parts[0],10)||0;
    totalAgents = parseInt(parts[1],10)||0;
  } else {
    survivorsCount = parseInt(survivorsRaw,10)||0;
    totalAgents = parseInt(summary.total_agents,10)||0;
  }
  const avgGeneticDiversity = summary.avg_genetic_diversity ?? summary.derived_metrics?.avg_genetic_diversity ?? 0.0;
  const actualTicks = config.ticks || summary.actual_ticks || summary.ticks;
  const summaryWithMaps = { ...summary, available_maps: availableMaps };

  console.log("survivors="+survivorsCount+" total="+totalAgents+" diversity="+avgGeneticDiversity+" ticks="+actualTicks);

  console.log("Inserting experiment record...");
  const { error: expError } = await supabase.from("experiments").insert({
    id: EXPERIMENT_ID, slug: EXPERIMENT_SLUG, title: TITLE, abstract: ABSTRACT, tags: TAGS,
    health_score: 95, health_warnings: ["Deaths logged in deaths.csv (909) does not match total dead agents in census (4346)."],
    schema_version: "1.0.0", engine_version: "9.2.0",
    seed: config.seed, ticks: actualTicks,
    scarcity: config.scarcity ?? null, world_preset: config.world_preset ?? null,
    climate_epoch_mode: config.climate_epoch_mode ?? null, max_population: config.max_population ?? null,
    mutation_rate: config.mutation_rate ?? null, total_agents: totalAgents, survivors_count: survivorsCount,
    max_generation: summary.max_generation ?? null, avg_genetic_diversity: avgGeneticDiversity,
    config_json: config, summary_json: summaryWithMaps, storage_path: EXPERIMENT_ID+"/",
    thumbnail_url: STORAGE_PREFIX+"/"+EXPERIMENT_ID+"/preview/thumbnail.webp",
    cover_url: STORAGE_PREFIX+"/"+EXPERIMENT_ID+"/preview/world.png",
    og_url: STORAGE_PREFIX+"/"+EXPERIMENT_ID+"/preview/og.webp",
    has_replay: replayExists, is_published: true, is_featured: IS_FEATURED,
    published_at: new Date().toISOString(),
  });
  if (expError) throw new Error("Failed to insert experiment record: " + expError.message);

  console.log("Inserting events...");
  await chunkInsert("experiment_events", events.map(evt => ({
    experiment_id: EXPERIMENT_ID, tick: evt.tick, year: evt.year, day: evt.day,
    event_type: evt.type, description: evt.description, metadata: evt.metadata ?? null,
  })));

  console.log("Inserting agent census...");
  const rawAgents = Papa.parse(agentCensusCsv, { header: true, skipEmptyLines: true }).data;
  await chunkInsert("experiment_agents", rawAgents.map(a => ({
    experiment_id: EXPERIMENT_ID,
    agent_id: parseInt(a.agent_id,10), colony_id: parseInt(a.colony_id,10),
    colony_name: a.colony_name || "Unknown", generation: parseInt(a.generation,10)||0,
    age_ticks: parseInt(a.age_ticks,10)||0, lifespan_ticks: parseInt(a.lifespan_ticks,10)||0,
    health_at_death: parseFloat(a.health_at_death)||0.0, children_count: parseInt(a.children_count,10)||0,
    shelter_level: parseInt(a.shelter_level,10)||0, cause_of_death: a.cause_of_death||"unknown",
    birth_location: { y: parseFloat(a.birth_location_y)||0, x: parseFloat(a.birth_location_x)||0 },
    death_location: { y: parseFloat(a.death_location_y)||0, x: parseFloat(a.death_location_x)||0 },
    exploration_radius: parseFloat(a.exploration_radius)||0.0, genes: {},
  })));

  console.log("Inserting population history...");
  const rawPop = Papa.parse(populationCsv, { header: true, skipEmptyLines: true }).data;
  await chunkInsert("experiment_population", rawPop.map(r => ({
    experiment_id: EXPERIMENT_ID,
    tick: parseInt(r.tick,10),
    total: parseInt(r.total_alive ?? r.total,10)||0,
    alpha: parseInt(r.colony_alpha ?? r.alpha,10)||0,
    beta: parseInt(r.colony_beta ?? r.beta,10)||0,
    gamma: parseInt(r.colony_gamma ?? r.gamma,10)||0,
    delta: parseInt(r.colony_delta ?? r.delta,10)||0,
  })));

  console.log("\n===================================================");
  console.log("SUCCESS: " + EXPERIMENT_ID + " is LIVE on the portal!");
  console.log("URL: https://genesis.vinaykhosya.com/archive/" + EXPERIMENT_SLUG);
  console.log("===================================================\n");
}

run().catch(err => { console.error("FATAL:", err.message); process.exit(1); });
