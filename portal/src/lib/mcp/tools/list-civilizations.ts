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
    "List published civilization records from the Genesis archive. Returns id, slug, name, and summary metadata for each experiment.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(25).describe("Max records to return"),
    offset: z.number().int().min(0).default(0).describe("Pagination offset"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, offset }) => {
    const sb = publicSupabase();
    const { data, error } = await sb
      .from("experiments")
      .select("id, slug, name, published_at, summary")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { civilizations: data ?? [] },
    };
  },
});
