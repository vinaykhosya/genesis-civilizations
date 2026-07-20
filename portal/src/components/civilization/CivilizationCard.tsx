import React from "react";

export interface ExperimentCardProps {
  id: string;
  slug: string;
  title: string;
  worldPreset: string | null;
  scarcity: number;
  ticks: number;
  totalAgents: number;
  survivors: number;
  maxGeneration: number;
  publishedAt: string;
  thumbnailUrl: string | null;
  isFeatured: boolean;
  tags: string[];
  researchTheme?: string | null;
}

export default function CivilizationCard({ card }: { card: ExperimentCardProps }) {
  const formattedDate = new Date(card.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const yearCount = Math.floor(card.ticks / 360);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        position: "relative",
        transition: "all var(--duration-normal) var(--ease-out-quart)",
        cursor: "pointer",
        ...(card.isFeatured
          ? { borderTop: "2px solid var(--accent-400)", boxShadow: "var(--accent-glow-sm)" }
          : {}),
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.boxShadow = card.isFeatured
          ? "var(--accent-glow-sm)"
          : "var(--shadow-sm)";
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1/1",
          overflow: "hidden",
          position: "relative",
          background: "var(--bg-void)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {card.thumbnailUrl ? (
          <img
            src={card.thumbnailUrl}
            alt={card.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "radial-gradient(circle at center, #0d121f 0%, #060910 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              textAlign: "center",
              fontFamily: "var(--font-display)",
              fontSize: "11px",
              color: "var(--text-tertiary)",
              borderBottom: "1px solid rgba(255,255,255,0.02)",
            }}
          >
            <span style={{ fontSize: "14px", marginBottom: "0.25rem" }}>📡</span>
            <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
              World visualization unavailable
            </span>
            <span
              style={{
                fontSize: "9px",
                opacity: 0.6,
                fontFamily: "var(--font-mono)",
                marginTop: "2px",
              }}
            >
              (legacy experiment)
            </span>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40px",
            background: "linear-gradient(to bottom, transparent, var(--bg-secondary))",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-2xs)",
              color: "var(--text-tertiary)",
              letterSpacing: "var(--tracking-wide)",
            }}
          >
            {card.id}
          </span>
          {card.isFeatured && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "9px",
                padding: "0.15rem 0.4rem",
                borderRadius: "var(--radius-full)",
                background: "var(--accent-900)",
                color: "var(--accent-400)",
                textTransform: "uppercase",
                letterSpacing: "var(--tracking-wider)",
              }}
            >
              FEATURED
            </span>
          )}
        </div>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "var(--text-base)",
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: "var(--leading-snug)",
          }}
        >
          {card.title}
        </h3>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
          {card.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                padding: "0.15rem 0.45rem",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Stats Footer */}
        <div
          style={{
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-tertiary)",
          }}
        >
          <span>
            {card.totalAgents} agents · {card.ticks.toLocaleString()} ticks ({yearCount} yr)
          </span>
          <span style={{ fontSize: "10px" }}>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
