import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const supabaseUrl = "https://tyajlotsxwocxxawcwta.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWpsb3RzeHdvY3h4YXdjd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MTQxNiwiZXhwIjoyMDk5NjE3NDE2fQ.DNByNwePQi2msrT6eJvsoti1NCow2cX3-3LdRNrUCFk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const experimentsDir = "../experiments";

const mapping = {
  "GEN-0001": "2026-06-28_12-04-56_fights alowwed with instalnt heal to check realtionship logic",
  "GEN-0002": "2026-06-28_13-16-27_fights alowwed with instalnt heal to check realtionship logic",
  "GEN-0003": "2026-06-28_21-37-33_fights alowwed with insta heal , new seed",
  "GEN-0004": "2026-07-13_08-58-04_fights alowwed with insta heal , new seed",
  "GEN-VAL-001": "2026-07-16_22-40-00_atlas_verification_run",
  "GEN-VAL-002": "2026-06-28_19-23-06_reflex validation short",
};

async function uploadToBucket(bucket, storagePath, body, contentType) {
  const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error(`  [Storage Error] Failed to upload ${storagePath}: ${error.message}`);
  } else {
    console.log(`  [Storage Success] Uploaded: ${storagePath}`);
  }
}

async function run() {
  for (const [id, folderName] of Object.entries(mapping)) {
    console.log(`\n==================================================`);
    console.log(`Re-processing assets for ID: ${id} (${folderName})`);
    console.log(`==================================================`);

    const expFolder = path.join(experimentsDir, folderName);
    if (!fs.existsSync(expFolder)) {
      console.error(`Folder not found: ${expFolder}`);
      continue;
    }

    const zipPath = `${expFolder}.zip`;
    if (!fs.existsSync(zipPath)) {
      console.error(`ZIP file not found: ${zipPath}`);
      continue;
    }

    const zipBytes = fs.readFileSync(zipPath);

    // Read and verify world.png
    const worldPngPath = path.join(expFolder, "world.png");
    if (!fs.existsSync(worldPngPath)) {
      console.error(`world.png not found: ${worldPngPath}`);
      continue;
    }
    const worldPngBytes = fs.readFileSync(worldPngPath);

    // Generate WebP previews using sharp
    console.log("  Generating WebP previews...");
    const thumbnailBytes = await sharp(worldPngBytes)
      .resize(1024, 1024, {
        fit: "contain",
        background: { r: 12, g: 16, b: 25, alpha: 1 },
      })
      .webp({ quality: 85 })
      .toBuffer();

    const ogBytes = await sharp(worldPngBytes)
      .resize(1200, 630, {
        fit: "contain",
        background: { r: 12, g: 16, b: 25, alpha: 1 },
      })
      .webp({ quality: 85 })
      .toBuffer();

    // 1. Upload Core Assets
    console.log("  Uploading core package assets...");
    await uploadToBucket("experiments", `${id}/exports/package.zip`, zipBytes, "application/zip");
    await uploadToBucket("experiments", `${id}/preview/world.png`, worldPngBytes, "image/png");
    await uploadToBucket(
      "experiments",
      `${id}/preview/thumbnail.webp`,
      thumbnailBytes,
      "image/webp",
    );
    await uploadToBucket("experiments", `${id}/preview/og.webp`, ogBytes, "image/webp");

    // Optional replay.json
    const replayJsonPath = path.join(expFolder, "replay.json");
    let hasReplay = false;
    if (fs.existsSync(replayJsonPath)) {
      const replayJsonStr = fs.readFileSync(replayJsonPath, "utf8");
      await uploadToBucket(
        "experiments",
        `${id}/replay/replay.json`,
        replayJsonStr,
        "application/json",
      );
      hasReplay = true;
    }

    // 2. Upload Maps & track availability
    console.log("  Uploading high-definition maps...");
    const mapFiles = [
      "biomes.png",
      "elevation.png",
      "temperature.png",
      "rainfall.png",
      "rivers.png",
      "habitability.png",
      "trade.png",
      "simulation.png",
    ];

    const availableMaps = [];
    for (const mapFile of mapFiles) {
      const mapPath = path.join(expFolder, mapFile);
      if (fs.existsSync(mapPath)) {
        const mapBytes = fs.readFileSync(mapPath);
        const mapName = mapFile.replace(".png", "");
        await uploadToBucket("experiments", `${id}/atlas/${mapFile}`, mapBytes, "image/png");
        availableMaps.push(mapName);
      }
    }

    // 3. Retrieve and Update Database Record
    console.log("  Updating relational database record...");
    const { data: record, error: fetchErr } = await supabase
      .from("experiments")
      .select("summary_json")
      .eq("id", id)
      .single();

    if (fetchErr || !record) {
      console.error(`  [DB Error] Could not find experiment record ${id}: ${fetchErr?.message}`);
      continue;
    }

    const updatedSummary = {
      ...(record.summary_json || {}),
      available_maps: availableMaps,
    };

    const storageUrlPrefix = `${supabaseUrl}/storage/v1/object/public/experiments`;
    const { error: updateErr } = await supabase
      .from("experiments")
      .update({
        thumbnail_url: `${storageUrlPrefix}/${id}/preview/thumbnail.webp`,
        cover_url: `${storageUrlPrefix}/${id}/preview/world.png`,
        og_url: `${storageUrlPrefix}/${id}/preview/og.webp`,
        has_replay: hasReplay,
        summary_json: updatedSummary,
      })
      .eq("id", id);

    if (updateErr) {
      console.error(`  [DB Error] Failed to update experiment ${id}: ${updateErr.message}`);
    } else {
      console.log(`  [DB Success] Relational database record updated for ${id}.`);
    }
  }
  console.log("\n==================================================");
  console.log("✓ ALL ASSETS RE-UPLOADED AND DATABASE SYNCHRONIZED");
  console.log("==================================================");
}

run().catch(console.error);
