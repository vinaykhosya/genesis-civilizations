import React from "react";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import RecordHero, { RecordHeroProps } from "@/components/civilization/RecordHero";
import CivilizationSnapshot, { SnapshotProps } from "@/components/civilization/CivilizationSnapshot";
import NarrativeBlock, { NarrativeProps } from "@/components/civilization/NarrativeBlock";
import KeyDiscoveries, { DiscoveriesProps } from "@/components/civilization/KeyDiscoveries";
import Chronicle, { ChronicleProps } from "@/components/civilization/Chronicle";
import DownloadCenter, { DownloadCenterProps } from "@/components/civilization/DownloadCenter";
import CivilizationCard, { ExperimentCardProps } from "@/components/civilization/CivilizationCard";

export const revalidate = 300;

export default async function CivilizationRecordPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // 1. Fetch current experiment
  const { data: record, error } = await supabaseServer
    .from("experiments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !record) {
    notFound();
  }

  // 2. Fetch related civilizations
  const { data: relatedData } = await supabaseServer
    .from("experiments")
    .select("id, slug, title, world_preset, scarcity, ticks, total_agents, survivors_count, max_generation, published_at, thumbnail_url, is_featured, tags")
    .eq("is_published", true)
    .neq("id", id)
    .limit(3);

  const relatedCards: ExperimentCardProps[] = (relatedData || []).map(row => ({
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

  // Structure sub-component parameters
  const heroProps: RecordHeroProps = {
    id: record.id,
    title: record.title,
    worldPreset: record.world_preset,
    scarcity: record.scarcity,
    seed: record.seed,
    ticks: record.ticks,
    thumbnailUrl: record.thumbnail_url
  };

  const snapshotProps: SnapshotProps = {
    ticks: record.ticks,
    survivors: `${record.survivors_count}/${record.total_agents}`,
    maxGeneration: record.max_generation,
    healthScore: record.health_score || 100,
    healthWarnings: record.health_warnings || []
  };

  const narrativeProps: NarrativeProps = {
    abstract: record.abstract,
    config: record.config_json,
    totalAgents: record.total_agents || 0,
    survivors: `${record.survivors_count}/${record.total_agents}`,
    ticks: record.ticks
  };

  const discoveriesProps: DiscoveriesProps = {
    scarcity: record.scarcity,
    worldPreset: record.world_preset,
    avgGeneticDiversity: record.avg_genetic_diversity || 0,
    maxGeneration: record.max_generation
  };

  const chronicleProps: ChronicleProps = {
    events: record.summary_json.events || [], // maps from json blob directly
    ticks: record.ticks
  };

  const downloadProps: DownloadCenterProps = {
    id: record.id
  };

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-void)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      padding: "4rem 2rem"
    }}>
      <div style={{ maxWidth: "var(--content-width)", margin: "0 auto" }}>
        
        {/* Navigation header */}
        <header style={{ marginBottom: "2.5rem" }}>
          <a href="/archive" style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)"
          }}>
            ← Return to Archive
          </a>
        </header>

        {/* 1. Specimen Hero */}
        <RecordHero hero={heroProps} />

        {/* 2. Record Snapshot */}
        <CivilizationSnapshot snapshot={snapshotProps} />

        {/* 3. Research Narrative */}
        <NarrativeBlock narrative={narrativeProps} />

        {/* 4. Discoveries Bridge */}
        <KeyDiscoveries discoveries={discoveriesProps} />

        {/* 5. Chronicle timeline */}
        <Chronicle chronicle={chronicleProps} />

        {/* 6. Download Center */}
        <DownloadCenter files={downloadProps} />

        {/* 7. Provenance footer */}
        <footer style={{
          marginTop: "4rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--border-subtle)",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-tertiary)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.5rem",
          marginBottom: "4rem"
        }}>
          <div>ENGINE: Genesis {record.engine_version}</div>
          <div>SCHEMA: Contract {record.schema_version}</div>
          <div>STAGED: {new Date(record.published_at).toLocaleDateString()}</div>
          <div>PROVENANCE: Vinay Khosya</div>
        </footer>

        {/* 8. Related civilizations list */}
        {relatedCards.length > 0 && (
          <section style={{
            marginTop: "6rem",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "3rem"
          }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "2rem"
            }}>
              Similar Civilizations
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "var(--grid-gap)"
            }}>
              {relatedCards.map(card => (
                <CivilizationCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
