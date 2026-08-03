import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function publicSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase public credentials not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export default defineTool({
  name: "list_chronicle_events",
  title: "List chronicle events",
  description:
    "List narrative chronicle events (Birth, Death, Milestone, Disaster, Dispute, ClimateEpoch, Extinction) for a published civilization, ordered by tick.",
  inputSchema: {
    experiment_id: z.string().min(1).describe("Experiment id (EXP-...)"),
    event_type: z.string().optional().describe("Optional filter by event type"),
    limit: z.number().int().min(1).max(200).default(50),
    offset: z.number().int().min(0).default(0),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ experiment_id, event_type, limit, offset }) => {
    const sb = publicSupabase();
    let q = sb
      .from("experiment_events")
      .select("tick, year, day, event_type, description, metadata")
      .eq("experiment_id", experiment_id)
      .order("tick", { ascending: true })
      .range(offset, offset + limit - 1);
    if (event_type) q = q.eq("event_type", event_type);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { events: data ?? [] },
    };
  },
});
