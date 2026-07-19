import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { loginAction } from "@/lib/server-fns";

export const Route = createFileRoute("/control/login")({
  component: LoginPage,
});

function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginAction({ data: password });
      navigate({ to: "/control" });
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "var(--bg-void)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-display)",
      padding: "1rem"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "2.5rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-lg)"
      }} className="glass">
        <h1 style={{
          fontSize: "var(--text-3xl)",
          fontWeight: 700,
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, var(--teal), var(--teal-soft))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Control Console
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--text-secondary)",
          marginBottom: "2rem"
        }}>
          Authenticate to access experiment command operations.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wider)",
              marginBottom: "0.5rem"
            }}>
              Console Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-sm)",
                outline: "none",
                transition: "border-color var(--duration-fast)"
              }}
            />
          </div>

          {error && (
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--text-danger)",
              marginBottom: "1.5rem"
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "var(--gradient-cta)",
              color: "var(--text-inverse)",
              fontWeight: 700,
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-base)",
              boxShadow: "var(--shadow-accent-sm)",
              transition: "transform var(--duration-fast)"
            }}
          >
            {loading ? "Authenticating..." : "Initialize Session →"}
          </button>
        </form>
      </div>
    </main>
  );
}
