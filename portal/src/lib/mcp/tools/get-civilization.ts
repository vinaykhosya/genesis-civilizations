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
  name: "get_civilization",
  title: "Get civilization record",
  description:
    "Fetch the full published record for one civilization by id (e.g. 'EXP-20260627-XY81') or slug, including config and summary JSON.",
  inputSchema: {
    id_or_slug: z.string().min(1).describe("Experiment id (EXP-...) or url slug"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id_or_slug }) => {
    const sb = publicSupabase();
    const { data, error } = await sb
      .from("experiments")
      .select("*")
      .eq("is_published", true)
      .or(`id.eq.${id_or_slug},slug.eq.${id_or_slug}`)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data)
      return {
        content: [{ type: "text", text: `No published civilization found for '${id_or_slug}'.` }],
        isError: true,
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { civilization: data },
    };
  },
});
