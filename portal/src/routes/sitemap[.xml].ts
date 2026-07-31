import { createFileRoute } from "@tanstack/react-router";
import { supabaseServer } from "@/lib/supabase-server";

const SITE_URL = "https://genesis.vinaykhosya.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[]): string {
  const entries = urls
    .map(({ loc, lastmod, changefreq, priority }) => {
      const lines = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`];
      if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
      if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
      if (priority) lines.push(`    <priority>${priority}</priority>`);
      lines.push(`  </url>`);
      return lines.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { data: experiments } = await supabaseServer
          .from("experiments")
          .select("id, slug, published_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false });

        const today = new Date().toISOString().split("T")[0];

        const urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[] = [
          { loc: `${SITE_URL}/`, lastmod: today, changefreq: "weekly", priority: "1.0" },
          { loc: `${SITE_URL}/about`, lastmod: today, changefreq: "monthly", priority: "0.8" },
          { loc: `${SITE_URL}/archive/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
          { loc: `${SITE_URL}/blog/`, lastmod: today, changefreq: "weekly", priority: "0.8" },
        ];

        if (experiments) {
          for (const exp of experiments) {
            urls.push({
              loc: `${SITE_URL}/archive/civilizations/${exp.id}`,
              lastmod: exp.published_at ? exp.published_at.split("T")[0] : today,
              changefreq: "monthly",
              priority: "0.8",
            });
          }
        }

        const xml = buildSitemapXml(urls);

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
