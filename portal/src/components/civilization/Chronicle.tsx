import React from "react";
import { formatChronicle } from "../../lib/chronicle/formatter";

export interface ChronicleProps {
  events: any[];
  ticks: number;
}

export default function Chronicle({ chronicle }: { chronicle: ChronicleProps }) {
  const chapters = formatChronicle(chronicle.events, chronicle.ticks);

  return (
    <section
      style={{
        marginBottom: "4rem",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "2rem",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "0.5rem",
        }}
      >
        The Chronicle
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
        {chapters.map((ch, idx) => {
          if (ch.prose.length === 0) return null;

          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Chapter Header */}
              <div
                style={{
                  borderLeft: "2px solid var(--accent-700)",
                  paddingLeft: "1rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-lg)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "0 0 0.25rem 0",
                  }}
                >
                  {ch.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: "var(--leading-relaxed)",
                  }}
                >
                  {ch.description}
                </p>
              </div>

              {/* Prose timeline list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  paddingLeft: "1.5rem",
                  position: "relative",
                }}
              >
                {/* Timeline connector line */}
                <div
                  style={{
                    position: "absolute",
                    left: "6px",
                    top: "10px",
                    bottom: "10px",
                    width: "1px",
                    background: "var(--border-default)",
                  }}
                />

                {ch.prose.map((p, idy) => (
                  <div
                    key={idy}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      position: "relative",
                    }}
                  >
                    {/* Circle Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-21px",
                        top: "6px",
                        width: "7px",
                        height: "7px",
                        borderRadius: "var(--radius-full)",
                        background:
                          p.eventType === "Birth"
                            ? "var(--event-birth)"
                            : p.eventType === "Death"
                              ? "var(--event-death)"
                              : "var(--accent-400)",
                        boxShadow:
                          p.eventType === "Birth"
                            ? "var(--event-birth-shadow)"
                            : p.eventType === "Death"
                              ? "var(--event-death-shadow)"
                              : "none",
                      }}
                    />

                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "var(--text-sm)",
                          color: "var(--text-secondary)",
                          lineHeight: "var(--leading-relaxed)",
                          margin: 0,
                        }}
                      >
                        {p.text}
                      </p>

                      {/* Academic Evidence Sub-Row */}
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "var(--text-tertiary)",
                          marginTop: "0.25rem",
                        }}
                      >
                        <span>Tick {p.tick}</span>
                        {p.affectedAgents.length > 0 && (
                          <span>Agents: {p.affectedAgents.join(", ")}</span>
                        )}
                        <span>Event: {p.eventType}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
