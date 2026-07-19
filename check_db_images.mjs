import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tyajlotsxwocxxawcwta.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWpsb3RzeHdvY3h4YXdjd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MTQxNiwiZXhwIjoyMDk5NjE3NDE2fQ.DNByNwePQi2msrT6eJvsoti1NCow2cX3-3LdRNrUCFk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

try {
  const { data, error } = await supabase
    .from("experiments")
    .select("id, title, seed, thumbnail_url, cover_url, published_at")
    .order("published_at", { ascending: false });

  if (error) throw error;
  console.log("Experiments count:", data.length);
  console.log("Experiments details:");
  data.forEach((row) => {
    console.log(`ID: ${row.id} | Title: ${row.title} | Seed: ${row.seed}`);
    console.log(`  Thumbnail: ${row.thumbnail_url}`);
    console.log(`  Cover: ${row.cover_url}`);
  });
} catch (err) {
  console.error(err);
}
