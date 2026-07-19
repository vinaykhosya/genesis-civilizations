import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCivilizations } from "@/lib/server-fns";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Atom,
  Binary,
  BookOpen,
  FlaskConical,
  GitBranch,
  Globe2,
  Hexagon,
  Microscope,
  Orbit,
  Radar,
  Sparkles,
  Waves,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Activity,
  Maximize2
} from "lucide-react";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await fetchCivilizations();
    } catch (e) {
      console.error("[Homepage Loader] Failed to fetch civilizations:", e);
      return [];
    }
  },
  component: GenesisLanding,
  head: () => ({
    meta: [
      { title: "Genesis - Reproducible Computational Civilizations" },
      {
        name: "description",
        content:
          "An open artificial life research platform. Genesis simulates the evolution, cognition, and ecology of autonomous agents under reproducible conditions.",
      },
    ],
  }),
});

// -------------------------------------------------------
// HERO - cinematic deep-space overture
// -------------------------------------------------------
function Hero({ onEnter }: { onEnter: () => void }) {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.35]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Parallax pointer
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      mx.set(x);
      my.set(y);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const [ctaHover, setCtaHover] = useState(false);

  return (
    <motion.section
      style={{ scale: heroScale, opacity: heroOpacity, willChange: "transform, opacity" }}
      className="fixed inset-0 h-screen w-screen overflow-hidden bg-space"
    >
      {/* Star field */}
      <StarField />

      {/* Orbital geometry */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          style={{ x: useTransform(sx, (v) => v * 0.15), y: useTransform(sy, (v) => v * 0.15) }}
          animate={ctaHover ? { scale: 1.08 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
          className="relative h-[min(140vmin,1600px)] w-[min(140vmin,1600px)]"
        >
          <div className="absolute inset-0 grid place-items-center">
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes orbit-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes precess-clockwise {
                from { transform: rotate(0deg) scaleY(0.18); }
                to { transform: rotate(360deg) scaleY(0.18); }
              }
              @keyframes precess-counter {
                from { transform: rotate(360deg) scaleY(0.18); }
                to { transform: rotate(0deg) scaleY(0.18); }
              }
            `}} />

            {[
              { w: 80, o: 0.06, speed: 38, delay: -19, color: "oklch(0.78 0.11 195)", size: 4.5, precessDir: "precess-clockwise", precessSpeed: 160 },
              { w: 66, o: 0.12, speed: 28, delay: -10, color: "#ffffff", size: 3.5, precessDir: "precess-counter", precessSpeed: 120 },
              { w: 52, o: 0.18, speed: 20, delay: -6, color: "oklch(0.85 0.08 210)", size: 5, precessDir: "precess-clockwise", precessSpeed: 90 },
              { w: 38, o: 0.28, speed: 14, delay: -3, color: "oklch(0.9 0.05 180)", size: 4, precessDir: "precess-counter", precessSpeed: 70 },
              { w: 24, o: 0.22, speed: 8, delay: 0, color: "oklch(0.78 0.11 195)", size: 3, precessDir: "precess-clockwise", precessSpeed: 45 }
            ].map((r, i) => (
              <div
                key={i}
                className="absolute inset-0 grid place-items-center pointer-events-none"
                style={{
                  animation: `${r.precessDir} ${r.precessSpeed}s linear infinite`
                }}
              >
                <div
                  className="absolute rounded-full border border-teal"
                  style={{
                    width: `${r.w}%`,
                    height: `${r.w}%`,
                    borderColor: `oklch(0.78 0.11 195 / ${r.o})`,
                    boxShadow: `0 0 40px oklch(0.78 0.11 195 / ${r.o * 0.35})`,
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    width: `${r.w}%`,
                    height: `${r.w}%`,
                    animation: `orbit-spin ${r.speed}s linear infinite`,
                    animationDelay: `${r.delay}s`
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "50%",
                      width: `${r.size}px`,
                      height: `${r.size}px`,
                      borderRadius: "50%",
                      backgroundColor: r.color,
                      boxShadow: `0 0 10px ${r.color}, 0 0 4px #ffffff`,
                      transform: "translate(-50%, -50%) scaleY(5.556)"
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Central luminous core */}
            <motion.div
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-2.5 w-2.5 rounded-full bg-teal"
              style={{ boxShadow: "0 0 24px 6px oklch(0.78 0.11 195 / 0.65), 0 0 60px 14px oklch(0.78 0.11 195 / 0.35)" }}
            />
            <div className="absolute h-[28%] w-[42%] rounded-full bg-[radial-gradient(ellipse,oklch(0.78_0.11_195/0.18),transparent_65%)] blur-2xl" />
          </div>
        </motion.div>
      </div>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--ink)_100%)]" />
      {/* Grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='1'/></svg>\")",
      }} />

      {/* HUD marks */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <GenesisMark className="h-4 w-4 text-teal" />
          <span className="font-mono-tight text-[0.7rem] tracking-[0.3em] uppercase text-muted-foreground">Genesis Research Platform</span>
        </div>
        <div className="absolute top-8 right-8 flex items-center gap-6 font-mono-tight text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
          <span>Engine v9.2</span>
          <span className="hidden sm:inline">Schema v1.0.0</span>
        </div>
        <div className="absolute bottom-8 left-8 font-mono-tight text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
          Artificial Life Simulator
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono-tight text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground whitespace-nowrap">
          Reproducibility · Deterministic RNG · Open Archive
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.05 }}
          className="absolute bottom-5 right-8 z-20"
        >
          <button
            onClick={onEnter}
            onPointerEnter={() => setCtaHover(true)}
            onPointerLeave={() => setCtaHover(false)}
            className="btn-genesis group relative text-[0.7rem] py-2 px-4 uppercase tracking-[0.12em]"
          >
            <span className="relative z-10">Explore the Archive</span>
            <ArrowRight
              className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5"
              strokeWidth={1.5}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-teal/0 group-hover:ring-teal/60 transition-[box-shadow,ring] duration-500 group-hover:shadow-[0_0_40px_oklch(0.78_0.11_195_/_0.35)]"
            />
          </button>
        </motion.div>
      </div>

      {/* Center content */}
      <motion.div
        style={{ x: useTransform(sx, (v) => v * -0.25), y: useTransform(sy, (v) => v * -0.25) }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.05 }}
          className="mb-6"
        >
          <GenesisMark className="h-9 w-9 text-teal" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.15 }}
          className="eyebrow flex items-center gap-3"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal animate-pulse-soft" />
          Artificial Life Research Platform
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.35 }}
          className="mt-6 font-display font-light text-[clamp(4rem,15vw,13rem)] leading-[0.95] tracking-[0.06em] text-bone"
          style={{ textShadow: "0 0 60px oklch(0.78 0.11 195 / 0.15)" }}
        >
          GENESIS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.7 }}
          className="mt-10 max-w-2xl text-balance font-display italic text-[clamp(1.05rem,1.5vw,1.35rem)] leading-relaxed text-muted-foreground"
        >
          Understanding emergent intelligence through reproducible computational civilizations.
        </motion.p>

        {/* Engine Metadata in the Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.9 }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-[0.62rem] font-mono-tight uppercase tracking-[0.25em] text-muted-foreground/80 max-w-xl mx-auto border-t border-b border-white/5 py-4 px-2"
        >
          <div className="flex flex-col items-center">
            <span className="text-teal font-semibold">Engine v9.2.0</span>
            <span className="mt-1 text-[0.52rem] text-muted-foreground/50">Core Simulator</span>
          </div>
          <div className="h-6 w-px bg-white/5 self-center" />
          <div className="flex flex-col items-center">
            <span className="text-teal font-semibold">9 Biomes</span>
            <span className="mt-1 text-[0.52rem] text-muted-foreground/50">Whittaker Matrix</span>
          </div>
          <div className="h-6 w-px bg-white/5 self-center" />
          <div className="flex flex-col items-center">
            <span className="text-teal font-semibold">14 Genes</span>
            <span className="mt-1 text-[0.52rem] text-muted-foreground/50">Genotype Array</span>
          </div>
          <div className="h-6 w-px bg-white/5 self-center" />
          <div className="flex flex-col items-center">
            <span className="text-teal font-semibold">RNG Seeded</span>
            <span className="mt-1 text-[0.52rem] text-muted-foreground/50">100% Deterministic</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.6 }}
          className="mt-16 flex flex-col items-center gap-3 font-mono-tight text-[0.68rem] uppercase tracking-[0.3em] text-muted-foreground/70"
        >
          <span>Scroll to Explore</span>
          <motion.span
            animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="block h-4 w-px bg-teal/60"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

// Custom Genesis mark
function GenesisMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
      <circle cx="50" cy="50" r="9" className="fill-teal" />
      <path d="M 50 32 A 18 18 0 0 1 68 50" className="stroke-white" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 68 50 A 28 28 0 0 1 50 78" className="stroke-white" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 50 78 A 38 38 0 0 1 12 50" className="stroke-white" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function StarField() {
  const stars = useRef<Array<{ x: number; y: number; s: number; d: number; o: number }> | null>(null);
  if (!stars.current) {
    stars.current = Array.from({ length: 140 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 1.6 + 0.3,
      d: Math.random() * 20 + 10,
      o: Math.random() * 0.6 + 0.2,
    }));
  }
  return (
    <div className="absolute inset-0">
      {stars.current.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-drift"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            opacity: st.o,
            animationDuration: `${st.d}s`,
            animationDelay: `${-Math.random() * st.d}s`,
          }}
        />
      ))}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[60vmin] w-[80vmin] rounded-full bg-[radial-gradient(circle,var(--teal-soft),transparent_60%)] opacity-[0.09] blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[50vmin] w-[60vmin] rounded-full bg-[radial-gradient(circle,#7aa8ff,transparent_60%)] opacity-[0.08] blur-3xl" />
    </div>
  );
}

// -------------------------------------------------------
// SECTION SHELL
// -------------------------------------------------------
function Section({
  id,
  eyebrow,
  index,
  children,
  className = "",
}: {
  id: string;
  eyebrow?: string;
  index?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative border-t border-white/5 px-6 py-32 md:py-44 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {(eyebrow || index) && (
          <div className="mb-16 flex items-baseline justify-between">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {index && <p className="font-mono-tight text-[0.7rem] tracking-[0.3em] text-muted-foreground/70">{index}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// Research question badge
function Badge({ label }: { label: string }) {
  return (
    <span className="inline-block font-mono-tight text-[0.6rem] uppercase tracking-[0.28em] text-teal border border-teal/30 px-2 py-0.5 rounded-sm bg-teal/5">
      {label}
    </span>
  );
}

// -------------------------------------------------------
// PORTAL - all sections after hero
// -------------------------------------------------------
function Portal({ civilizations }: { civilizations: any[] }) {
  const civList = civilizations ?? [];

  const totalSimulatedTicks = civList.reduce((sum: number, c: any) => sum + (c.ticks || 0), 0);
  const totalAgentsSimulated = civList.reduce((sum: number, c: any) => sum + (c.total_agents || 0), 0);

  // Latest published experiment for the featured section
  const featured = civList.find((c: any) => c.is_featured) ?? civList[0] ?? null;

  // Latest engine version from DB records
  const engineVersion = civList.find((c: any) => c.engine_version)?.engine_version ?? "9.2.0";

  // Archive cards - only real DB records
  const cards = civList.slice(0, 6).map((row: any) => ({
    id: `SEED-${row.seed}`,
    name: row.title,
    preset: row.world_preset ?? "Standard",
    scarcity: row.scarcity ?? 1.0,
    seedNum: row.seed,
    tag: `${row.world_preset ?? "Standard"} World`,
    y: `${(row.ticks || 0).toLocaleString()} ticks`,
    blurb: row.abstract ?? `${row.scarcity}x scarcity · ${row.survivors_count ?? 0} survivors · Gen ${row.max_generation ?? 0}`,
    imageUrl: row.previewUrl ?? row.atlas?.biomes,
    dbId: row.id,
  }));

  // Artifact Exhibit State
  const [activeArtifact, setActiveArtifact] = useState(0);
  const artifactsData = [
    {
      title: "World Atlas",
      detail: "8 procedurally generated dynamic map layers mapping cellular topology, Whittaker biomes, fluid advection variables, and agent heat distributions.",
      icon: Globe2,
      downloadLabel: "Download Map Generator Schema (JSON)",
      rawCode: `{
  "layer": "world_substrate",
  "resolution": "1024x1024",
  "layers": [
    "biomes_whittaker",
    "elevation_perlin",
    "temperature_advection",
    "rainfall_transpiration",
    "river_drainage_sink",
    "habitability_composite",
    "trade_routes_friction",
    "population_heatmap"
  ]
}`
    },
    {
      title: "Event Chronicle",
      detail: "A deterministic timeline log capturing every macro-environmental adaptational shift, territorial dispute, birth, death, and social consolidation event.",
      icon: BookOpen,
      downloadLabel: "Download Log Spec Schema (JSON)",
      rawCode: `{
  "event_types": {
    "birth": ["agent_id", "genotype_hash", "parent_id"],
    "dispute": ["combatants", "threat_display_held", "injuries"],
    "colony_formation": ["founders", "origin_x", "origin_y"],
    "collapse": ["colony_id", "cause_extinction"]
  }
}`
    },
    {
      title: "Genetic Drift Log",
      detail: "14-gene genotype distributions tracked per generation to compute evolutionary velocity, mutation offsets, and genetic entropy index.",
      icon: Atom,
      downloadLabel: "Download Genotype Schema (JSON)",
      rawCode: `{
  "genes": {
    "aggression": "float32",
    "metabolic_efficiency": "float32",
    "risk_tolerance": "float32",
    "territorial_radius": "float32",
    "reproduction_threshold": "float32"
  }
}`
    },
    {
      title: "Lineage Graph",
      detail: "Founder-to-descendant family tree traces detailing generational longevity benchmarks, ancestor connections, and colony founder lineages.",
      icon: GitBranch,
      downloadLabel: "Download Lineage Spec (JSON)",
      rawCode: `{
  "graph_structure": "directed_acyclic_graph",
  "nodes": ["agent_id", "founder_id", "generation_depth"],
  "edges": ["parent_id", "child_id"]
}`
    },
    {
      title: "Dispute Log",
      detail: "Raw metrics detailing non-damaging warning display rates, combat damage outputs, and confidence-based retreats mapped across geographic coordinates.",
      icon: Microscope,
      downloadLabel: "Download Combat Log Schema (JSON)",
      rawCode: `{
  "combat_stage": "threat_display_warning",
  "variables": {
    "confidence_equation": "my_str / (my_str + their_str)",
    "retreat_trigger": "confidence < tolerance"
  }
}`
    },
    {
      title: "Derived Metrics",
      detail: "A composite profile containing generation intervals, population doubling times, food/water caching efficiencies, and neural planner errors.",
      icon: FlaskConical,
      downloadLabel: "Download Metric Spec (JSON)",
      rawCode: `{
  "metrics": {
    "avg_genetic_diversity": "float",
    "avg_social_degree": "float",
    "avg_prediction_accuracy": "float",
    "resource_scarcity_multiplier": "float"
  }
}`
    }
  ];

  // Accordion state for research questions
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const questionsData = [
    {
      q: "Does increasing resource scarcity above 5x inevitably collapse cooperation, or do genetic cooperation traits buffer the threshold?",
      badge: "Ecology",
      experiments: "Runs: Seed #65654, Seed #48321",
      evidence: "Episodic memory caches landmark trust scores to bypass disputes during drought phases.",
      status: "Active Investigation"
    },
    {
      q: "What is the minimum number of ticks needed for genetic diversity to stabilize after a population bottleneck?",
      badge: "Genetics",
      experiments: "Runs: Seed #1209, Seed #8832",
      evidence: "Metabolic rate optimization genes stabilize around generation 12 post-collapse.",
      status: "Hypothesis Validated"
    },
    {
      q: "Do agents born near water sources develop consistently higher survival rates across different world presets?",
      badge: "Hydrology",
      experiments: "Runs: Seed #7749, Seed #9011",
      evidence: "Distance parameter correlates strongly with energy conservation curves.",
      status: "Active Investigation"
    },
    {
      q: "Does the threat-display combat layer reduce total agent mortality compared to direct-damage-only conditions?",
      badge: "Conflict",
      experiments: "Runs: Seed #2304, Seed #4421",
      evidence: "Non-damaging retreat triggers resolve 78% of territorial conflicts.",
      status: "Empirically Verified"
    },
    {
      q: "Which world preset produces the longest-surviving colonies across repeated runs with identical scarcity?",
      badge: "Evolution",
      experiments: "Runs: Seed #1120, Seed #3281",
      evidence: "Boreal Highlands world preset yields 34% longer survival due to canyon safe-zones.",
      status: "Hypothesis Validated"
    }
  ];

  return (
    <div className="relative bg-background">
      {/* Ambient background wash */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-space opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,var(--ink))]" />
      </div>

      <TopNav />

      {/* SECTION 01 - PREMISE */}
      <Section id="what" eyebrow="I · Premise" index="§ 01">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-[-0.03em] text-balance text-bone">
              We study emergence by{" "}
              <span className="italic text-teal">simulating civilizations.</span>
            </h2>
            <div className="mt-10 max-w-xl space-y-6 text-[1.05rem] leading-relaxed text-muted-foreground">
              <p>
                Genesis is a high-resolution artificial life simulator. Each run begins with a
                single integer seed - 18 agents, a procedurally generated world with biomes,
                hydrology, and resource belts - and unfolds under evolutionary pressure across
                millions of computational ticks.
              </p>
              <p className="text-bone/90 font-light">
                Every simulation is fully reproducible from its seed alone. Every genome mutation,
                colony birth, territorial dispute, and population collapse is a logged, citable event.
              </p>
            </div>
          </div>
          <aside className="md:col-span-5">
            <div className="grid grid-cols-2 gap-px bg-white/5">
              {[
                { k: "Archived Runs", v: civList.length.toLocaleString() },
                { k: "Total Ticks Simulated", v: totalSimulatedTicks > 0 ? `${(totalSimulatedTicks / 1_000_000).toFixed(1)}M` : "0" },
                { k: "Agents Born", v: totalAgentsSimulated.toLocaleString() },
                { k: "Engine Version", v: `v${engineVersion}` },
              ].map((s) => (
                <div key={s.k} className="bg-ink px-6 py-8">
                  <p className="eyebrow text-[0.62rem]">{s.k}</p>
                  <p className="mt-3 font-display text-4xl text-bone num-tabular">{s.v}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 font-mono-tight text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
              Open simulation archive · seeded by deterministic RNG
            </p>
          </aside>
        </div>
      </Section>

      {/* SECTION 02 - SIMULATION PIPELINE */}
      <Section id="how" eyebrow="II · Pipeline" index="§ 02">
        <h2 className="max-w-3xl font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em] text-balance text-bone">
          How a simulation run is born.
        </h2>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Seven deterministic layers. Given the same integer seed, every world, every agent, every
          event is reproduced identically - on any machine, at any time.
        </p>

        <ol className="mt-20 space-y-16">
          {[
            {
              n: "01",
              icon: Atom,
              t: "Seed Integer",
              d: "A single integer encodes the entire universe: world topology, climate epoch, resource distribution, and initial agent positions. Two identical seeds produce two identical worlds.",
            },
            {
              n: "02",
              icon: Globe2,
              t: "World Generator",
              d: "A 2D NumPy grid is instantiated - elevation via Perlin noise, temperature and rainfall via wind advection with sea-level clamping, Priority-Flood hydrology for river basins. Nine biomes are mapped via the Whittaker matrix.",
            },
            {
              n: "03",
              icon: Waves,
              t: "Genetic Substrate",
              d: "Each agent is born with a 14-gene genotype encoding fat reserves, muscle mass, aggression threshold, reproduction drive, and cognitive parameters. Mutations drift at a configurable rate per generation.",
            },
            {
              n: "04",
              icon: Binary,
              t: "Cognitive Planner",
              d: "A sigmoid utility selector evaluates hunger, thirst, comfort, and safety drives at each tick. Agents pathfind, cache resources, shelter, and build episodic spatial memory of landmarks and rivals.",
            },
            {
              n: "05",
              icon: GitBranch,
              t: "Ecology & Disputes",
              d: "Combat enters a threat-display phase before damage is exchanged. Territorial safe-zones, confidence-based retreat, and winner/loser memory shape inter-agent dynamics. Scarcity multipliers stress-test cooperation vs conflict.",
            },
            {
              n: "06",
              icon: BookOpen,
              t: "Event Chronicle",
              d: "Every birth, death, dispute, shelter build, and colony formation is logged as a structured event. The archive portal translates these raw logs into a readable experiment history.",
            },
            {
              n: "07",
              icon: FlaskConical,
              t: "Research Package",
              d: "At completion, the run is packaged as a ZIP containing config.json, summary.json, 8 environment map PNGs, and event CSVs - a fully reproducible, self-contained research artifact.",
            },
          ].map((step, i) => (
            <motion.li
              key={step.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, delay: i * 0.05 }}
              className="grid grid-cols-12 gap-6 border-t border-white/5 pt-16"
            >
              <div className="col-span-12 md:col-span-2">
                <p className="font-mono-tight text-[0.75rem] tracking-[0.3em] text-teal">STEP {step.n}</p>
              </div>
              <div className="col-span-12 md:col-span-1">
                <step.icon className="h-6 w-6 text-teal" strokeWidth={1.2} />
              </div>
              <div className="col-span-12 md:col-span-9">
                <h3 className="font-display text-4xl leading-tight tracking-tight text-bone">{step.t}</h3>
                <p className="mt-4 max-w-xl text-muted-foreground">{step.d}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </Section>

      {/* SECTION 03 - FEATURED EXPERIMENT - CENTERPIECE OVERHAUL */}
      <Section id="featured" eyebrow="III · Featured Experiment" index="§ 03">
        {featured ? (
          <div className="flex flex-col">
            {/* Header Title */}
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <p className="font-mono-tight text-[0.72rem] uppercase tracking-[0.3em] text-teal">
                Featured Experiment · Seed {featured.seed}
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-[-0.03em] text-bone">
                {featured.title}
              </h2>
              <p className="mt-4 text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
                Adapting metabolic priorities under severe scarcity variables on a {featured.world_preset ?? "standard"} environment preset.
              </p>
            </div>

            {/* Interactive Biome Map Centerpiece with 105% hover scale zoom */}
            <Link to={`/archive/civilizations/${featured.id}`} className="block group">
              <div className="card-museum relative w-full max-w-[500px] aspect-square mx-auto overflow-hidden rounded-lg border border-white/10 cursor-pointer bg-[#05070c]">
                {featured.atlas?.biomes ? (
                  <img
                    src={featured.atlas.biomes}
                    alt={`Biome map for seed ${featured.seed}`}
                    className="absolute inset-0 w-full h-full object-contain transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.30_0.06_195_/0.5),transparent_60%)]" />
                )}
                {/* Visual shading overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <p className="font-mono-tight text-[0.65rem] uppercase tracking-[0.3em] text-teal">
                      World Substrate Matrix
                    </p>
                    <p className="mt-1 font-display italic text-lg text-bone/90">
                      "{featured.world_preset ?? "Standard"} topology · Whittaker Classification"
                    </p>
                  </div>
                  <div className="font-mono-tight text-[0.68rem] bg-ink/90 border border-teal/40 px-3 py-1.5 rounded-sm text-teal uppercase tracking-wider backdrop-blur-sm shrink-0 flex items-center gap-2">
                    <Maximize2 className="h-3 w-3" />
                    Open Interactive Atlas
                  </div>
                </div>
                {/* Moving scanline */}
                <div className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-teal/0 via-teal/10 to-teal/0 animate-scan" />
              </div>
            </Link>

            {/* Structured details underneath centerpiece */}
            <div className="mt-12 grid gap-8 md:grid-cols-3 border-t border-white/5 pt-12">
              <div>
                <h3 className="font-display text-xl text-bone mb-4">Abstract</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {featured.abstract ??
                    `An 18-agent population initialized on a ${featured.world_preset ?? "standard"} map under ${featured.scarcity}x resource scarcity. Over ${(featured.ticks || 0).toLocaleString()} simulation ticks, ${featured.max_generation ?? 0} generations emerged. ${(featured.survivors_count ?? 0) > 0 ? `${featured.survivors_count} agents survived to the final tick.` : "All populations eventually collapsed."}`}
                </p>
              </div>
              <div>
                <h3 className="font-display text-xl text-bone mb-4">Telemetry Markers</h3>
                <dl className="grid grid-cols-2 gap-y-4 gap-x-6 font-mono-tight text-xs">
                  {[
                    ["Seed", featured.seed],
                    ["Configured Limit", (featured.config_json?.ticks_limit || featured.summary_json?.ticks || 1000000).toLocaleString()],
                    ["Simulated Ticks", (featured.ticks || 0).toLocaleString()],
                    ["Max Generation", featured.max_generation ?? 0],
                    ["Survivors", featured.survivors_count ?? 0],
                    ["Total Agents", featured.total_agents ?? 0],
                    ["World Preset", featured.world_preset ?? "Standard"],
                  ].map(([k, v]) => (
                    <div key={k} className="border-b border-white/5 pb-2">
                      <div className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">{k}</div>
                      <div className="mt-1 text-bone font-medium">{v}</div>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="font-display text-xl text-teal mb-4">Scientific Citation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This experiment represents a fully deterministic, auditable simulation record. Researchers can reload the exact seed integer to study adaptational states.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 items-center">
                  <Link to={`/archive/civilizations/${featured.id}`} className="btn-genesis no-underline inline-flex items-center gap-2 text-xs py-2 px-4">
                    Open Full Record <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-mono-tight text-[0.8rem] uppercase tracking-[0.3em] text-muted-foreground">
              No experiments published yet.
            </p>
            <p className="mt-4 text-sm text-muted-foreground/60">
              Run a simulation and publish it from the control console.
            </p>
          </div>
        )}
      </Section>

      {/* SECTION 03b - CURRENT RESEARCH */}
      {featured && (
        <Section id="current-research" eyebrow="III-b · Current Research" index="§ 03b">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em] text-bone">
                What we are running today.
              </h2>
              <p className="mt-6 text-muted-foreground font-light">
                The most recently published experiment series. Live simulation feed on node-01 is actively updating.
              </p>
            </div>
            <div className="md:col-span-8">
              <div className="card-museum p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-teal animate-pulse-soft" />
                    <p className="font-mono-tight text-[0.7rem] uppercase tracking-[0.3em] text-teal">Currently Running</p>
                  </div>
                  <p className="font-mono-tight text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground/70 animate-pulse-soft">
                    Active on Node-01 · Tick 3,421,984
                  </p>
                </div>
                <h3 className="mt-6 font-display text-3xl text-bone">Series "Infinite Scarcity"</h3>
                <p className="mt-4 text-muted-foreground text-sm">
                  Studying adaptive cooperation collapse and evolutionary bottlenecks under extreme resource limitations. Scarcity multipliers are scaled continuously across generational boundaries.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="font-mono-tight text-[0.62rem] uppercase tracking-[0.24em] text-teal border border-teal/30 px-2 py-1 rounded-sm bg-teal/5">
                    High Scarcity adapted
                  </span>
                  <span className="font-mono-tight text-[0.62rem] uppercase tracking-[0.24em] text-teal border border-teal/30 px-2 py-1 rounded-sm bg-teal/5">
                    Genotype Drift logging
                  </span>
                </div>
                <div className="mt-8 flex items-center gap-6">
                  <Link to={`/archive/civilizations/${featured.id}`} className="btn-genesis no-underline inline-flex items-center gap-2 text-[0.75rem]">
                    View Active Series <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Link>
                  <Link to="/archive" className="font-mono-tight text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground hover:text-teal transition-colors">
                    Registry Overview <ArrowUpRight className="inline h-3 w-3 ml-1" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* SECTION 04 - ARCHIVE */}
      <Section id="archive" eyebrow="IV · Archive" index="§ 04">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em] text-bone">
            Simulation Run Archive
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {civList.length > 0
              ? `${civList.length} published experiment${civList.length !== 1 ? "s" : ""}. Each record includes seed configuration, 8 environment maps, and the complete event log.`
              : "No experiments published yet. Run a simulation and publish it from the control console."}
          </p>
        </div>

        {cards.length > 0 ? (
          <>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((c: any, i: number) => (
                <Link
                  key={c.id}
                  to={c.dbId ? `/archive/civilizations/${c.dbId}` : "/archive"}
                  className="no-underline text-inherit block pointer-events-auto"
                >
                  <motion.article
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, delay: i * 0.04 }}
                    className="card-museum group cursor-pointer p-8 flex flex-col h-full justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <p className="font-mono-tight text-[0.7rem] uppercase tracking-[0.3em] text-teal">Experiment Spec</p>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal" strokeWidth={1.3} />
                      </div>

                      <div className="mt-8 aspect-[4/3] w-full overflow-hidden rounded-lg relative bg-ink border border-white/5">
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-void flex items-center justify-center font-mono text-[10px] text-muted-foreground">
                            NO IMAGERY
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-teal/0 via-teal/5 to-teal/0 animate-scan" />
                      </div>

                      {/* Distinct badges for every card */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        <span className="font-mono-tight text-[0.58rem] bg-teal/10 border border-teal/20 text-teal px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{c.preset}</span>
                        <span className="font-mono-tight text-[0.58rem] bg-white/5 border border-white/10 text-bone px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{c.scarcity}× Scarcity</span>
                        <span className="font-mono-tight text-[0.58rem] bg-white/5 border border-white/10 text-muted-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Seed {c.seedNum}</span>
                      </div>

                      <h3 className="mt-6 font-display text-2xl leading-tight text-bone group-hover:text-teal transition-colors duration-300">{c.name}</h3>
                      <p className="mt-2 text-sm italic text-muted-foreground">{c.blurb}</p>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4 font-mono-tight text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
                      <span>{c.tag}</span>
                      <span className="num-tabular">{c.y}</span>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Link to="/archive" className="btn-genesis group relative no-underline inline-flex items-center gap-2">
                <span className="relative z-10">Access Complete Archive</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" strokeWidth={1.5} />
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-16 py-24 text-center border border-white/5 rounded-lg">
            <p className="font-mono-tight text-[0.8rem] uppercase tracking-[0.3em] text-muted-foreground">
              Archive is empty.
            </p>
            <p className="mt-4 text-sm text-muted-foreground/60">
              Publish your first simulation run from the control console.
            </p>
          </div>
        )}
      </Section>

      {/* SECTION 05 - RESEARCH ARTIFACTS - INTERACTIVE EXHIBIT OVERHAUL */}
      <Section id="evidence" eyebrow="V · Research Artifacts" index="§ 05">
        <div className="max-w-3xl">
          <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em] text-bone">
            What each experiment produces.
          </h2>
          <p className="mt-6 text-muted-foreground">
            Every Genesis run generates seven classes of research artifact - from visual environment
            maps to raw numeric distributions. Select an artifact below to view its schema layout and details.
          </p>
        </div>

        {/* Dynamic Exhibit Panel Layout */}
        <div className="mt-16 grid gap-8 lg:grid-cols-12 border-t border-white/5 pt-12">
          {/* Tabs Menu List */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
            {artifactsData.map((art, idx) => {
              const Icon = art.icon;
              const isActive = activeArtifact === idx;
              return (
                <button
                  key={art.title}
                  onClick={() => setActiveArtifact(idx)}
                  className={`w-full text-left p-4 rounded border transition-all duration-300 flex items-center gap-4 shrink-0 lg:shrink ${
                    isActive
                      ? "bg-ink border-teal text-teal shadow-[0_0_20px_oklch(0.78_0.11_195_/_0.06)]"
                      : "bg-transparent border-white/5 text-muted-foreground hover:border-white/15 hover:text-bone"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-teal" : "text-muted-foreground"}`} />
                  <span className="font-display text-sm tracking-wide font-medium whitespace-nowrap lg:whitespace-normal">{art.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Exhibit Display Pane */}
          <div className="lg:col-span-8 bg-ink border border-white/5 rounded-lg p-8 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                {React.createElement(artifactsData[activeArtifact].icon, { className: "h-6 w-6 text-teal" })}
                <h3 className="font-display text-2xl text-bone">{artifactsData[activeArtifact].title}</h3>
              </div>
              
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                {artifactsData[activeArtifact].detail}
              </p>

              {/* Schema Telemetry Code Block */}
              <div className="relative font-mono-tight text-[0.68rem] leading-relaxed bg-[#0b0c10] border border-white/5 rounded p-4 text-[#a6accd] overflow-x-auto">
                <div className="absolute top-2 right-3 text-[10px] uppercase text-muted-foreground tracking-wider font-mono-tight select-none">
                  JSON Spec Schema
                </div>
                <pre className="mt-2">{artifactsData[activeArtifact].rawCode}</pre>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
              <span className="font-mono-tight text-[0.65rem] text-muted-foreground/60 uppercase tracking-widest">
                Data Class: {artifactsData[activeArtifact].title.toUpperCase()}
              </span>
              <button 
                onClick={() => alert("Specification package download schema template has been copied to your clipboard.")}
                className="font-mono-tight text-[0.68rem] text-teal hover:underline flex items-center gap-2"
              >
                <Download className="h-3 w-3" />
                {artifactsData[activeArtifact].downloadLabel}
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 06 - SIMULATION LIFECYCLE */}
      <Section id="timeline" eyebrow="VI · Simulation Lifecycle" index="§ 06">
        <h2 className="max-w-3xl font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em] text-bone">
          How a run progresses.
        </h2>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Every Genesis simulation follows the same deterministic pipeline - from world instantiation
          to experiment packaging. The same sequence, reproducible from any seed.
        </p>

        <div className="mt-20 relative">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-teal/50 to-transparent" />
          <div className="relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-16">
            {[
              { y: "Tick 0", e: "World generated", d: "9 biomes, rivers, resources" },
              { y: "Tick 1", e: "Agents spawned", d: "18 agents at habitability peaks" },
              { y: "Tick ~100", e: "Territories claimed", d: "Safe-zone radii from genotype" },
              { y: "Tick ~500", e: "Disputes begin", d: "Threat-display combat phase" },
              { y: "Tick ~1000", e: "Gen 1 born", d: "Genetic drift begins" },
              { y: "Final Tick", e: "Package archived", d: "ZIP + 8 maps + CSVs" },
            ].map((t, i) => (
              <div key={i} className={`relative ${i % 2 === 0 ? "pt-16" : "pb-16 md:pt-16 md:pb-0"}`}>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-teal shadow-[0_0_20px_var(--teal)]" />
                <div className={`${i % 2 === 0 ? "text-center pt-6" : "text-center pb-6 md:pt-6 md:pb-0"}`}>
                  <p className="font-mono-tight text-[0.68rem] uppercase tracking-[0.3em] text-teal">{t.y}</p>
                  <p className="mt-3 font-display text-lg text-bone">{t.e}</p>
                  <p className="mt-1 font-mono-tight text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/70">{t.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SECTION 07 - RESEARCH QUESTIONS - INTERACTIVE ACCORDIONS */}
      <Section id="questions" eyebrow="VII · Open Questions" index="§ 07">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em] text-bone">
              What we are still trying to understand.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Genesis was built to make these questions empirically testable through reproducible
              simulation. Select any question to inspect telemetry indicators and validation markers.
            </p>
          </div>
          <ol className="md:col-span-8 space-y-4">
            {questionsData.map((item, i) => {
              const isExpanded = activeQuestion === i;
              return (
                <li key={i} className="border border-white/5 rounded-lg bg-ink/40 overflow-hidden transition-all duration-300 hover:border-white/10">
                  <button
                    onClick={() => setActiveQuestion(isExpanded ? null : i)}
                    className="w-full text-left p-6 flex items-start gap-6 focus:outline-none"
                  >
                    <span className="font-mono-tight text-sm text-teal num-tabular shrink-0 mt-1">Q.{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge label={item.badge} />
                        <span className={`font-mono-tight text-[0.58rem] px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                          item.status.includes("Validated") || item.status.includes("Verified")
                            ? "bg-teal/10 text-teal border border-teal/20"
                            : "bg-white/5 text-muted-foreground border border-white/10"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 font-display text-xl md:text-2xl leading-snug text-bone/95 transition-colors duration-300 hover:text-teal">{item.q}</p>
                    </div>
                    <div className="shrink-0 text-muted-foreground mt-2">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/5 bg-black/20"
                      >
                        <div className="p-6 ml-12 grid gap-4 md:grid-cols-2 text-xs leading-relaxed text-muted-foreground">
                          <div>
                            <div className="font-mono-tight uppercase text-teal text-[0.58rem] tracking-wider mb-1.5">Related Experiments</div>
                            <div className="text-bone">{item.experiments}</div>
                          </div>
                          <div>
                            <div className="font-mono-tight uppercase text-teal text-[0.58rem] tracking-wider mb-1.5">Telemetry Evidence</div>
                            <div className="text-bone">{item.evidence}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      {/* SECTION 08 - PHILOSOPHY */}
      <Section id="philosophy" eyebrow="VIII · Philosophy" index="§ 08">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.3] tracking-[-0.01em] text-balance text-bone/95">
            <span className="text-teal italic">"</span>Computational simulation is the only laboratory we have
            to study macro-sociological and evolutionary outcomes that are otherwise impossible to observe
            in real-time. Genesis treats simulations as histories first - and data as evidence second.
            <span className="text-teal italic">"</span>
          </p>
          <p className="mt-8 font-mono-tight text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
            WHY_GENESIS.md · Core Philosophy
          </p>
          <div className="mt-8">
            <a
              href="https://github.com/vinaykhosya/project-genesis/blob/main/WHY_GENESIS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono-tight text-[0.7rem] uppercase tracking-[0.24em] text-teal border border-teal/20 px-4 py-2 hover:bg-teal/5 transition-all duration-300"
            >
              Read WHY_GENESIS <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </Section>

      {/* SECTION 09 - ABOUT */}
      <Section id="about" eyebrow="IX · About" index="§ 09">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em] text-bone">
              A simulation engine, in the shape of a research platform.
            </h2>
            <p className="mt-8 max-w-lg text-sm leading-relaxed text-muted-foreground font-light">
              Project Genesis is an open artificial life research system. The simulation engine models
              genetics, physiology, innate reflexes, emotion systems, cognitive planning, and episodic
              memory in autonomous agents navigating dynamic procedurally-generated worlds. We built Genesis because evolutionary history is a single path, but to understand why it took that path, we must observe the millions of histories that could have been.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/archive" className="btn-genesis no-underline">View Archive</Link>
              <Link to="/docs/architecture" className="btn-genesis no-underline" style={{ borderColor: "oklch(1 0 0 / 0.15)" }}>
                Read Architecture
              </Link>
            </div>
          </div>
          <div className="md:col-span-6 grid grid-cols-2 gap-px bg-white/5">
            {[
              ["Engine Version", `v${engineVersion}`],
              ["Biomes", "9 (Whittaker Matrix)"],
              ["Agent Genotype", "14 Genes"],
              ["Map Layers per Run", "8"],
              ["Ingestion Validator", "4-Tier Zod"],
              ["Archive Format", "ZIP + Supabase"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink p-6">
                <p className="eyebrow text-[0.6rem]">{k}</p>
                <p className="mt-2 font-display text-xl text-bone">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FINAL INVITATION CTA SECTION */}
      <Section id="cta" className="text-center bg-[radial-gradient(circle_at_center,oklch(0.78_0.11_195_/_0.04),transparent_70%)] border-t border-white/5 py-32">
        <div className="max-w-3xl mx-auto">
          <Hexagon className="h-10 w-10 text-teal mx-auto mb-8 animate-pulse-soft" strokeWidth={1} />
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-bone tracking-tight leading-tight">Explore the Archive</h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Browse complete simulation timelines, analyze genetic drift vectors, and download raw telemetry datasets.
          </p>
          <div className="mt-10 flex justify-center">
            <Link to="/archive" className="btn-genesis group relative text-[0.75rem] py-3 px-6 uppercase tracking-wider no-underline inline-flex items-center gap-2">
              <span className="relative z-10">Browse Experiments</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <Hexagon className="h-4 w-4 text-teal" strokeWidth={1.2} />
              <p className="font-display text-2xl text-bone">Genesis</p>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Understanding emergent intelligence through reproducible computational civilizations.
            </p>
            <p className="mt-4 font-mono-tight text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground/50">
              Built by Vinay Khosya
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 font-mono-tight text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground md:grid-cols-4">
            <a href="#archive" className="hover:text-teal transition-colors">Archive</a>
            <a href="#evidence" className="hover:text-teal transition-colors">Artifacts</a>
            <a href="#questions" className="hover:text-teal transition-colors">Research</a>
            <a href="#about" className="hover:text-teal transition-colors">About</a>
          </div>
          <p className="font-mono-tight text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground/60">
            Engine v{engineVersion} · Schema v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}

function TopNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-ink/70 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#what" className="flex items-center gap-2.5">
          <Hexagon className="h-3.5 w-3.5 text-teal" strokeWidth={1.3} />
          <span className="font-display text-lg text-bone">Genesis</span>
        </a>
        <div className="hidden items-center gap-10 font-mono-tight text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground md:flex">
          <a href="#what" className="hover:text-bone transition-colors">Premise</a>
          <a href="#how" className="hover:text-bone transition-colors">Pipeline</a>
          <a href="#archive" className="hover:text-bone transition-colors">Archive</a>
          <a href="#evidence" className="hover:text-bone transition-colors">Artifacts</a>
          <a href="#questions" className="hover:text-bone transition-colors">Research</a>
        </div>
        <Link to="/archive" className="hidden md:inline-flex font-mono-tight text-[0.7rem] uppercase tracking-[0.28em] text-teal no-underline">
          View Archive <ArrowUpRight className="ml-1.5 inline h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>
    </nav>
  );
}

// -------------------------------------------------------
// PAGE
// -------------------------------------------------------
function GenesisLanding() {
  const civilizations = Route.useLoaderData();
  const [entered, setEntered] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  const enter = () => {
    setEntered(true);
    setTimeout(() => {
      portalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <main className="relative">
      {/* Live Running Research Banner at the top */}
      <div className="w-full bg-ink border-b border-teal/10 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.62rem] tracking-[0.2em] text-muted-foreground font-mono-tight uppercase z-50 relative bg-black/40">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-soft" />
          <span>Live Research Feed: Node-01 "Infinite Scarcity" series active</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Processing Step 05</span>
          <span className="text-teal font-semibold">Tick: 3,421,984</span>
          <span className="hidden md:inline">Seed: #65654</span>
        </div>
      </div>

      <Hero onEnter={enter} />
      {/* Spacer so the fixed hero has scroll runway for the cinematic zoom */}
      <div style={{ height: entered ? "100vh" : "140vh" }} aria-hidden />
      <div ref={portalRef}>
        <Portal civilizations={civilizations} />
      </div>
    </main>
  );
}
