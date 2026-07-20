import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = "https://tyajlotsxwocxxawcwta.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWpsb3RzeHdvY3h4YXdjd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MTQxNiwiZXhwIjoyMDk5NjE3NDE2fQ.DNByNwePQi2msrT6eJvsoti1NCow2cX3-3LdRNrUCFk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const mapping = {
  "GEN-0001": {
    folder: "2026-06-28_12-04-56_fights alowwed with instalnt heal to check realtionship logic",
    ticks: 15384,
    ticks_limit: 1000000,
    max_generation: 3,
    survivors: 198,
    total: 307,
  },
  "GEN-0002": {
    folder: "2026-06-28_13-16-27_fights alowwed with instalnt heal to check realtionship logic",
    ticks: 13371,
    ticks_limit: 1000000,
    max_generation: 3,
    survivors: 103,
    total: 196,
  },
  "GEN-0003": {
    folder: "2026-06-28_21-37-33_fights alowwed with insta heal , new seed",
    ticks: 11209,
    ticks_limit: 1000000,
    max_generation: 1,
    survivors: 0,
    total: 17,
  },
  "GEN-0004": {
    folder: "2026-07-13_08-58-04_fights alowwed with insta heal , new seed",
    ticks: 7970,
    ticks_limit: 1000000,
    max_generation: 1,
    survivors: 0,
    total: 18,
  },
  "GEN-VAL-001": {
    folder: "2026-07-16_22-40-00_atlas_verification_run",
    ticks: 100,
    ticks_limit: 100,
    max_generation: 0,
    survivors: 16,
    total: 16,
  },
  "GEN-VAL-002": {
    folder: "2026-06-28_19-23-06_reflex validation short",
    ticks: 2000,
    ticks_limit: 2000,
    max_generation: 1,
    survivors: 28,
    total: 28,
  },
};

async function run() {
  console.log("Aligning legacy database records with real simulation outputs...");

  for (const [id, info] of Object.entries(mapping)) {
    console.log(`\nProcessing ${id}...`);

    // Fetch current record
    const { data: record, error: fetchErr } = await supabase
      .from("experiments")
      .select("config_json, summary_json")
      .eq("id", id)
      .single();

    if (fetchErr || !record) {
      console.error(`  [Error] Failed to fetch record for ${id}: ${fetchErr?.message}`);
      continue;
    }

    // Merge updated tick limit & durations
    const updatedConfig = {
      ...(record.config_json || {}),
      ticks: info.ticks,
      ticks_limit: info.ticks_limit,
    };

    const updatedSummary = {
      ...(record.summary_json || {}),
      ticks: info.ticks_limit,
      actual_ticks: info.ticks,
      max_generation: info.max_generation,
      survivors: `${info.survivors}/${info.total}`,
    };

    // Update db row
    const { error: updateErr } = await supabase
      .from("experiments")
      .update({
        ticks: info.ticks, // Actual Simulation Duration (output)
        max_generation: info.max_generation,
        survivors_count: info.survivors,
        total_agents: info.total,
        config_json: updatedConfig,
        summary_json: updatedSummary,
      })
      .eq("id", id);

    if (updateErr) {
      console.error(`  [Error] Failed to update ${id}: ${updateErr.message}`);
    } else {
      console.log(`  [Success] ${id} database columns synchronized.`);
    }
  }

  console.log("\n✓ Database alignment check complete.");
}

run().catch(console.error);
