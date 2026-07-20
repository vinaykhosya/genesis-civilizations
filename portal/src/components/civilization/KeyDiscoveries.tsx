import React from "react";

export interface DiscoveriesProps {
  scarcity: number;
  worldPreset: string | null;
  avgGeneticDiversity: number;
  maxGeneration: number;
}

export default function KeyDiscoveries({ discoveries }: { discoveries: DiscoveriesProps }) {
  const points = [
    `Adaptive colony clustering: Groups nested resources near valleys on the '${discoveries.worldPreset || "custom"}' layout.`,
    `Genetic Bottleneck observed: Genetic diversity settled at ${(discoveries.avgGeneticDiversity || 0).toFixed(2)} Shannon entropy.`,
    `Generational adaptation: Adaptation traces mapped through a generational depth of ${discoveries.maxGeneration} generations.`,
    `Water scarcity selection: Survival constraints bounded strictly by freshwater advection.`,
  ];

  return (
    <section
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        padding: "2rem",
        marginBottom: "4rem",
      }}
      className="glass"
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: "0 0 1.25rem 0",
          letterSpacing: "var(--tracking-wide)",
        }}
      >
        Key Discoveries
      </h2>
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          margin: 0,
          paddingLeft: "1.25rem",
          color: "var(--text-secondary)",
          lineHeight: "var(--leading-relaxed)",
        }}
      >
        {points.map((pt, idx) => (
          <li key={idx}>
            <strong style={{ color: "var(--text-accent)" }}>✓</strong> {pt}
          </li>
        ))}
      </ul>
    </section>
  );
}
