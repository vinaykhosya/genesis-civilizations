import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tyajlotsxwocxxawcwta.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWpsb3RzeHdvY3h4YXdjd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MTQxNiwiZXhwIjoyMDk5NjE3NDE2fQ.DNByNwePQi2msrT6eJvsoti1NCow2cX3-3LdRNrUCFk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

try {
  const { data, error } = await supabase
    .from("experiments")
    .select("summary_json, config_json")
    .limit(1);

  if (error) throw error;
  console.log("Config JSON keys:", Object.keys(data[0].config_json || {}));
  console.log("Summary JSON keys:", Object.keys(data[0].summary_json || {}));
  console.log("Summary details:", JSON.stringify(data[0].summary_json, null, 2).slice(0, 1500));
} catch (err) {
  console.error(err);
}
