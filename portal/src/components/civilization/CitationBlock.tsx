import React, { useState } from "react";

interface CitationBlockProps {
  id: string;
  title: string;
  publishedAt?: string | null;
  engineVersion?: string | null;
  zenodoDoi?: string | null;       // Dataset DOI  e.g. "10.5281/zenodo.21735664"
  paperDoi?: string | null;        // Preprint DOI e.g. "10.5281/zenodo.21735672"
  arxivId?: string | null;         // arXiv ID e.g. "2608.XXXXX"
  githubUrl?: string;
}

/** Extract the numeric sequence from IDs like "gen-exp-0001" → "0001" */
function extractExpNumber(id: string): string {
  const match = id.match(/(\d+)$/);
  return match ? match[1] : id;
}

export function CitationBlock({
  id,
  title,
  publishedAt,
  engineVersion,
  zenodoDoi,
  paperDoi,
  arxivId,
  githubUrl = "https://github.com/vinaykhosya/genesis-civilizations",
}: CitationBlockProps) {
  const [copied, setCopied] = useState<"apa" | "bibtex" | null>(null);

  const expLabel = `GEN-EXP-${extractExpNumber(id)}`;
  const year = publishedAt ? new Date(publishedAt).getFullYear() : new Date().getFullYear();
  const version = engineVersion || "1.0.0";
  const url = `https://genesis.vinaykhosya.com/archive/civilizations/${id}`;

  const zenodoUrl  = zenodoDoi ? `https://doi.org/${zenodoDoi}` : null;
  const paperUrl   = arxivId
    ? `https://arxiv.org/abs/${arxivId}`
    : paperDoi
    ? `https://doi.org/${paperDoi}`
    : null;
  const paperLabel = arxivId ? "Preprint (arXiv)" : paperDoi ? "Preprint (Zenodo)" : "Preprint";

  const citationText = `Khosya, V. (${year}). ${title}. Project Genesis, Experiment ${expLabel}, Version ${version}. Genesis Research Platform. Retrieved from ${url}`;

  const bibtexDataset = zenodoDoi
    ? `  doi       = {${zenodoDoi}},\n  url       = {https://doi.org/${zenodoDoi}},`
    : `  url       = {${url}},`;

  const bibtex =
`@misc{genesis_${expLabel.toLowerCase().replace(/-/g, "_")},
  author    = {Khosya, Vinay},
  title     = {${title}},
  year      = {${year}},
  note      = {Genesis Research Platform, ${expLabel}},
  version   = {${version}},
${bibtexDataset}
}`;

  const handleCopy = (text: string, kind: "apa" | "bibtex") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // ── Shared link button style ─────────────────────────────────────────────
  const linkBtn: React.CSSProperties = {
    display:        "flex",
    alignItems:     "center",
    gap:            "0.5rem",
    padding:        "0.625rem 1rem",
    border:         "1px solid var(--border-default)",
    borderRadius:   "var(--radius-md)",
    background:     "rgba(255,255,255,0.03)",
    color:          "var(--text-secondary)",
    fontFamily:     "var(--font-mono)",
    fontSize:       "12px",
    fontWeight:     500,
    letterSpacing:  "0.05em",
    textDecoration: "none",
    cursor:         "pointer",
    transition:     "all 0.18s ease",
    whiteSpace:     "nowrap",
  };

  const hoverEnter = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    color: string
  ) => {
    (e.currentTarget as HTMLElement).style.borderColor = color;
    (e.currentTarget as HTMLElement).style.color       = color;
    (e.currentTarget as HTMLElement).style.background  = `${color}12`;
  };
  const hoverLeave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
    (e.currentTarget as HTMLElement).style.color       = "var(--text-secondary)";
    (e.currentTarget as HTMLElement).style.background  = "rgba(255,255,255,0.03)";
  };

  return (
    <section
      style={{
        background:   "var(--bg-secondary)",
        border:       "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        padding:      "2rem",
        marginTop:    "2rem",
      }}
      className="glass"
      id={`citation-${id}`}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            background:    "var(--accent-amber)",
            borderRadius:  "var(--radius-sm)",
            padding:       "0.25rem 0.75rem",
            fontFamily:    "var(--font-mono)",
            fontSize:      "11px",
            fontWeight:    600,
            letterSpacing: "0.08em",
            color:         "var(--bg-void)",
          }}
        >
          {expLabel}
        </div>
        <h3
          style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "var(--text-xs)",
            fontWeight:    500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color:         "var(--text-secondary)",
            margin:        0,
          }}
        >
          Research Artifacts &amp; Citation
        </h3>
      </div>

      {/* ── Research Links Row ─────────────────────────────────────────────── */}
      <div
        style={{
          display:       "flex",
          flexWrap:      "wrap",
          gap:           "0.625rem",
          marginBottom:  "1.5rem",
          paddingBottom: "1.5rem",
          borderBottom:  "1px solid var(--border-subtle)",
        }}
      >
        {/* Paper / Preprint */}
        {paperUrl && (
          <a
            href={paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            id={`paper-link-${id}`}
            style={linkBtn}
            onMouseEnter={(e) => hoverEnter(e, "#a78bfa")}
            onMouseLeave={hoverLeave}
          >
            <span>📄</span>
            <span>{paperLabel}</span>
            <span style={{ opacity: 0.5, fontSize: "10px" }}>↗</span>
          </a>
        )}

        {/* Dataset DOI */}
        {zenodoUrl && (
          <a
            href={zenodoUrl}
            target="_blank"
            rel="noopener noreferrer"
            id={`dataset-doi-${id}`}
            style={linkBtn}
            onMouseEnter={(e) => hoverEnter(e, "#34d399")}
            onMouseLeave={hoverLeave}
          >
            <span>🗄</span>
            <span>Dataset (Zenodo)</span>
            <span
              style={{
                fontFamily:    "var(--font-mono)",
                fontSize:      "10px",
                opacity:       0.6,
                borderLeft:    "1px solid var(--border-subtle)",
                paddingLeft:   "0.5rem",
                marginLeft:    "0.25rem",
              }}
            >
              {zenodoDoi}
            </span>
            <span style={{ opacity: 0.5, fontSize: "10px" }}>↗</span>
          </a>
        )}

        {/* GitHub */}
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          id={`github-link-${id}`}
          style={linkBtn}
          onMouseEnter={(e) => hoverEnter(e, "#f0f6fc")}
          onMouseLeave={hoverLeave}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.01-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Source Code</span>
          <span style={{ opacity: 0.5, fontSize: "10px" }}>↗</span>
        </a>

        {/* Permalink */}
        <a
          href={url}
          id={`permalink-${id}`}
          style={linkBtn}
          onMouseEnter={(e) => hoverEnter(e, "#60a5fa")}
          onMouseLeave={hoverLeave}
        >
          <span>🔗</span>
          <span>Permalink</span>
          <span style={{ opacity: 0.5, fontSize: "10px" }}>↗</span>
        </a>
      </div>

      {/* ── Citation Text ──────────────────────────────────────────────────── */}
      <div
        style={{
          background:   "var(--bg-void)",
          border:       "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding:      "1rem 1.25rem",
          fontFamily:   "var(--font-mono)",
          fontSize:     "12px",
          lineHeight:   "1.7",
          color:        "var(--text-primary)",
          userSelect:   "all",
          marginBottom: "0.75rem",
        }}
      >
        {citationText}
      </div>

      {/* ── Copy Actions ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
        <button
          id={`copy-citation-${id}`}
          onClick={() => handleCopy(citationText, "apa")}
          style={{
            ...linkBtn,
            background: copied === "apa" ? "var(--accent-green)" : "var(--bg-tertiary)",
            color:      copied === "apa" ? "var(--bg-void)"       : "var(--text-secondary)",
            border:     copied === "apa" ? "1px solid var(--accent-green)" : "1px solid var(--border-default)",
          }}
        >
          {copied === "apa" ? "✓ Copied" : "Copy APA"}
        </button>

        <button
          id={`copy-bibtex-${id}`}
          onClick={() => handleCopy(bibtex, "bibtex")}
          style={{
            ...linkBtn,
            background: copied === "bibtex" ? "var(--accent-amber)" : "var(--bg-tertiary)",
            color:      copied === "bibtex" ? "var(--bg-void)"       : "var(--text-secondary)",
            border:     copied === "bibtex" ? "1px solid var(--accent-amber)" : "1px solid var(--border-default)",
          }}
          onMouseEnter={(e) => { if (copied !== "bibtex") hoverEnter(e, "var(--accent-amber)"); }}
          onMouseLeave={(e) => { if (copied !== "bibtex") hoverLeave(e); }}
        >
          {copied === "bibtex" ? "✓ BibTeX Copied" : "Copy BibTeX"}
        </button>
      </div>
    </section>
  );
}
