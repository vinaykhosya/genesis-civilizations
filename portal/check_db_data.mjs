import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tyajlotsxwocxxawcwta.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWpsb3RzeHdvY3h4YXdjd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MTQxNiwiZXhwIjoyMDk5NjE3NDE2fQ.DNByNwePQi2msrT6eJvsoti1NCow2cX3-3LdRNrUCFk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: records, error } = await supabase
    .from("experiments")
    .select(
      "id, title, ticks, max_generation, survivors_count, total_agents, config_json, summary_json",
    )
    .order("id");

  if (error) {
    console.error("Error fetching records:", error);
    return;
  }

  for (const r of records) {
    console.log(`ID: ${r.id} | Title: ${r.title}`);
    console.log(
      `  Ticks: ${r.ticks} | Max Gen: ${r.max_generation} | Survivors: ${r.survivors_count} | Total Agents: ${r.total_agents}`,
    );
    console.log(
      `  Config JSON Ticks: ${r.config_json?.ticks} | Summary JSON Ticks: ${r.summary_json?.metadata?.actual_ticks || r.summary_json?.ticks || r.summary_json?.actualTicks}`,
    );
  }
}

run();
