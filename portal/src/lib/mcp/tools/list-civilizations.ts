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
  name: "list_civilizations",
  title: "List civilizations",
  description:
    "List published civilization records from the Genesis public archive (id, slug, title, abstract, tags, seed, ticks, and headline metrics).",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(25).describe("Max records to return"),
    offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    featured_only: z.boolean().default(false).describe("Return only featured records"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, offset, featured_only }) => {
    const sb = publicSupabase();
    let query = sb
      .from("experiments")
      .select(
        "id, slug, title, abstract, tags, seed, ticks, world_preset, total_agents, survivors_count, max_generation, is_featured, published_at",
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (featured_only) query = query.eq("is_featured", true);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { civilizations: data ?? [] },
    };
  },
});
