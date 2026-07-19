import React from "react";
import { supabaseServer } from "@/lib/supabase-server";
import CivilizationCard, { ExperimentCardProps } from "@/components/civilization/CivilizationCard";

// Enable revalidation caching for 5 minutes (ISR)
export const revalidate = 300;

export default async function ArchivePage() {
  // Query all published experiments
  const { data: civilizations, error } = await supabaseServer
    .from("experiments")
    .select("id, slug, title, world_preset, scarcity, ticks, total_agents, survivors_count, max_generation, published_at, thumbnail_url, is_featured, tags")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  // Map database fields to components props
  const cards: ExperimentCardProps[] = (civilizations || []).map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    worldPreset: row.world_preset,
    scarcity: row.scarcity,
    ticks: row.ticks,
    totalAgents: row.total_agents || 0,
    survivors: row.survivors_count || 0,
    maxGeneration: row.max_generation || 0,
    publishedAt: row.published_at,
    thumbnailUrl: row.thumbnail_url,
    isFeatured: row.is_featured || false,
    tags: row.tags || []
  }));

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-void)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      padding: "4rem 2rem"
    }}>
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        
        {/* Header navigation bar block */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "4rem",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "1.5rem"
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-4xl)",
              fontWeight: 700,
              margin: "0 0 0.5rem 0",
              letterSpacing: "var(--tracking-tight)"
            }}>
              Archive of Civilizations
            </h1>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              Searchable scientific register of simulation runs and adaptability records.
            </p>
          </div>
          <a href="/" style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)"
          }}>
            ← Return to Laboratory
          </a>
        </header>

        {error && (
          <div style={{
            padding: "1rem 1.5rem",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-danger)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-danger)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            marginBottom: "3rem"
          }}>
            Database query failed: {error.message}
          </div>
        )}

        {/* Empty State checks */}
        {cards.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "8rem 2rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)"
          }} className="glass">
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-2xl)",
              color: "var(--text-secondary)",
              margin: "0 0 1rem 0"
            }}>
              No Civilizations Archived Yet
            </h3>
            <p style={{
              color: "var(--text-tertiary)",
              maxWidth: "400px",
              margin: "0 auto 2rem auto",
              lineHeight: "var(--leading-relaxed)"
            }}>
              The simulator has not logged any completed runs to the public registry. Access the control panel to publish the first civilization.
            </p>
            <a href="/control" className="btn-cta" style={{ display: "inline-block" }}>
              Publish Civilization
            </a>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--grid-gap)",
            alignItems: "stretch"
          }}>
            {cards.map(card => (
              <CivilizationCard key={card.id} card={card} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
