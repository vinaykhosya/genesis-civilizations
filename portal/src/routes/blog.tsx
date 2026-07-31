import React from "react";
import { Outlet, createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-void)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Blog Nav */}
      <nav
        style={{
          borderBottom: "1px solid var(--border-default)",
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(var(--bg-void-raw, 3,3,6), 0.85)",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          ← Genesis
        </Link>
        <Link
          to="/blog/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          Research Blog
        </Link>
        <Link
          to="/archive/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          Archive
        </Link>
        <Link
          to="/about"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          About
        </Link>
      </nav>

      <Outlet />
    </div>
  );
}
