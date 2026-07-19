import React from "react";

export interface RecordHeroProps {
  id: string;
  title: string;
  worldPreset: string | null;
  scarcity: number;
  seed: number;
  ticks: number;
  thumbnailUrl: string | null;
}

export default function RecordHero({ hero }: { hero: RecordHeroProps }) {
  const bibtex = `@software{genesis_${hero.id.toLowerCase().replace(/-/g, "_")},
  author = {Khosya, Vinay},
  title = {Genesis Civilization Record ${hero.id}},
  year = {2026},
  url = {https://genesis.vinaykhosya.com/archive/civilizations/${hero.id}}
}`;

  const apa = `Khosya, V. (2026). Genesis Civilization Record ${hero.id} [Dataset]. https://genesis.vinaykhosya.com/archive/civilizations/${hero.id}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Citation copied to clipboard!");
  };

  const years = Math.floor(hero.ticks / 360);

  return (
    <section style={{
      display: "flex",
      flexDirection: "column",
      gap: "2rem",
      marginBottom: "3rem"
    }}>
      {/* Title block */}
      <div>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--text-tertiary)",
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase"
        }}>
          Civilization Record · {hero.id}
        </span>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-4xl)",
          fontWeight: 700,
          margin: "0.5rem 0",
          color: "var(--text-primary)"
        }}>
          {hero.title}
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-lg)",
          color: "var(--text-secondary)",
          margin: 0,
          fontStyle: "italic"
        }}>
          &quot;We expected conflict. Instead we observed cooperation.&quot;
        </p>
      </div>

      {/* Specimen side-by-side block */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "2rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden"
      }} className="glass">
        {/* Left: Specimen image */}
        <div style={{
          position: "relative",
          height: "260px",
          background: "var(--bg-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {hero.thumbnailUrl ? (
            <img
              src={hero.thumbnailUrl}
              alt="World Specimen Map"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
              No Specimen Map Available
            </span>
          )}
          <div style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            background: "rgba(7, 10, 16, 0.75)",
            padding: "0.25rem 0.5rem",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--teal)",
            border: "1px solid oklch(0.78 0.11 195 / 30%)"
          }}>
            SPECIMEN VIEW
          </div>
        </div>

        {/* Right: Specimen details & citations */}
        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)"
          }}>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>PRESET</div>
              <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{hero.worldPreset || "Custom"}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>SCARCITY</div>
              <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{hero.scarcity}x</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>DURATION</div>
              <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{hero.ticks.toLocaleString()} ticks ({years} yr)</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>SEED</div>
              <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{hero.seed}</div>
            </div>
          </div>

          <button
            disabled
            style={{
              padding: "0.75rem",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: "var(--text-tertiary)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              cursor: "not-allowed",
              textAlign: "center"
            }}
          >
            Watch Civilization (Coming in Phase 4)
          </button>

          {/* Citation card block */}
          <div style={{
            padding: "1rem",
            background: "var(--bg-void)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}>
            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: 600 }}>
              Cite this Record
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => copyToClipboard(bibtex)}
                style={{
                  flex: 1,
                  padding: "0.35rem",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                Copy BibTeX
              </button>
              <button
                onClick={() => copyToClipboard(apa)}
                style={{
                  flex: 1,
                  padding: "0.35rem",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                Copy APA
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
