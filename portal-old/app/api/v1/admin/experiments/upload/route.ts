import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { parseExperimentZip } from "@/lib/ingestion/parser";
import { validateExperiment } from "@/lib/ingestion/validator";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Parser extraction
    const parsed = await parseExperimentZip(fileBuffer);

    // 2. Health & Validation Report
    const health = validateExperiment(parsed);

    if (health.errors.length > 0) {
      return NextResponse.json({
        error: "Validation failed",
        errors: health.errors
      }, { status: 422 });
    }

    // 3. Duplicate Detection Check
    const { data: existing } = await supabaseServer
      .from("experiments")
      .select("id")
      .eq("seed", parsed.summary.seed)
      .eq("ticks", parsed.summary.ticks)
      .limit(1);

    const isDuplicate = existing && existing.length > 0;

    // 4. Save to Staging Directory (Local Cache)
    const stagingId = crypto.randomUUID();
    const stagingDir = path.join(process.cwd(), "generated");
    
    await fs.mkdir(stagingDir, { recursive: true });
    
    // Save metadata staging JSON
    const metaPath = path.join(stagingDir, `staging-${stagingId}.json`);
    await fs.writeFile(metaPath, JSON.stringify({ parsed, health }, null, 2));

    // Save binary staging ZIP
    const zipPath = path.join(stagingDir, `staging-${stagingId}.zip`);
    await fs.writeFile(zipPath, fileBuffer);

    const preview = {
      seed: parsed.summary.seed,
      ticks: parsed.summary.ticks,
      scarcity: parsed.config.scarcity,
      worldPreset: parsed.config.world_preset,
      autoTitle: parsed.summary.experiment || `Simulation Seed ${parsed.config.seed}`,
      suggestedTags: [
        parsed.config.world_preset || "custom_world",
        parsed.config.scarcity >= 4.0 ? "scarcity_extreme" : "scarcity_normal",
        parsed.config.climate_epoch_mode
      ]
    };

    return NextResponse.json({
      stagingId,
      preview,
      health,
      isDuplicate
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process ZIP package" }, { status: 500 });
  }
}
