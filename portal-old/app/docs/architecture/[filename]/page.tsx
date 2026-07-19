import React from "react";
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";

export default async function DocumentReaderPage({
  params,
}: {
  params: { filename: string };
}) {
  const { filename } = params;

  // Safeguard against path traversal
  const cleanFilename = path.basename(filename);
  const docPath = path.join(process.cwd(), "..", "docs", "architecture", cleanFilename);

  let content = "";
  try {
    content = await fs.readFile(docPath, "utf-8");
  } catch {
    notFound();
  }

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-void)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      padding: "4rem 2rem"
    }}>
      <div style={{ maxWidth: "var(--content-width)", margin: "0 auto" }}>
        <header style={{ marginBottom: "2.5rem" }}>
          <a href="/" style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)"
          }}>
            ← Return to Laboratory
          </a>
        </header>

        <article style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "3rem",
          whiteSpace: "pre-wrap",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "var(--text-secondary)"
        }} className="glass">
          {content}
        </article>
      </div>
    </main>
  );
}
