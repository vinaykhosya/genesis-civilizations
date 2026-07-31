import React, { useState } from "react";

interface CitationBlockProps {
  id: string;
  title: string;
  publishedAt?: string | null;
  engineVersion?: string | null;
}

/** Extract the numeric sequence from IDs like "gen-exp-0001" → "0001" */
function extractExpNumber(id: string): string {
  const match = id.match(/(\d+)$/);
  return match ? match[1] : id;
}

export function CitationBlock({ id, title, publishedAt, engineVersion }: CitationBlockProps) {
  const [copied, setCopied] = useState(false);

  const expLabel = `GEN-EXP-${extractExpNumber(id)}`;
  const year = publishedAt ? new Date(publishedAt).getFullYear() : new Date().getFullYear();
  const version = engineVersion || "1.0.0";
  const url = `https://genesis.vinaykhosya.com/archive/civilizations/${id}`;

  const citationText = `Khosya, V. (${year}). ${title}. Project Genesis, Experiment ${expLabel}, Version ${version}. Genesis Research Platform. Retrieved from ${url}`;

  const bibtex = `@misc{genesis_${expLabel.toLowerCase().replace(/-/g, "_")},\n  author    = {Khosya, Vinay},\n  title     = {${title}},\n  year      = {${year}},\n  note      = {Genesis Research Platform, ${expLabel}},\n  version   = {${version}},\n  url       = {${url}}\n}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        padding: "2rem",
        marginTop: "2rem",
      }}
      className="glass"
      id={`citation-${id}`}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div
          style={{
            background: "var(--accent-amber)",
            borderRadius: "var(--radius-sm)",
            padding: "0.25rem 0.75rem",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "var(--bg-void)",
          }}
        >
          {expLabel}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          Cite This Experiment
        </h3>
      </div>

      {/* APA Citation */}
      <div
        style={{
          background: "var(--bg-void)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          lineHeight: "1.7",
          color: "var(--text-primary)",
          userSelect: "all",
          marginBottom: "0.75rem",
        }}
      >
        {citationText}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
        <button
          id={`copy-citation-${id}`}
          onClick={() => handleCopy(citationText)}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.06em",
            padding: "0.375rem 0.875rem",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            background: copied ? "var(--accent-green)" : "var(--bg-tertiary)",
            color: copied ? "var(--bg-void)" : "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {copied ? "✓ Copied" : "Copy APA"}
        </button>
        <button
          id={`copy-bibtex-${id}`}
          onClick={() => handleCopy(bibtex)}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.06em",
            padding: "0.375rem 0.875rem",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-amber)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-amber)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
          }}
        >
          Copy BibTeX
        </button>
        <a
          href={url}
          id={`permalink-${id}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.06em",
            padding: "0.375rem 0.875rem",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
            textDecoration: "none",
            transition: "all 0.2s ease",
            display: "inline-block",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-emphasis)";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-default)";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
          }}
        >
          Permalink ↗
        </a>
      </div>
    </section>
  );
}
