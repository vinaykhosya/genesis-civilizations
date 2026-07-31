import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { supabaseServer } from "@/lib/supabase-server";

// Server function — fetch all published blog posts
const fetchBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseServer
    .from("blog_posts")
    .select("slug, title, excerpt, published_at, tags, reading_time_minutes, experiment_id")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.warn("[fetchBlogPosts] DB error:", error.message);
    return [];
  }
  return data || [];
});

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    try {
      return await fetchBlogPosts();
    } catch {
      return [];
    }
  },
  component: BlogIndexPage,
  head: () => ({
    meta: [
      { title: "Research Blog — Genesis Artificial Life Platform" },
      {
        name: "description",
        content:
          "In-depth articles about artificial life simulation, digital evolution, and emergent behavior findings from Genesis experiments. Research notes, technical breakdowns, and hypothesis explorations.",
      },
      {
        name: "keywords",
        content:
          "artificial life research articles, digital evolution blog, evolutionary computation findings, emergent behavior analysis, agent-based simulation research, computational biology notes",
      },
      { property: "og:title", content: "Research Blog — Genesis Artificial Life Platform" },
      {
        property: "og:description",
        content:
          "In-depth research articles on artificial life, digital evolution, and emergent behavior from Genesis experiments.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function BlogIndexPage() {
  const posts = Route.useLoaderData();

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem 2rem" }}>
      {/* Page header */}
      <header style={{ marginBottom: "4rem" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent-amber, #f59e0b)",
            marginBottom: "0.75rem",
          }}
        >
          Research Notes
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 300,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            marginBottom: "1rem",
          }}
        >
          Genesis Research Blog
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
            maxWidth: "560px",
            lineHeight: 1.7,
          }}
        >
          Deep dives into individual experiments. What we observed, what it means, and what we still don't understand. Each article explores a specific finding from the Genesis artificial life simulation archive.
        </p>
      </header>

      {/* Post list */}
      {posts.length === 0 ? (
        <EmptyBlogState />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {posts.map((post: any) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}

function BlogPostCard({ post }: { post: any }) {
  const pubDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <article
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        padding: "2rem",
        transition: "border-color 0.2s ease, transform 0.2s ease",
      }}
      className="glass"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-emphasis)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
          {post.tags.slice(0, 4).map((tag: string) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.2rem 0.6rem",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-muted)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 400, color: "var(--text-primary)", marginBottom: "0.75rem", lineHeight: 1.3 }}>
        <Link to={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
          {post.title}
        </Link>
      </h2>

      {/* Excerpt */}
      {post.excerpt && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
          {post.excerpt}
        </p>
      )}

      {/* Footer meta */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          {pubDate && (
            <time
              dateTime={post.published_at}
              style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}
            >
              {pubDate}
            </time>
          )}
          {post.reading_time_minutes && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
              {post.reading_time_minutes} min read
            </span>
          )}
          {post.experiment_id && (
            <Link
              to={`/archive/civilizations/${post.experiment_id}`}
              style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent-amber, #f59e0b)", textDecoration: "none" }}
            >
              ↗ Experiment
            </Link>
          )}
        </div>
        <Link
          to={`/blog/${post.slug}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "var(--text-primary)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          Read article →
        </Link>
      </div>
    </article>
  );
}

function EmptyBlogState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "6rem 2rem",
        border: "1px dashed var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        background: "var(--bg-secondary)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "0.75rem",
        }}
      >
        Transmission pending
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
          fontWeight: 300,
          color: "var(--text-primary)",
          marginBottom: "0.75rem",
        }}
      >
        No articles published yet
      </h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: "400px", margin: "0 auto 2rem" }}>
        Research notes and deep-dives into Genesis experiment findings will appear here. Check back after the next publication.
      </p>
      <Link
        to="/archive/"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          color: "var(--text-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "0.5rem 1.25rem",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        Browse Experiment Archive →
      </Link>
    </div>
  );
}
