"use server";

import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { createSessionToken, verifySessionToken } from "./auth";
import { supabaseServer } from "./supabase-server";

// Atlas URL builder - single source of truth for storage paths
const SUPABASE_STORAGE_BASE =
  "https://tyajlotsxwocxxawcwta.supabase.co/storage/v1/object/public/experiments";

export function buildAtlasUrls(experimentId: string) {
  const base = `${SUPABASE_STORAGE_BASE}/${experimentId}/atlas`;
  return {
    biomes: `${base}/biomes.png`,
    elevation: `${base}/elevation.png`,
    temperature: `${base}/temperature.png`,
    rainfall: `${base}/rainfall.png`,
    rivers: `${base}/rivers.png`,
    habitability: `${base}/habitability.png`,
    trade: `${base}/trade.png`,
    simulation: `${base}/simulation.png`,
  };
}

// 1. Authenticate login credentials and set cookie
export const loginAction = createServerFn({ method: "POST" })
  .validator((password: string) => password)
  .handler(async ({ data: password }) => {
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin-genesis";
    if (password !== expectedPassword) {
      throw new Error("Unauthorized: Invalid password");
    }

    const token = await createSessionToken();

    // Set HttpOnly session cookie natively via Response headers
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Set-Cookie": `genesis_admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=86400`,
        "Content-Type": "application/json",
      },
    });
  });

// 2. Verify auth session cookie on control panel
export const verifyAdminAuth = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(/genesis_admin_session=([^;]+)/);
  const token = match ? match[1] : "";

  if (!token || !(await verifySessionToken(token))) {
    throw redirect({ to: "/control/login" });
  }
  return { authenticated: true };
});

// 2b. Check admin status boolean (non-redirecting)
export const checkAdminAuthStatus = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(/genesis_admin_session=([^;]+)/);
  const token = match ? match[1] : "";

  if (!token) return { isAdmin: false };
  const isValid = await verifySessionToken(token);
  return { isAdmin: isValid };
});

// 3. Fetch published experiments from database (includes computed atlas URLs)
export const fetchCivilizations = createServerFn({ method: "GET" }).handler(async () => {
  const { data: civilizations, error } = await supabaseServer
    .from("experiments")
    .select(
      "id, slug, title, seed, world_preset, scarcity, ticks, total_agents, survivors_count, max_generation, published_at, thumbnail_url, cover_url, is_featured, tags, abstract, engine_version, summary_json",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  // Enrich each record with computed atlas URLs - UI never hardcodes storage paths
  const enriched = (civilizations || []).map((civ: any) => ({
    ...civ,
    atlas: buildAtlasUrls(civ.id),
    // Prefer atlas biome map, fallback to thumbnail, then cover
    previewUrl: civ.thumbnail_url || civ.cover_url || buildAtlasUrls(civ.id).biomes,
  }));

  return enriched;
});

// 4. Fetch a single experiment + 3 related ones (includes atlas URLs)
export const fetchCivilizationData = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    console.log("[fetchCivilizationData] Requesting ID:", id);
    const { data: record, error } = await supabaseServer
      .from("experiments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[fetchCivilizationData] DB query error:", error.message, error.details || "");
    }
    console.log("[fetchCivilizationData] Record retrieved:", !!record);

    if (error || !record) {
      throw new Error("Civilization not found");
    }

    const { data: relatedData } = await supabaseServer
      .from("experiments")
      .select(
        "id, slug, title, seed, world_preset, scarcity, ticks, total_agents, survivors_count, max_generation, published_at, thumbnail_url, is_featured, tags",
      )
      .eq("is_published", true)
      .neq("id", id)
      .limit(3);

    return {
      record: {
        ...record,
        atlas: buildAtlasUrls(record.id),
        previewUrl: record.thumbnail_url || record.cover_url || buildAtlasUrls(record.id).biomes,
      },
      related: (relatedData || []).map((r: any) => ({
        ...r,
        atlas: buildAtlasUrls(r.id),
        previewUrl: r.thumbnail_url || r.cover_url || buildAtlasUrls(r.id).biomes,
      })),
    };
  });

// 5. Fetch pre-computed replay.json from Supabase Storage
export const fetchExperimentReplay = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const replayUrl = `${SUPABASE_STORAGE_BASE}/${id}/replay/replay.json`;
    try {
      const res = await fetch(replayUrl);
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  });

// 6. Update experiment metadata (abstract, summary_json, findings, questions, comments)
export const updateExperimentData = createServerFn({ method: "POST" })
  .validator((data: { id: string; abstract?: string; summary_json?: any }) => data)
  .handler(async ({ data }) => {
    const { id, abstract, summary_json } = data;
    const updatePayload: any = {};
    if (abstract !== undefined) updatePayload.abstract = abstract;
    if (summary_json !== undefined) updatePayload.summary_json = summary_json;

    const { error } = await supabaseServer
      .from("experiments")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.warn("[updateExperimentData] Supabase update error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  });

// 7. Fetch paginated Agent Census Telemetry records from Supabase
export const fetchExperimentAgents = createServerFn({ method: "POST" })
  .validator((data: { experimentId: string; colony?: string; page?: number; limit?: number }) => data)
  .handler(async ({ data }) => {
    const { experimentId, colony, page = 1, limit = 25 } = data;
    let query = supabaseServer
      .from("experiment_agents")
      .select("*", { count: "exact" })
      .eq("experiment_id", experimentId);

    if (colony && colony !== "All") {
      query = query.eq("colony_name", colony);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: agents, count, error } = await query
      .order("agent_id", { ascending: true })
      .range(from, to);

    if (error) {
      console.warn("[fetchExperimentAgents] Error fetching agents:", error.message);
      return { agents: [], total: 0 };
    }

    return { agents: agents || [], total: count || 0 };
  });


