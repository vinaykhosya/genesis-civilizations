import { createFileRoute } from "@tanstack/react-router";
import { parseExperimentZip } from "@/lib/ingestion/parser";
import { validateExperiment } from "@/lib/ingestion/validator";
import { stageExperiment } from "@/lib/ingestion/staging-store";
import { supabaseServer } from "@/lib/supabase-server";
import path from "path";

export const Route = createFileRoute("/api/v1/admin/experiments/upload")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const filename = url.searchParams.get("filename") || "experiment.zip";

          // Generate a clean safe path inside packages bucket
          const cleanFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
          const filePath = `staging/${crypto.randomUUID()}-${cleanFilename}`;

          const { data, error } = await supabaseServer.storage
            .from("packages")
            .createSignedUploadUrl(filePath);

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ signedUrl: data.signedUrl, filePath }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: err.message || "Failed to generate signed URL" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          let fileBuffer: Buffer;
          let filename = "experiment.zip";

          const contentType = request.headers.get("content-type") || "";

          if (contentType.includes("application/json")) {
            // Direct file path download flow (large files bypass Vercel limit)
            const body = await request.json();
            const filePath = body.filePath;

            if (!filePath) {
              return new Response(JSON.stringify({ error: "Missing filePath" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }

            // Download from Supabase packages bucket
            const { data: fileData, error: downloadError } = await supabaseServer.storage
              .from("packages")
              .download(filePath);

            if (downloadError) {
              return new Response(
                JSON.stringify({
                  error: `Failed to download file from storage: ${downloadError.message}`,
                }),
                { status: 500, headers: { "Content-Type": "application/json" } },
              );
            }

            fileBuffer = Buffer.from(await fileData.arrayBuffer());
            filename = path.basename(filePath);
          } else {
            // Legacy form-data flow (small files fallback)
            const formData = await request.formData();
            const file = formData.get("file") as File;

            if (!file) {
              return new Response(JSON.stringify({ error: "No file uploaded" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }

            fileBuffer = Buffer.from(await file.arrayBuffer());
            filename = file.name;
          }

          // 1. Parser extraction
          const parsed = await parseExperimentZip(fileBuffer);

          // 2. Health & Validation Report
          const health = validateExperiment(parsed);

          if (health.errors.length > 0) {
            return new Response(
              JSON.stringify({
                error: "Validation failed",
                errors: health.errors,
              }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          // 3. Duplicate Detection Check
          const { data: existing } = await supabaseServer
            .from("experiments")
            .select("id")
            .eq("seed", parsed.summary.seed)
            .eq("ticks", parsed.summary.ticks)
            .limit(1);

          const isDuplicate = existing && existing.length > 0;

          // 4. Stage in memory
          const stagingId = crypto.randomUUID();
          stageExperiment(stagingId, parsed, health, new Uint8Array(fileBuffer));

          const preview = {
            seed: parsed.summary.seed,
            ticks: parsed.summary.ticks,
            scarcity: parsed.config.scarcity,
            worldPreset: parsed.config.world_preset,
            autoTitle: parsed.summary.experiment || `Simulation Seed ${parsed.config.seed}`,
            suggestedTags: [
              parsed.config.world_preset || "custom_world",
              parsed.config.scarcity >= 4.0 ? "scarcity_extreme" : "scarcity_normal",
              parsed.config.climate_epoch_mode,
            ].filter(Boolean),
          };

          return new Response(
            JSON.stringify({
              stagingId,
              preview,
              health,
              isDuplicate,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: err.message || "Failed to process ZIP package" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
