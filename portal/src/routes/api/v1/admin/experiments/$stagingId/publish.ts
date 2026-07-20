import { createFileRoute } from "@tanstack/react-router";
import { supabaseServer } from "@/lib/supabase-server";
import { processExperiment } from "@/lib/ingestion/processor";
import { processAssets } from "@/lib/ingestion/assets";
import { uploadAssets } from "@/lib/ingestion/storage";
import { publishExperiment } from "@/lib/ingestion/publisher";
import { rollbackStagingAssets } from "@/lib/ingestion/rollback";
import { getStaged, clearStaged } from "@/lib/ingestion/staging-store";

// Randomized suffix generator
function generateRandomHash(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let hash = "";
  for (let i = 0; i < 4; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

export const Route = createFileRoute("/api/v1/admin/experiments/$stagingId/publish")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { stagingId } = params;

        // Read staged data from in-memory store
        const staged = getStaged(stagingId);

        if (!staged) {
          return new Response(
            JSON.stringify({
              error: "Staging package expired or not found. Please re-upload the experiment ZIP.",
            }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          );
        }

        const { parsed, health, zipBytes } = staged;

        // Generate canonical ID
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const hash = generateRandomHash();
        const id = `EXP-${today}-${hash}`;

        // Slugify title
        const body = await request.json();
        const { title, abstract, tags, isFeatured } = body;

        let slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        // Check for slug uniqueness collision
        const { data: collision } = await supabaseServer
          .from("experiments")
          .select("id")
          .eq("slug", slug)
          .limit(1);

        if (collision && collision.length > 0) {
          slug = `${slug}-${hash.toLowerCase()}`;
        }

        // Build Canonical Experiment Object
        const zipBuffer = Buffer.from(zipBytes);
        const canonical = processExperiment(id, slug, parsed, health, zipBuffer);

        let uploadedPaths: any = null;

        try {
          // 1. Process images to WebP if present
          let webpAssets = { thumbnailWebp: Buffer.alloc(0), ogWebp: Buffer.alloc(0) };
          if (canonical.worldPngBytes && canonical.worldPngBytes.length > 0) {
            webpAssets = await processAssets(canonical.worldPngBytes);
          }

          // 2. Upload storage assets (ZIP, PNG, WebPs, Atlas maps)
          uploadedPaths = await uploadAssets(
            id,
            canonical.rawZipBytes,
            canonical.worldPngBytes,
            webpAssets.thumbnailWebp,
            webpAssets.ogWebp,
            parsed.replayJsonStr,
            {
              biomes: canonical.biomesPngBytes,
              elevation: canonical.elevationPngBytes,
              temperature: canonical.temperaturePngBytes,
              rainfall: canonical.rainfallPngBytes,
              rivers: canonical.riversPngBytes,
              habitability: canonical.habitabilityPngBytes,
              trade: canonical.tradePngBytes,
              simulation: canonical.simulationPngBytes,
            },
          );

          // 3. Insert database records
          await publishExperiment(canonical, uploadedPaths, title, abstract, tags, isFeatured);

          // 4. Clear from memory store
          clearStaged(stagingId);

          return new Response(
            JSON.stringify({
              success: true,
              id,
              slug,
              url: `/archive/civilizations/${id}`,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (err: any) {
          // TRANSACTION ROLLBACK ACTION: Clean up storage uploads
          console.error("Database insert or storage processing failed. Rolling back...", err);
          if (uploadedPaths) {
            await rollbackStagingAssets(id, !!uploadedPaths.replayJsonPath);
          }
          return new Response(
            JSON.stringify({ error: err.message || "Failed to commit experiment run to database" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
