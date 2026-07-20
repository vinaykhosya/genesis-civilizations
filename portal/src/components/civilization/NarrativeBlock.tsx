import React from "react";
import { ExperimentConfig } from "../../../shared/types";

export interface NarrativeProps {
  abstract: string | null;
  config: ExperimentConfig;
  totalAgents: number;
  survivors: string;
  ticks: number;
}

export default function NarrativeBlock({ narrative }: { narrative: NarrativeProps }) {
  const { config, abstract, totalAgents, survivors, ticks } = narrative;

  // Generate automated abstract draft if abstract is empty or null
  const autoOutcome = `This civilization persisted for ${ticks.toLocaleString()} ticks before ending. A total of ${totalAgents} agents lived across the ecosystem, leaving ${survivors} alive at completion. The preset environment was configured on '${config.world_preset || "custom"}' preset under ${config.scarcity}x scarcity rules, which created high pressure. Genetic mutation thresholds were maintained at ${config.mutation_rate || 0.05} standard deviation. The population dynamics ended in total extinction, consistent with resource caps.`;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem",
        marginBottom: "4rem",
      }}
    >
      {/* Question */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            color: "var(--text-accent)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-wider)",
            margin: "0 0 0.75rem 0",
          }}
        >
          The Research Question
        </h2>
        <p
          style={{
            fontSize: "var(--text-lg)",
            color: "var(--text-primary)",
            lineHeight: "var(--leading-relaxed)",
            margin: 0,
          }}
        >
          Can stable behavioral adaptations and resource sharing mechanisms emerge in environments
          constrained by high selection pressure?
        </p>
      </div>

      {/* Hypothesis */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            color: "var(--text-accent)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-wider)",
            margin: "0 0 0.75rem 0",
          }}
        >
          The Hypothesis
        </h2>
        <p
          style={{
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
            lineHeight: "var(--leading-relaxed)",
            margin: 0,
          }}
        >
          If resource scarcity exceeds critical thresholds (scarcity &gt; 4x), territorial disputes
          will rise, suppressing mutual attachment and reproduction rates, leading to early lineage
          extinction cascades.
        </p>
      </div>

      {/* Experimental Conditions */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            color: "var(--text-accent)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-wider)",
            margin: "0 0 1rem 0",
          }}
        >
          Experimental Conditions
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-primary)",
            }}
          >
            Scarcity: {config.scarcity}x
          </span>
          <span
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-primary)",
            }}
          >
            Disputes: {config.disputes_enabled ? "Enabled" : "Disabled"}
          </span>
          <span
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-primary)",
            }}
          >
            Disasters: {config.disasters_enabled ? "Enabled" : "Disabled"}
          </span>
          <span
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-primary)",
            }}
          >
            Planner: {config.planner_enabled ? "Active" : "Ablated"}
          </span>
          <span
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-primary)",
            }}
          >
            Mutation: {config.mutation_rate} std
          </span>
        </div>
      </div>

      {/* Outcome */}
      <div
        style={{
          padding: "1.5rem",
          background: "var(--bg-secondary)",
          borderLeft: "4px solid var(--accent-400)",
          borderRadius: "0 var(--radius-md) var(--radius-md) 0",
        }}
        className="glass"
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: "0 0 0.75rem 0",
          }}
        >
          Primary Observation & Outcome
        </h2>
        <p
          style={{
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
            lineHeight: "var(--leading-relaxed)",
            margin: 0,
          }}
        >
          {abstract || autoOutcome}
        </p>
      </div>
    </section>
  );
}
