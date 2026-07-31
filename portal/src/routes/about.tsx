import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

const SITE_URL = "https://genesis.vinaykhosya.com";

export const Route = createFileRoute("/about")({
  component: AboutResearcherPage,
  head: () => {
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Vinay Khosya",
      jobTitle: "Artificial Life & Simulation Researcher",
      worksFor: {
        "@type": "ResearchProject",
        name: "Project Genesis",
        url: SITE_URL,
      },
      url: `${SITE_URL}/about`,
      sameAs: [
        "https://github.com/vinaykhosya",
        "https://linkedin.com/in/vinaykhosya",
      ],
      knowsAbout: [
        "Artificial Life",
        "Agent-Based Modeling",
        "Evolutionary Computation",
        "Digital Evolution",
        "Emergent Intelligence",
        "Multi-Agent Systems",
      ],
    });

    return {
      meta: [
        { title: "About Vinay Khosya & Project Genesis — Artificial Life Research" },
        {
          name: "description",
          content:
            "Learn about Vinay Khosya and the scientific methodology behind Project Genesis — an open artificial life research platform studying digital evolution and emergent behavior.",
        },
        {
          name: "keywords",
          content:
            "Vinay Khosya, Project Genesis founder, artificial life researcher, agent-based modeling, evolutionary computation, emergent behavior research",
        },
        { property: "og:title", content: "About Vinay Khosya — Project Genesis" },
        {
          property: "og:description",
          content:
            "Background, research methodology, and vision behind Project Genesis, an open artificial life simulation platform.",
        },
        { property: "og:type", content: "profile" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
      scripts: [{ type: "application/ld+json", children: jsonLd }],
    };
  },
});

function AboutResearcherPage() {
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
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Nav Link */}
        <header style={{ marginBottom: "3rem" }}>
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            ← Return to Genesis
          </Link>
        </header>

        {/* Hero Section */}
        <section style={{ marginBottom: "4rem" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent-amber, #f59e0b)",
              marginBottom: "0.75rem",
            }}
          >
            Researcher & Platform Director
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 300,
              color: "var(--text-primary)",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            Vinay Khosya
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-lg, 1.125rem)",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            Pioneering open computational environments for studying emergent artificial life, digital evolution, and multi-agent civilizational dynamics.
          </p>
        </section>

        {/* Content Blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {/* Mission */}
          <article
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xl)",
              padding: "2.5rem",
            }}
            className="glass"
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: 400,
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Why Project Genesis Exists
            </h2>
            <p
              style={{
                fontSize: "var(--text-base)",
                lineHeight: 1.8,
                color: "var(--text-secondary)",
                marginBottom: "1rem",
              }}
            >
              Traditional artificial intelligence research often focuses on task-specific learning or static benchmarks. Project Genesis was created as a digital laboratory to investigate what happens when autonomous agents evolve continuously in complex, resource-constrained physical environments across hundreds of generations.
            </p>
            <p
              style={{
                fontSize: "var(--text-base)",
                lineHeight: 1.8,
                color: "var(--text-secondary)",
              }}
            >
              By combining hydrological terrain modeling, altitude-based thermodynamics, genetic transmission, and priority-driven cognitive architecture, Genesis allows us to observe macro-level civilizational phenomena—such as altruism reversals, territorial drift, and unexpected demographic extinctions—emerging from fundamental physical constraints.
            </p>
          </article>

          {/* Research Focus */}
          <article
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xl)",
              padding: "2.5rem",
            }}
            className="glass"
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: 400,
                color: "var(--text-primary)",
                marginBottom: "1.25rem",
              }}
            >
              Core Research Focus Areas
            </h2>
            <ul
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {[
                {
                  title: "Emergent Social Behavior",
                  desc: "Studying how cooperative strategies, trade networks, and conflict patterns arise spontaneously under resource scarcity.",
                },
                {
                  title: "Long-Term Genetic Dynamics",
                  desc: "Tracking gene-frequency drift, physiological mutation bottlenecks, and lineage monopolies over multi-century runs.",
                },
                {
                  title: "Environmental Selection Pressures",
                  desc: "Analyzing how climate shifts, rain shadow phenomena, and geographical barriers shape cognitive evolutionary trajectories.",
                },
                {
                  title: "Reproducible Simulation Infrastructure",
                  desc: "Building size-invariant, fully deterministic multi-agent simulation engines with complete census telemetry.",
                },
              ].map((area) => (
                <li
                  key={area.title}
                  style={{
                    background: "var(--bg-void)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.25rem",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {area.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {area.desc}
                  </p>
                </li>
              ))}
            </ul>
          </article>

          {/* Reproducibility & Open Science */}
          <article
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xl)",
              padding: "2.5rem",
            }}
            className="glass"
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: 400,
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Open Science Commitment
            </h2>
            <p
              style={{
                fontSize: "var(--text-base)",
                lineHeight: 1.8,
                color: "var(--text-secondary)",
                marginBottom: "1.5rem",
              }}
            >
              Every experiment published on Genesis is open for verification. We provide complete simulation telemetry, pre-computed replay archives, exact seed parameters, and downloadable dataset records for every published computational civilization.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                to="/archive/"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "0.625rem 1.25rem",
                  background: "var(--accent-amber, #f59e0b)",
                  color: "var(--bg-void)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                }}
              >
                Explore Experiment Archive →
              </Link>
              <Link
                to="/blog/"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 500,
                  padding: "0.625rem 1.25rem",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                }}
              >
                Read Research Blog
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
