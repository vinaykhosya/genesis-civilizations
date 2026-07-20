import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { processExperiment } from "@/lib/ingestion/processor";
import { processAssets } from "@/lib/ingestion/assets";
import { uploadAssets } from "@/lib/ingestion/storage";
import { publishExperiment } from "@/lib/ingestion/publisher";
import { rollbackStagingAssets } from "@/lib/ingestion/rollback";

// Randomized suffix (ADR-001 / ID format check)
function generateRandomHash(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let hash = "";
  for (let i = 0; i < 4; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { stagingId: string } }
) {
  const { stagingId } = params;
  const stagingDir = path.join(process.cwd(), "generated");
  const metaPath = path.join(stagingDir, `staging-${stagingId}.json`);
  const zipPath = path.join(stagingDir, `staging-${stagingId}.zip`);

  let metaExists = false;
  try {
    await fs.access(metaPath);
    metaExists = true;
  } catch {}

  if (!metaExists) {
    return NextResponse.json({ error: "Staging package expired or not found" }, { status: 404 });
  }

  // Read staged data
  const metaData = JSON.parse(await fs.readFile(metaPath, "utf-8"));
  const zipBytes = await fs.readFile(zipPath);

  const { parsed, health } = metaData;

  // Generate canonical ID
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const hash = generateRandomHash();
  const id = `EXP-${today}-${hash}`;

  // Slugify title
  const { title, abstract, tags, isFeatured } = await req.json();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // Build Canonical Experiment Object
  const canonical = processExperiment(id, slug, parsed, health, zipBytes);

  let uploadedPaths: any = null;

  try {
    // 1. Process images to WebP
    const webpAssets = await processAssets(canonical.worldPngBytes);

    // 2. Upload storage assets (ZIP, PNG, WebPs)
    uploadedPaths = await uploadAssets(
      id,
      canonical.rawZipBytes,
      canonical.worldPngBytes,
      webpAssets.thumbnailWebp,
      webpAssets.ogWebp,
      parsed.replayJsonStr
    );

    // 3. Insert database records
    await publishExperiment(canonical, uploadedPaths, title, abstract, tags, isFeatured);

    // 4. Cleanup staging files
    await fs.unlink(metaPath);
    await fs.unlink(zipPath);

    return NextResponse.json({
      success: true,
      id,
      slug,
      url: `/archive/civilizations/${id}`
    });
  } catch (err: any) {
    // TRANSACTION ROLLBACK ACTION: Clean up storage uploads
    console.error("Database insert or storage processing failed. Rolling back...", err);
    if (uploadedPaths) {
      await rollbackStagingAssets(id, !!uploadedPaths.replayJsonPath);
    }
    return NextResponse.json({ error: err.message || "Failed to commit experiment run to database" }, { status: 500 });
  }
}
