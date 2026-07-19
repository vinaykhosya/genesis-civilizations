import React from "react";

export interface SnapshotProps {
  ticks: number;
  survivors: string;
  maxGeneration: number;
  healthScore: number;
  healthWarnings: string[];
}
export default function CivilizationSnapshot({ snapshot }: { snapshot: SnapshotProps }) {
  const isHealthy = snapshot.healthScore >= 90;

  return (
    <section style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1.5rem",
      marginBottom: "3rem"
    }}>
      {/* Status */}
      <div style={{
        padding: "1.5rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)"
      }} className="glass">
        <span style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
          Simulation Status
        </span>
        <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginTop: "0.5rem", color: "var(--text-danger)" }}>
          Extinct
        </div>
      </div>

      {/* Survivors */}
      <div style={{
        padding: "1.5rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)"
      }} className="glass">
        <span style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
          Final Survivors
        </span>
        <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginTop: "0.5rem", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
          {snapshot.survivors}
        </div>
      </div>

      {/* Max Generation */}
      <div style={{
        padding: "1.5rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)"
      }} className="glass">
        <span style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
          Max Generation
        </span>
        <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginTop: "0.5rem", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
          Gen {snapshot.maxGeneration}
        </div>
      </div>

      {/* Confidence report */}
      <div style={{
        padding: "1.5rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)"
      }} className="glass">
        <span style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
          Data Confidence
        </span>
        <div style={{
          fontSize: "var(--text-2xl)",
          fontWeight: 700,
          marginTop: "0.5rem",
          color: isHealthy ? "var(--text-success)" : "var(--text-warning)"
        }}>
          {snapshot.healthScore}% {isHealthy ? "Verified" : "Warning"}
        </div>
      </div>
    </section>
  );
}
