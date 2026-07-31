import React, { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { verifyAdminAuth } from "@/lib/server-fns";
import JSZip from "jszip";

export const Route = createFileRoute("/control/")({
  beforeLoad: async () => {
    await verifyAdminAuth();
  },
  component: ControlPage,
});

function ControlPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stagingId, setStagingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [health, setHealth] = useState<any | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Metadata form
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStagingId(null);
    setPreview(null);
    setHealth(null);
    setDuplicateWarning(null);

    try {
      let fileToUpload = file;

      // Automatic client-side zip optimization:
      // If ZIP is larger than 30MB, strip intermediate raw debug checkpoints (checkpoint_*.json)
      // which account for 90%+ of the archive size and are not used by the web portal parser.
      if (file.name.endsWith(".zip") && file.size > 30 * 1024 * 1024) {
        try {
          const zip = new JSZip();
          const contents = await zip.loadAsync(file);
          const filenames = Object.keys(contents.files);
          const hasCheckpoints = filenames.some((f) => {
            const name = f.split(/[/\\]/).pop() || "";
            return name.startsWith("checkpoint_") && name.endsWith(".json");
          });

          if (hasCheckpoints) {
            console.log("Optimizing package size: stripping intermediate debug checkpoints...");
            const cleanZip = new JSZip();
            for (const [relativePath, entry] of Object.entries(contents.files)) {
              const name = relativePath.split(/[/\\]/).pop() || "";
              if (!entry.dir && !(name.startsWith("checkpoint_") && name.endsWith(".json"))) {
                const buf = await entry.async("uint8array");
                cleanZip.file(relativePath, buf);
              }
            }
            const cleanBlob = await cleanZip.generateAsync({
              type: "blob",
              compression: "DEFLATE",
            });
            fileToUpload = new File([cleanBlob], file.name, { type: "application/zip" });
            console.log(
              `Package size optimized from ${(file.size / (1024 * 1024)).toFixed(1)} MB to ${(fileToUpload.size / (1024 * 1024)).toFixed(1)} MB`,
            );
          }
        } catch (optErr) {
          console.warn("Client ZIP optimization note:", optErr);
        }
      }

      // 1. Get a signed upload URL to bypass Vercel's 4.5MB request payload limit
      const getUrlRes = await fetch(
        `/api/v1/admin/experiments/upload?filename=${encodeURIComponent(fileToUpload.name)}`,
      );
      if (!getUrlRes.ok) {
        const getUrlError = await getUrlRes.json();
        throw new Error(getUrlError.error || "Failed to generate signed upload URL");
      }
      const { signedUrl, filePath } = await getUrlRes.json();

      // 2. Upload file directly to Supabase storage
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: fileToUpload,
        headers: {
          "Content-Type": fileToUpload.type || "application/zip",
        },
      });

      if (!uploadRes.ok) {
        let errorDetails = "";
        try {
          const errJson = await uploadRes.json();
          errorDetails = errJson.message || errJson.error || JSON.stringify(errJson);
        } catch {
          errorDetails = await uploadRes.text().catch(() => "");
        }
        if (
          uploadRes.status === 400 &&
          errorDetails.includes("exceeded the maximum allowed size")
        ) {
          throw new Error(
            `Storage limit exceeded (400): ${errorDetails}\n\n` +
              `To allow raw uncompressed ZIPs over 50MB in Supabase:\n` +
              `Supabase Dashboard -> Project Settings -> Storage -> Global Upload Limit -> Increase to 500MB`,
          );
        }
        throw new Error(
          `Failed to upload ZIP package directly to storage (${uploadRes.status}): ${errorDetails || uploadRes.statusText || "Storage bucket capacity or file size limit exceeded."}`,
        );
      }

      // 3. Trigger validation & ingestion on Vercel with the uploaded filePath
      const res = await fetch("/api/v1/admin/experiments/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors && data.errors.length > 0) {
          const detailedMsg = data.errors.map((e: any) => `• [${e.file}] ${e.message}`).join("\n");
          throw new Error(`Validation failed:\n${detailedMsg}`);
        }
        throw new Error(data.error || "Ingestion processing failed");
      }

      setStagingId(data.stagingId);
      setPreview(data.preview);
      setHealth(data.health);
      if (data.isDuplicate) {
        setDuplicateWarning(
          `Warning: An experiment with seed ${data.preview.seed} and ${data.preview.ticks} ticks has already been published.`,
        );
      }

      // Prepopulate metadata editor
      setTitle(data.preview.autoTitle || "");
      setTags((data.preview.suggestedTags || []).join(", "));
    } catch (err: any) {
      alert(`Error during ingestion: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!stagingId) return;

    setPublishing(true);
    try {
      const res = await fetch(`/api/v1/admin/experiments/${stagingId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          abstract,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          isFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publishing failed");

      setSuccess(true);
    } catch (err: any) {
      alert(`Error during publish commit: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  if (success) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "var(--bg-void)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-display)",
          padding: "2rem",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-default)",
            background: "var(--bg-secondary)",
            maxWidth: "500px",
          }}
          className="glass"
        >
          <h2 style={{ color: "var(--text-success)", marginBottom: "1rem" }}>
            ✓ Civilization Published
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Experiment package has been validated, staging directories compiled, and registry
            initialized.
          </p>
          <Link to="/archive" className="btn-cta" style={{ textDecoration: "none" }}>
            View in Archive
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-void)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        padding: "3rem 2rem",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <header style={{ marginBottom: "3rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-4xl)",
              fontWeight: 700,
              background: "linear-gradient(135deg, var(--teal), var(--teal-soft))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 0 0.5rem 0",
            }}
          >
            Control Center
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Upload experiment packages to stage and validate before publishing.
          </p>
        </header>

        {/* Staging & Upload Zone */}
        {!stagingId ? (
          <section
            style={{
              background: "var(--bg-secondary)",
              border: "1px dashed var(--border-default)",
              borderRadius: "var(--radius-xl)",
              padding: "4rem 2rem",
              textAlign: "center",
            }}
            className="glass"
          >
            <form onSubmit={handleUpload}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                Select a completed experiment ZIP file exported from the simulation engine.
              </p>
              <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  fontWeight: 600,
                  marginBottom: "1.5rem",
                  transition: "all var(--duration-fast)",
                }}
              >
                {file ? file.name : "Choose File"}
              </label>

              {file && (
                <div>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-cta"
                    style={{ border: "none", cursor: "pointer", margin: "0 auto" }}
                  >
                    {uploading ? "Ingesting & Validating..." : "Stage & Validate"}
                  </button>
                </div>
              )}
            </form>
          </section>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Health & Preview Report */}
            <section
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "2rem",
              }}
              className="glass"
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-2xl)",
                  marginBottom: "1.5rem",
                }}
              >
                Experiment Health & Preview
              </h2>

              <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
                <div
                  style={{
                    padding: "1.5rem",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--bg-surface)",
                    borderLeft:
                      "4px solid " +
                      (health.score >= 80 ? "var(--text-success)" : "var(--text-warning)"),
                  }}
                >
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                    }}
                  >
                    Health Score
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-4xl)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {health.score}%
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong>Extracted Metrics:</strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--text-secondary)" }}>
                    <li>Preset: {preview.worldPreset || "Custom"}</li>
                    <li>Scarcity: {preview.scarcity}x</li>
                    <li>Ticks: {preview.ticks}</li>
                    <li>Seed: {preview.seed}</li>
                  </ul>
                </div>
              </div>

              {duplicateWarning && (
                <div
                  style={{
                    padding: "1rem",
                    background: "var(--accent-900)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-warning)",
                    marginBottom: "1.5rem",
                  }}
                >
                  {duplicateWarning}
                </div>
              )}

              {health.warnings.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--text-warning)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Warnings
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--text-secondary)" }}>
                    {health.warnings.map((w: any, idx: number) => (
                      <li key={idx}>{w.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Metadata Editor */}
            <section
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "2rem",
              }}
              className="glass"
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-2xl)",
                  marginBottom: "1.5rem",
                }}
              >
                Metadata & Publication
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <label
                    style={{ display: "block", fontSize: "var(--text-sm)", marginBottom: "0.5rem" }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{ display: "block", fontSize: "var(--text-sm)", marginBottom: "0.5rem" }}
                  >
                    Abstract
                  </label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    rows={4}
                    placeholder="Write abstract findings here..."
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{ display: "block", fontSize: "var(--text-sm)", marginBottom: "0.5rem" }}
                  >
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    id="is-featured"
                  />
                  <label htmlFor="is-featured">Mark as Featured Experiment</label>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="btn-cta"
                    style={{ border: "none", cursor: "pointer", flex: 1 }}
                  >
                    {publishing ? "Publishing..." : "Commit Publication"}
                  </button>
                  <button
                    onClick={() => {
                      setStagingId(null);
                      setPreview(null);
                      setHealth(null);
                    }}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "transparent",
                      border: "1px solid var(--border-danger)",
                      color: "var(--text-danger)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                    }}
                  >
                    Discard Staging
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
