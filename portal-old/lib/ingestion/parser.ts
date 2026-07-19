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
      tier: "structural"
    } as IngestionError;
  }

  const getFileStr = async (name: string, required = true): Promise<string> => {
    const file = contents.file(name);
    if (!file) {
      if (required) {
        throw {
          file: name,
          message: `Missing required file: ${name}`,
          tier: "structural"
        } as IngestionError;
      }
      return "";
    }
    return await file.async("string");
  };

  const getFileBuffer = async (name: string, required = true): Promise<Buffer | null> => {
    const file = contents.file(name);
    if (!file) {
      if (required) {
        throw {
          file: name,
          message: `Missing required file: ${name}`,
          tier: "structural"
        } as IngestionError;
      }
      return null;
    }
    const arrayBuffer = await file.async("arraybuffer");
    return Buffer.from(arrayBuffer);
  };

  // 1. Structural checks & raw string/buffer parsing
  const config = JSON.parse(await getFileStr("config.json"));
  const summary = JSON.parse(await getFileStr("summary.json"));
  const events = JSON.parse(await getFileStr("events.json"));
  
  const populationCsv = await getFileStr("population.csv");
  const timelineCsv = await getFileStr("timeline.csv");
  const birthsCsv = await getFileStr("births.csv");
  const deathsCsv = await getFileStr("deaths.csv");
  const genesCsv = await getFileStr("genes.csv");
  const coloniesCsv = await getFileStr("colonies.csv");
  const agentCensusCsv = await getFileStr("agent_census.csv");

  const worldPngBytes = await getFileBuffer("world.png", true); // Required by ADR-002
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
    replayJsonStr
  };
}
