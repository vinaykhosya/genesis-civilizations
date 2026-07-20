import JSZip from "jszip";
import { ParsedExperiment, IngestionError } from "./types";

export async function parseExperimentZip(zipBuffer: Buffer): Promise<ParsedExperiment> {
  const zip = new JSZip();
  let contents: JSZip;
  try {
    contents = await zip.loadAsync(zipBuffer);
  } catch (err: any) {
    throw {
      file: "zip",
      message: `Failed to open ZIP archive: ${err.message || err}`,
      tier: "structural",
    } as IngestionError;
  }

  // Resolve wrapper directory prefix if any (e.g. "folder/config.json" -> "folder/")
  let prefix = "";
  const fileNames = Object.keys(contents.files);
  const sampleFile = fileNames.find((n) => n.endsWith("config.json"));
  if (sampleFile && sampleFile !== "config.json") {
    prefix = sampleFile.slice(0, sampleFile.indexOf("config.json"));
  }

  const getFileStr = async (name: string, required = true): Promise<string> => {
    const file = contents.file(prefix + name);
    if (!file) {
      if (required) {
        throw {
          file: name,
          message: `Missing required file: ${name}`,
          tier: "structural",
        } as IngestionError;
      }
      return "";
    }
    return await file.async("string");
  };

  const getFileBuffer = async (name: string, required = true): Promise<Buffer | null> => {
    const file = contents.file(prefix + name);
    if (!file) {
      if (required) {
        throw {
          file: name,
          message: `Missing required file: ${name}`,
          tier: "structural",
        } as IngestionError;
      }
      return null;
    }
    const arrayBuffer = await file.async("arraybuffer");
    return Buffer.from(arrayBuffer);
  };

  // 1. Structural checks & raw string/buffer parsing
  const config = JSON.parse(await getFileStr("config.json"));

  let summary: any;
  let events: any;
  let populationCsv: string = "";
  let timelineCsv: string = "";
  let birthsCsv: string = "";
  let deathsCsv: string = "";
  let genesCsv: string = "";
  let coloniesCsv: string = "";
  let agentCensusCsv: string = "";

  const hasFile = (name: string): boolean => {
    return contents.file(prefix + name) !== null;
  };

  const hasTelemetry =
    hasFile("summary.json") &&
    hasFile("events.json") &&
    hasFile("population.csv") &&
    hasFile("timeline.csv") &&
    hasFile("births.csv") &&
    hasFile("deaths.csv") &&
    hasFile("genes.csv") &&
    hasFile("colonies.csv") &&
    hasFile("agent_census.csv");

  if (hasTelemetry) {
    summary = JSON.parse(await getFileStr("summary.json"));
    events = JSON.parse(await getFileStr("events.json"));
    populationCsv = await getFileStr("population.csv");
    timelineCsv = await getFileStr("timeline.csv");
    birthsCsv = await getFileStr("births.csv");
    deathsCsv = await getFileStr("deaths.csv");
    genesCsv = await getFileStr("genes.csv");
    coloniesCsv = await getFileStr("colonies.csv");
    agentCensusCsv = await getFileStr("agent_census.csv");
  } else {
    // Reconstruct missing telemetry files from the final checkpoint if available
    const checkpointFiles = fileNames
      .filter(
        (n) => (n.includes("checkpoint_") || n.includes("full_checkpoint_")) && n.endsWith(".json"),
      )
      .map((n) => {
        const basename = n.slice(n.lastIndexOf("/") + 1);
        const match = basename.match(/(?:full_)?checkpoint_(\d+)\.json$/);
        return {
          name: n,
          tick: match ? parseInt(match[1], 10) : 0,
        };
      })
      .sort((a, b) => b.tick - a.tick);

    if (checkpointFiles.length === 0) {
      throw {
        file: "summary.json",
        message:
          "Missing required file: summary.json and no checkpoints found to reconstruct state",
        tier: "structural",
      } as IngestionError;
    }

    const latestCheckpointName = checkpointFiles[0].name;
    const checkpointStr = await contents.file(latestCheckpointName)!.async("string");
    const checkpointData = JSON.parse(checkpointStr);

    const lastGen = checkpointData.agents
      ? Math.max(...checkpointData.agents.map((a: any) => a.generation || 0), 0)
      : 0;
    const aliveAgents = checkpointData.agents
      ? checkpointData.agents.filter((a: any) => !a.dead).length
      : 0;
    const geneticHist = checkpointData.genetic_history || [];
    const avgGenDiversity =
      geneticHist.length > 0 ? geneticHist[geneticHist.length - 1].diversity_score || 0 : 0.5;

    summary = {
      seed: checkpointData.seed,
      ticks: checkpointData.tick,
      survivors: aliveAgents,
      total_agents: checkpointData.next_agent_id || checkpointData.agents?.length || 0,
      max_generation: lastGen || checkpointData.generation_number || 0,
      avg_discoveries: 0,
      avg_radius: 0,
      avg_genetic_diversity: avgGenDiversity,
      experiment: config.experiment_name || latestCheckpointName.split("/")[0] || "Simulation Run",
    };

    events = checkpointData.events_timeline || [];

    populationCsv = "tick,total_alive,colony_alpha,colony_beta,colony_gamma,colony_delta\n";
    const popHist = checkpointData.population_history || [];
    popHist.forEach((p: any) => {
      const cols = p.per_colony || [0, 0, 0, 0];
      populationCsv += `${p.tick},${p.total},${cols[0] || 0},${cols[1] || 0},${cols[2] || 0},${cols[3] || 0}\n`;
    });

    timelineCsv = "tick,year,day,event_type,description\n";
    events.forEach((ev: any) => {
      const year = Math.floor(ev.tick / 360);
      const day = ev.tick % 360;
      timelineCsv += `${ev.tick},${year},${day},${ev.type || "Global Event"},"${(ev.description || "").replace(/"/g, '""')}"\n`;
    });

    birthsCsv = "agent_id,generation,colony_id,parent_a_id,parent_b_id,born_tick,spawn_biome\n";
    deathsCsv =
      "agent_id,generation,colony_id,age_ticks,ticks_survived,primary_cause,secondary_cause,location_x,location_y\n";
    agentCensusCsv =
      "agent_id,alive,generation,colony_id,age_ticks,max_age,health,hunger,thirst,energy,discoveries,x,y\n";

    if (checkpointData.agents) {
      checkpointData.agents.forEach((a: any) => {
        const loc = a.location || [0, 0];
        const parentIds = a.parent_ids || [];

        if (parentIds.length > 0) {
          birthsCsv += `${a.id},${a.generation || 0},${a.colony_id || 0},${parentIds[0] || -1},${parentIds[1] || -1},${a.born_tick || 0},${a.spawn_biome || "Unknown"}\n`;
        }

        if (a.dead) {
          deathsCsv += `${a.id},${a.generation || 0},${a.colony_id || 0},${a.age || 0},${a.ticks_survived || 0},${a.primary_cause || "None"},${a.secondary_cause || "None"},${Math.floor(loc[1])},${Math.floor(loc[0])}\n`;
        }

        agentCensusCsv += `${a.id},${a.dead ? 0 : 1},${a.generation || 0},${a.colony_id || 0},${a.age || 0},${a.max_age || 100},${a.health || 100},${a.hunger || 0},${a.thirst || 0},${a.energy || 100},${a.discoveries_count || 0},${Math.floor(loc[1])},${Math.floor(loc[0])}\n`;
      });
    }

    genesCsv = "tick,diversity_score\n";
    geneticHist.forEach((g: any) => {
      genesCsv += `${g.tick},${g.diversity_score || 0}\n`;
    });

    coloniesCsv = "colony_id,name,color,stored_food,stored_water,founders\n";
    if (checkpointData.colonies) {
      checkpointData.colonies.forEach((c: any) => {
        const founders = c.founder_ids || [];
        coloniesCsv += `${c.id},${c.name},${c.color},${c.stored_food || 0},${c.stored_water || 0},"${founders.join(",")}"\n`;
      });
    }

    if (hasFile("agent_census.csv")) {
      agentCensusCsv = await getFileStr("agent_census.csv");
    }
  }

  const biomesPngBytes = await getFileBuffer("biomes.png", false);
  const elevationPngBytes = await getFileBuffer("elevation.png", false);
  const temperaturePngBytes = await getFileBuffer("temperature.png", false);
  const rainfallPngBytes = await getFileBuffer("rainfall.png", false);
  const riversPngBytes = await getFileBuffer("rivers.png", false);
  const habitabilityPngBytes = await getFileBuffer("habitability.png", false);
  const tradePngBytes = await getFileBuffer("trade.png", false);
  const simulationPngBytes = await getFileBuffer("simulation.png", false);
  const worldPngBytes = await getFileBuffer("world.png", false); // Optional for legacy runs
  const replayJsonStr = await getFileStr("replay.json", false); // Optional

  return {
    config,
    summary,
    events,
    populationCsv,
    timelineCsv,
    birthsCsv,
    deathsCsv,
    genesCsv,
    coloniesCsv,
    agentCensusCsv,
    worldPngBytes,
    replayJsonStr,
    biomesPngBytes,
    elevationPngBytes,
    temperaturePngBytes,
    rainfallPngBytes,
    riversPngBytes,
    habitabilityPngBytes,
    tradePngBytes,
    simulationPngBytes,
  };
}
