// Run schema using Supabase's pg_query HTTP endpoint
const supabaseUrl = "https://tyajlotsxwocxxawcwta.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWpsb3RzeHdvY3h4YXdjd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MTQxNiwiZXhwIjoyMDk5NjE3NDE2fQ.DNByNwePQi2msrT6eJvsoti1NCow2cX3-3LdRNrUCFk";

import { readFileSync } from "fs";
import { join } from "path";

const fullSql = readFileSync(join(process.cwd(), "portal/src/lib/schema.sql"), "utf8");

// Split into individual statements to avoid transaction issues  
const statements = fullSql
  .split(";")
  .map(s => s.trim())
  .filter(s => s.length > 3 && !s.startsWith("--"));

console.log(`Found ${statements.length} SQL statements to run`);

let ok = 0;
let fail = 0;

for (const stmt of statements) {
  const query = stmt + ";";
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`
    },
    body: JSON.stringify({ query })
  });
  
  if (res.ok) {
    ok++;
  } else {
    const t = await res.text();
    // Ignore "already exists" errors
    if (t.includes("already exists") || t.includes("duplicate")) {
      ok++;
    } else {
      console.log(`⚠ Statement failed (${res.status}):`, query.substring(0, 80));
      console.log(`  Error:`, t.substring(0, 200));
      fail++;
    }
  }
}

console.log(`\n✓ Complete: ${ok} succeeded, ${fail} failed`);
