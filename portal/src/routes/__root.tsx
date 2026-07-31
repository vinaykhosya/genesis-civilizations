import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-space px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Signal Lost</p>
        <h1 className="mt-6 font-display text-7xl text-foreground">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This coordinate is outside the archive. The record you seek may have been sealed.
        </p>
        <div className="mt-8">
          <Link to="/" className="btn-genesis">
            Return to Genesis
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("[Root ErrorComponent]", error);
  const router = useRouter();

  const isChunkLoadError =
    error?.message?.includes("Failed to fetch dynamically imported module") ||
    error?.message?.includes("Importing a module script failed") ||
    error?.message?.includes("loading dynamically imported module");

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });

    // Auto-reload window if a stale chunk 404 error is detected after new deployment
    if (isChunkLoadError) {
      const lastReload = sessionStorage.getItem("genesis_chunk_reload");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("genesis_chunk_reload", String(now));
        window.location.reload();
      }
    }
  }, [error, isChunkLoadError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-space px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Instrument Fault</p>
        <h1 className="mt-6 font-display text-3xl text-foreground">
          {isChunkLoadError ? "New Deployment Available" : "This page didn't load"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {isChunkLoadError
            ? "The platform was recently updated. Reloading page to sync latest scientific assets..."
            : "A telemetry error occurred. Recalibrate and try again."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="btn-genesis"
          >
            Refresh Page
          </button>
          <a href="/" className="btn-genesis">
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Genesis — Open Artificial Life Research Platform" },
      {
        name: "description",
        content:
          "Genesis is an open artificial life research platform simulating digital evolution, emergent behavior, and agent-based civilizations. Reproducible experiments in evolutionary computation and multi-agent systems.",
      },
      {
        name: "keywords",
        content:
          "artificial life simulation, digital evolution, agent-based simulation, emergent behavior, emergent intelligence, evolutionary computation, multi-agent systems, digital organisms, artificial civilization, open artificial life platform, evolutionary simulation, computational biology",
      },
      { name: "author", content: "Vinay Khosya" },
      { property: "og:site_name", content: "Genesis Research Platform" },
      { property: "og:title", content: "Genesis — Open Artificial Life Research Platform" },
      {
        property: "og:description",
        content:
          "An open artificial life research platform simulating digital evolution, emergent behavior, and agent-based civilizations under reproducible conditions.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://genesis.vinaykhosya.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Genesis — Open Artificial Life Research Platform" },
      {
        name: "twitter:description",
        content:
          "Open artificial life research platform. Digital evolution, emergent behavior, and agent-based civilizations under reproducible conditions.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logo.svg", type: "image/svg+xml" },
      { rel: "canonical", href: "https://genesis.vinaykhosya.com" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
