import React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import fs from "fs/promises";
import path from "path";

// Server function to read markdown documentation files from root docs directory
const fetchDocumentationFile = createServerFn({ method: "GET" })
  .validator((filename: string) => filename)
  .handler(async ({ data: filename }) => {
    try {
      const cleanFilename = path.basename(filename);
      const docPath = path.join(process.cwd(), "..", "docs", "architecture", cleanFilename);
      return await fs.readFile(docPath, "utf-8");
    } catch {
      throw notFound();
    }
  });

export const Route = createFileRoute("/docs/architecture/$filename")({
  loader: async ({ params }) => {
    return await fetchDocumentationFile(params.filename);
  },
  component: DocumentReaderPage,
});

function DocumentReaderPage() {
  const content = Route.useLoaderData();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-void)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        padding: "4rem 2rem",
      }}
    >
      <div style={{ maxWidth: "var(--content-width)", margin: "0 auto" }}>
        <header style={{ marginBottom: "2.5rem" }}>
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            ← Return to Laboratory
          </Link>
        </header>

        <article
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "3rem",
            whiteSpace: "pre-wrap",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            lineHeight: "1.6",
            color: "var(--text-secondary)",
          }}
          className="glass"
        >
          {content}
        </article>
      </div>
    </main>
  );
}
