import fs from "fs";
import path from "path";
import { parseExperimentZip } from "../lib/ingestion/parser";
import { validateExperiment } from "../lib/ingestion/validator";
import { processExperiment } from "../lib/ingestion/processor";
import { processAssets } from "../lib/ingestion/assets";
import { uploadAssets } from "../lib/ingestion/storage";
import { publishExperiment } from "../lib/ingestion/publisher";
import { rollbackStagingAssets } from "../lib/ingestion/rollback";

// 1. Parse and load environment variables from .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  });
}

// Ensure critical variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL environment variable is missing in .env.local");
  process.exit(1);
}

// ID suffix hash generator
function generateRandomHash(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let hash = "";
  for (let i = 0; i < 4; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

async function runPublisher() {
  const zipFilePath = process.argv[2];
  if (!zipFilePath) {
    console.log("Usage: pnpm run publish <path-to-experiment-zip>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(zipFilePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found at ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`[Publishing] Reading experiment ZIP: ${path.basename(resolvedPath)}...`);
  const zipBytes = fs.readFileSync(resolvedPath);

  try {
    // 1. Extraction
    const parsed = await parseExperimentZip(zipBytes);

    // 2. Health & Validation Checks
    const health = validateExperiment(parsed);
    console.log("--------------------------------------------------");
    console.log(`Health Validation Score: ${health.score}%`);
    console.log(`Errors: ${health.errors.length} | Warnings: ${health.warnings.length}`);
    console.log("--------------------------------------------------");

    if (health.errors.length > 0) {
      console.error("Ingestion blocked due to critical validation errors:");
      health.errors.forEach(err => console.error(` - [${err.tier}] ${err.file}: ${err.message}`));
      process.exit(1);
    }

    if (health.warnings.length > 0) {
      console.log("Warnings flagged during checks:");
      health.warnings.forEach(warn => console.log(` - ${warn.message}`));
    }

    // 3. Metadata inputs (Pre-formatted title based on seed)
    const title = parsed.summary.experiment || `Simulation Seed ${parsed.config.seed}`;
    const abstract = "";
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // 4. Generate ID
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const hash = generateRandomHash();
    const id = `EXP-${today}-${hash}`;

    console.log(`[Publishing] Compiling staging files for ID: ${id}...`);
    const canonical = processExperiment(id, slug, parsed, health, zipBytes);

    // 5. Image conversions to WebP
    console.log("[Publishing] Downsampling cover assets using sharp...");
    const webpAssets = await processAssets(canonical.worldPngBytes);

    // 6. S3 Storage Uploads
    console.log("[Publishing] Uploading binary assets to storage buckets...");
    const uploadedPaths = await uploadAssets(
      id,
      canonical.rawZipBytes,
      canonical.worldPngBytes,
      webpAssets.thumbnailWebp,
      webpAssets.ogWebp,
      parsed.replayJsonStr
    );

    // 7. Database Writes
    console.log("[Publishing] Logging relational registry values to database...");
    await publishExperiment(canonical, uploadedPaths, title, abstract, [], false);

    console.log("\n==================================================");
    console.log(`✓ INGESTION SUCCESSFUL`);
    console.log(`Civilization Record Created: ${id}`);
    console.log(`URL: https://genesis.vinaykhosya.com/archive/civilizations/${id}`);
    console.log("==================================================");
  } catch (err: any) {
    console.error("\n[Rollback] Publication cascade failed. Clearing uploads...", err);
    process.exit(1);
  }
}

runPublisher();
