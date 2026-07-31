import React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { supabaseServer } from "@/lib/supabase-server";
import { CitationBlock } from "@/components/civilization/CitationBlock";

const SITE_URL = "https://genesis.vinaykhosya.com";

// Server function — fetch a single blog post by slug
const fetchBlogPost = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { data, error } = await supabaseServer
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) throw notFound();
    return data;
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    return await fetchBlogPost({ data: params.slug });
  },
  component: BlogArticlePage,
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const post = loaderData as any;

    const pageUrl = `${SITE_URL}/blog/${post.slug}`;
    const pubYear = post.published_at ? new Date(post.published_at).getFullYear() : new Date().getFullYear();

    const tags: string[] = Array.isArray(post.tags) ? post.tags : [];
    const keywords = [
      ...tags,
      "artificial life",
      "evolutionary simulation",
      "digital evolution",
      "emergent behavior",
    ].join(", ");

    const metaDesc = post.excerpt || post.title;

    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: metaDesc,
      datePublished: post.published_at || undefined,
      keywords,
      author: { "@type": "Person", name: "Vinay Khosya" },
      publisher: {
        "@type": "Organization",
        name: "Genesis Research Platform",
        url: SITE_URL,
      },
      url: pageUrl,
      ...(post.og_image ? { image: post.og_image } : {}),
      ...(post.reading_time_minutes
        ? { timeRequired: `PT${post.reading_time_minutes}M` }
        : {}),
    });

    return {
      meta: [
        { title: `${post.title} — Genesis Research Blog` },
        { name: "description", content: metaDesc },
        { name: "keywords", content: keywords },
        { property: "og:type", content: "article" },
        { property: "og:title", content: post.title },
        { property: "og:description", content: metaDesc },
        { property: "og:url", content: pageUrl },
        ...(post.og_image ? [{ property: "og:image", content: post.og_image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: metaDesc },
        ...(post.og_image ? [{ name: "twitter:image", content: post.og_image }] : []),
        ...(post.published_at
          ? [{ property: "article:published_time", content: post.published_at }]
          : []),
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [{ type: "application/ld+json", children: jsonLd }],
    };
  },
});

function BlogArticlePage() {
  const post = Route.useLoaderData() as any;

  const pubDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];

  return (
    <main style={{ maxWidth: "780px", margin: "0 auto", padding: "4rem 2rem" }}>
      {/* Back nav */}
      <nav style={{ marginBottom: "3rem" }}>
        <Link
          to="/blog/"
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
          ← Research Blog
        </Link>
      </nav>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {tags.map((tag) => (
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

      {/* Article header */}
      <header style={{ marginBottom: "3rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            fontWeight: 300,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: "1.25rem",
          }}
        >
          {post.title}
        </h1>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            flexWrap: "wrap",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          <span>Vinay Khosya</span>
          {pubDate && <time dateTime={post.published_at}>{pubDate}</time>}
          {post.reading_time_minutes && (
            <span>{post.reading_time_minutes} min read</span>
          )}
          {post.experiment_id && (
            <Link
              to={`/archive/civilizations/${post.experiment_id}`}
              style={{ color: "var(--accent-amber, #f59e0b)", textDecoration: "none" }}
            >
              ↗ View Experiment
            </Link>
          )}
        </div>
      </header>

      {/* Article body — rendered as preformatted prose from DB */}
      <article
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          lineHeight: 1.85,
          color: "var(--text-secondary)",
        }}
      >
        {post.content_html ? (
          <div
            dangerouslySetInnerHTML={{ __html: post.content_html }}
            style={{
              /* Article typography overrides */
            }}
          />
        ) : post.content_md ? (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-base)",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
            }}
          >
            {post.content_md}
          </pre>
        ) : (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            Article content is being prepared for publication.
          </p>
        )}
      </article>

      {/* Divider */}
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--border-default)",
          margin: "4rem 0",
        }}
      />

      {/* Link back to experiment if referenced */}
      {post.experiment_id && (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "1.5rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
          className="glass"
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "0.375rem",
              }}
            >
              Referenced Experiment
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              This article is based on data from Genesis experiment{" "}
              <strong style={{ color: "var(--text-primary)" }}>{post.experiment_id}</strong>.
            </p>
          </div>
          <Link
            to={`/archive/civilizations/${post.experiment_id}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              padding: "0.5rem 1.25rem",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            View Full Record →
          </Link>
        </div>
      )}

      {/* Citation for this article */}
      <CitationBlock
        id={post.slug}
        title={post.title}
        publishedAt={post.published_at}
      />
    </main>
  );
}
