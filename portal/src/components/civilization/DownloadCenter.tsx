import React from "react";

export interface DownloadCenterProps {
  id: string;
}

export default function DownloadCenter({ files }: { files: DownloadCenterProps }) {
  const getStorageUrl = (bucket: string, path: string) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  };

  const zipUrl = getStorageUrl("experiment-zips", `${files.id}/export.zip`);
  const replayUrl = getStorageUrl("replays", `${files.id}/replay.json`);

  const groups = [
    {
      title: "Read",
      items: [
        { name: "Simulation Configuration (config.json)", url: zipUrl, note: "Full runtime config settings." },
        { name: "Derived Summary (summary.json)", url: zipUrl, note: "Experiment aggregates and metrics." }
      ]
    },
    {
      title: "Explore",
      items: [
        { name: "Playback Data (replay.json)", url: replayUrl, note: "Temporal tick replay files (Optional)." },
        { name: "Population Curves (population.csv)", url: zipUrl, note: "Tick population metrics." }
      ]
    },
    {
      title: "Analyze",
      items: [
        { name: "Agent Census (agent_census.csv)", url: zipUrl, note: "Roster details of all simulated agents." },
        { name: "Events Log (events.json)", url: zipUrl, note: "Chronological event registry." }
      ]
    },
    {
      title: "Archive",
      items: [
        { name: "Complete ZIP Package (export.zip)", url: zipUrl, note: "Complete files bundle for local loading." }
      ]
    }
  ];

  return (
    <section style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-xl)",
      padding: "2rem",
      marginBottom: "4rem"
    }} className="glass">
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-xl)",
        fontWeight: 600,
        color: "var(--text-primary)",
        margin: "0 0 1.5rem 0",
        letterSpacing: "var(--tracking-wide)"
      }}>
        Download Center
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "2rem"
      }}>
        {groups.map((grp, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--text-accent)",
              letterSpacing: "var(--tracking-wider)",
              margin: 0
            }}>
              {grp.title}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {grp.items.map((item, idy) => (
                <a
                  key={idy}
                  href={item.url}
                  download
                  style={{
                    display: "block",
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    transition: "color var(--duration-fast)"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                  onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                >
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>{item.note}</div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
