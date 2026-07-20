import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCivilizations } from "@/lib/server-fns";
import CivilizationCard, { ExperimentCardProps } from "@/components/civilization/CivilizationCard";

export const Route = createFileRoute("/archive/")({
  loader: async () => {
    return await fetchCivilizations();
  },
  component: ArchivePage,
});

function ArchivePage() {
  const civilizations = Route.useLoaderData();

  // Map database fields to components props
  const cards: ExperimentCardProps[] = civilizations.map((row: any) => ({
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
    tags: row.tags || [],
    researchTheme: row.summary_json?.research_theme || null,
  }));

  const biologicalCards = cards.filter(
    (c) =>
      c.researchTheme === "Biological Parameters" ||
      (c.tags && (c.tags.includes("biology") || c.tags.includes("biological")) && !c.tags.includes("validation")),
  );
  const environmentalCards = cards.filter(
    (c) =>
      c.researchTheme === "Environmental Constraints" ||
      (c.tags && (c.tags.includes("environment") || c.tags.includes("scarcity")) && !c.tags.includes("validation")),
  );
  const validationCards = cards.filter(
    (c) => c.tags && (c.tags.includes("validation") || c.researchTheme === "Engineering Validation"),
  );

  const uncategorizedCards = cards.filter(
    (c) =>
      !biologicalCards.some((b) => b.id === c.id) &&
      !environmentalCards.some((e) => e.id === c.id) &&
      !validationCards.some((v) => v.id === c.id),
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-void)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        padding: "4rem 2rem",
      }}
    >
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        {/* Header navigation bar block */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "4rem",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "1.5rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-4xl)",
                fontWeight: 700,
                margin: "0 0 0.5rem 0",
                letterSpacing: "var(--tracking-tight)",
              }}
            >
              Research Registry Archive
            </h1>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              Searchable scientific register of simulation runs, research studies, and engine
              validation records.
            </p>
          </div>
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            ← Return to Laboratory
          </Link>
        </header>

        {/* Empty State checks */}
        {cards.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "8rem 2rem",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xl)",
            }}
            className="glass"
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-2xl)",
                color: "var(--text-secondary)",
                margin: "0 0 1rem 0",
              }}
            >
              No Civilizations Archived Yet
            </h3>
            <p
              style={{
                color: "var(--text-tertiary)",
                maxWidth: "400px",
                margin: "0 auto 2rem auto",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              The simulator has not logged any completed runs to the public registry. Access the
              control panel to publish the first civilization.
            </p>
            <Link
              to="/control"
              className="btn-cta"
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              Publish Civilization
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
            {/* Theme 1: Biological Parameters */}
            {biologicalCards.length > 0 && (
              <section>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-md)",
                      fontWeight: 700,
                      color: "#00f2fe",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    Theme I: Biological Parameters
                  </h2>
                  <div
                    style={{
                      height: "1px",
                      background: "linear-gradient(to right, #00f2fe, rgba(255,255,255,0.05))",
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "var(--grid-gap)",
                  }}
                >
                  {biologicalCards.map((card) => (
                    <Link
                      key={card.id}
                      to={`/archive/civilizations/${card.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <CivilizationCard card={card} />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Theme 2: Environmental Constraints */}
            {environmentalCards.length > 0 && (
              <section>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-md)",
                      fontWeight: 700,
                      color: "var(--accent-purple)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    Theme II: Environmental Constraints
                  </h2>
                  <div
                    style={{
                      height: "1px",
                      background:
                        "linear-gradient(to right, var(--accent-purple), rgba(255,255,255,0.05))",
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "var(--grid-gap)",
                  }}
                >
                  {environmentalCards.map((card) => (
                    <Link
                      key={card.id}
                      to={`/archive/civilizations/${card.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <CivilizationCard card={card} />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Theme 3: Engineering Validation */}
            {validationCards.length > 0 && (
              <section>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-md)",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    Engineering Validation Suite
                  </h2>
                  <div
                    style={{
                      height: "1px",
                      background:
                        "linear-gradient(to right, var(--text-secondary), rgba(255,255,255,0.05))",
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "var(--grid-gap)",
                  }}
                >
                  {validationCards.map((card) => (
                    <Link
                      key={card.id}
                      to={`/archive/civilizations/${card.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <CivilizationCard card={card} />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Fallback Theme: General & Baseline Longitudinal Runs */}
            {(uncategorizedCards.length > 0 || (biologicalCards.length === 0 && environmentalCards.length === 0 && validationCards.length === 0)) && (
              <section>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-md)",
                      fontWeight: 700,
                      color: "#60a5fa",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    Primary Scientific Records & Baseline Runs
                  </h2>
                  <div
                    style={{
                      height: "1px",
                      background: "linear-gradient(to right, #60a5fa, rgba(255,255,255,0.05))",
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "var(--grid-gap)",
                  }}
                >
                  {(uncategorizedCards.length > 0 ? uncategorizedCards : cards).map((card) => (
                    <Link
                      key={card.id}
                      to={`/archive/civilizations/${card.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <CivilizationCard card={card} />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
