import React from "react";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      backgroundColor: "var(--bg-void)",
      fontFamily: "var(--font-display)",
      color: "var(--text-primary)"
    }}>
      <div style={{
        maxWidth: "600px",
        textAlign: "center",
        padding: "3rem",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-default)",
        background: "var(--bg-secondary)",
        boxShadow: "var(--shadow-md)"
      }} className="glass">
        <h1 style={{
          fontSize: "var(--text-4xl)",
          fontWeight: 700,
          margin: "0 0 1rem 0",
          letterSpacing: "var(--tracking-tight)",
          background: "linear-gradient(135deg, var(--accent-300), var(--accent-500))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Project Genesis
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-lg)",
          color: "var(--text-secondary)",
          lineHeight: "var(--leading-relaxed)",
          margin: "0 0 2rem 0"
        }}>
          A scientific instrument for studying how life shapes itself under pressure.
        </p>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "stretch"
        }}>
          <a
            href="/docs/architecture/GPS.md"
            className="btn-docs"
          >
            Laboratory Specifications (GPS)
          </a>
          <a
            href="/archive"
            className="btn-cta"
          >
            Archive of Civilizations
          </a>
        </div>
      </div>
      <footer style={{
        marginTop: "3rem",
        fontSize: "var(--text-xs)",
        color: "var(--text-tertiary)",
        fontFamily: "var(--font-mono)"
      }}>
        GENESIS PORTAL · PHASE 9A · VINAY KHOSYA
      </footer>
    </main>
  );
}
