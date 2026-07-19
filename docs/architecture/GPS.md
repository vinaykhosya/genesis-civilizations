# Genesis Product Specification (GPS)
## Version 1.0 — Identity, Philosophy & Experience

**Project:** Project Genesis — Agentic Artificial Life & Evolutionary Biology Simulator
**Researcher:** Vinay Khosya
**Document Role:** Vision, identity, user experience, and storytelling layer
**Companion Documents:** GDS (Design System) · GES (Engineering) · GCR (Content & Research)
**Status:** Living document — update as Genesis evolves

---

> *"I thought I was building a simulation. I was building a world."*
> — Genesis Lab Notebook, Phase 4

---

## Part I — What Genesis Actually Is

### 1.1 The Wrong Answer

Genesis is not a dashboard.

It is not a scientific visualization tool.

It is not a portfolio project.

It is not a game.

These are all things it resembles. None of them is what it is.

### 1.2 The Right Answer

Genesis is a **scientific instrument for studying how life shapes itself under pressure**.

It generates physically realistic worlds — with mountains that cast rain shadows, rivers that carve valleys, biomes that emerge from temperature and rainfall — and places small minds inside them. Those minds have hunger, fear, grief, and memory. They form families. They build shelter. They fight over territory. They die.

None of this is scripted.

The world doesn't know it's a simulation. The agents don't know they're being watched. The outcomes are **real** in the only sense that matters: they were not designed in advance.

Every experiment Genesis runs is a question asked of physics, biology, and cognition simultaneously.

The website is where those answers are published.

### 1.3 Why This Matters

Every artificial life simulator before Genesis made the same mistake.

They gave agents a uniform world and watched them evolve.

But geography is not noise. A mountain range creates a rain shadow. A rain shadow creates a desert. A desert means no fresh water. No fresh water means agents die of thirst, not old age.

The landscape is not a setting. It is an **independent variable**.

Genesis is the first artificial life system built around this insight from the first line of code. The physical world does most of the selection work. Cognition determines *who* survives, *where* they settle, and *how* they die — not whether they die.

---

## Part II — Mission, Vision, and Principles

### 2.1 Mission

> To make emergent artificial life research transparent, reproducible, and human.

Not just publishable.
Not just rigorous.
**Human.**

Because behind every population collapse is a geography that made survival impossible. Behind every unexpected cooperation is a drive system that created trust under pressure. Behind every extinction is a chain of decisions made by creatures with real needs.

The website makes those chains visible.

### 2.2 Vision

Five years from now:

Genesis is a recognized research platform cited in academic papers on artificial life, evolutionary biology, and cognitive science.

Every experiment run locally becomes a published scientific result — with a permanent URL, a searchable archive, and a replay anyone can watch.

The Portal hosts hundreds of experiments, dozens of discoveries, and a growing community of researchers who run Genesis on their own machines and submit results.

The Living Timeline documents every scientific milestone from the first random walker to the first emergent civilization.

### 2.3 Six Design Principles

These govern every design decision, visual or structural.

| Principle | What It Means |
|---|---|
| **Experience before dashboard** | The first emotion a visitor feels is wonder, not orientation. |
| **Evidence before narrative** | Every claim is grounded in telemetry. No anthropomorphism without data. |
| **Story before charts** | Charts are evidence for a story. Never the story itself. |
| **Identity before interface** | Words, labels, and names create a world. Use them intentionally. |
| **Accumulation over recency** | The site grows richer as more experiments are published. Old experiments do not expire. |
| **Long-term over convenient** | Every architectural choice assumes Genesis exists for ten years. |

---

## Part III — Genesis Visual Vocabulary

This is the most important section in this document.

Every word matters. Every label is a choice. The wrong word makes a research portal. The right word makes a world.

### 3.1 The Genesis Lexicon

| Generic Word | Genesis Word | Why |
|---|---|---|
| Dashboard | **Laboratory** | A place where experiments happen, not where metrics live |
| Analytics | **Observatory** | You observe phenomena, you don't analyze dashboards |
| Experiments | **Civilizations** (archive view) | Each experiment is a civilization that lived and ended |
| Blog | **Field Notes** | Informal, personal, in-the-moment |
| Posts | **Research Logs** | Structured, evidence-based entries |
| About | **Origin** | The story of how Genesis came to exist |
| Contact | **Collaborate** | Forward-looking, not transactional |
| Upload | **Publish** | Elevates the act of sharing an experiment |
| Tags | **Conditions** | Because experiment conditions are scientific variables, not tags |
| Admin | **Command** | Internal-facing only. Never shown to public. |
| Search | **Query** | Matches the scientific register |

### 3.2 Naming Conventions for Pages

| URL | Page Title Shown to User |
|---|---|
| `/` | Genesis |
| `/civilizations` | Archive of Civilizations |
| `/civilizations/[id]` | [Experiment Title] — A Genesis Civilization |
| `/civilizations/[id]/observatory` | Observatory |
| `/civilizations/[id]/replay` | Replay |
| `/civilizations/[id]/chronicle` | Chronicle (was: Timeline) |
| `/civilizations/[id]/world` | World |
| `/civilizations/[id]/lineage` | Lineage (was: Agents) |
| `/civilizations/[id]/genome` | Genome Archive (was: Genes) |
| `/civilizations/[id]/config` | Conditions |
| `/research` | Research |
| `/research/field-notes` | Field Notes |
| `/research/monograph` | Monograph |
| `/research/architecture` | Architecture |
| `/research/thesis` | Thesis |
| `/timeline` | Genesis Timeline |
| `/origin` | Origin |
| `/collaborate` | Collaborate |
| `/docs` | Reference |

> [!IMPORTANT]
> The word "Civilizations" is bold and intentional. It is not hyperbole. Each Genesis experiment creates a population that builds shelter, forms social bonds, produces children, and dies — in a world shaped by real physical laws. Calling them "experiments" on the public archive understates what they are.

### 3.3 Micro-copy Standards

These small words appear everywhere. They must be consistent.

**Ticks:** Always convert to human-readable scale. Show both.
- ✓ `7,970 ticks (22 years)`
- ✗ `7970`

**Scarcity:** Show both number and label.
- ✓ `Scarcity ×5 — Extreme`
- ✗ `scarcity: 5`

**Survivors:** Show fraction, not just number.
- ✓ `0 of 18 survived`
- ✗ `0 survivors`

**Colony status:** Active / Extinct (not alive/dead)
- ✓ `Colony Alpha — Extinct at Year 22`
- ✗ `Alpha dead`

**Events:** Use past tense, passive construction where possible.
- ✓ `Child #16 was born to Colony Alpha — Year 0, Day 108`
- ✗ `Birth event: agent 16`

---

## Part IV — The Landing Page Experience

### 4.1 Philosophy

The first 8 seconds a visitor spends on genesis.vinaykhosya.com must answer one question before they read a single word:

**"What am I looking at?"**

The answer is: a world.

Not a dashboard. Not a chart. A world that formed, was inhabited, and ended.

The landing page animation tells that story in silence. The words that follow explain what Genesis is. The CTA invites the visitor to explore.

### 4.2 The Opening Animation (Full Specification)

**Duration:** 12 seconds. Loops after 3-second pause.
**Rendering:** Canvas2D or Three.js (see GES §5 for technical decision).
**Audio:** None. This must work on muted browsers.

```
TIME    EVENT
────────────────────────────────────────────────────────────

0.0s    Black screen. Complete darkness.

0.3s    Stars begin to appear — slow fade, 300 particles,
        three depth layers (parallax on mouse move).
        Stars are not uniform — they cluster, like real sky.

1.5s    A faint planetary silhouette emerges from dark.
        The planet is dark grey — no life yet.
        Slow rotation begins (1°/sec clockwise).

2.5s    TERRAIN EMERGES.
        Contour lines trace the land — mountain ridges
        appear first, then coasts, then valleys.
        The animation matches the actual Genesis
        world generation pipeline:
          Ridge → Erosion → Coast → Rivers.
        Color: dark charcoal, like compressed stone.

3.5s    RAINFALL BEGINS.
        Particle rain falls from sky.
        Where rain hits mountains, it collects.
        Rivers trace their paths from highlands to sea —
        animated as growing lines, following actual hydrology.

4.5s    BIOMES BLOOM.
        Color spreads across terrain from moisture.
        Desert stays pale. Rainforest becomes deep green.
        Taiga darkens. Coast turns teal.
        This is not a color wash — it sweeps naturally
        from high-rainfall regions outward.

5.5s    DOTS APPEAR.
        Four small clusters of 4 dots each appear
        at four colony locations.
        They are motionless for 0.5 seconds.

6.0s    DOTS MOVE.
        Agents begin exploring. Clusters spread.
        Paths radiate outward from home territories.
        Some dots converge on rivers. Some reach mountains.
        Some disappear (deaths — blink out with red flash).

7.5s    CONFLICT.
        Two colony groups converge. Brief flash
        (red scatter) where they meet.
        Some dots blink out.

8.5s    CONTRACTION.
        Most dots gone. A few remain, scattered.
        The world is mostly empty.

9.5s    SILENCE.
        Last dot blinks out.
        The terrain remains — unchanged, indifferent.
        The rivers still flow.

10.5s   FADE TO DARK.
        Slow black fade over 1 second.
        The world disappears.

11.0s   TEXT APPEARS.
        Fade in, centered:

          "Every civilization began with the same world."
          "None ended the same."

        Font: Space Grotesk, 24px, weight 300, letter-spacing 0.04em
        Color: hsl(220, 20%, 78%)

11.8s   CTA APPEARS.
        Button fades in below text:

          [ Experience Genesis → ]

        Teal, pill-shaped, subtle pulse animation.

12.0s   Pause. Loop restarts.
```

### 4.3 Homepage Scroll Structure

After the hero animation, scrolling reveals the following sections in order:

```
─── SECTION 1: WHAT IS GENESIS? ────────────────────────────

Short. Direct. 3 sentences.

"Genesis is an artificial life simulator that builds
physically realistic worlds — with mountains, rivers,
and climate — and places autonomous agents inside them.

They survive. They evolve. They build shelter and form bonds.
None of it is scripted.

The outcomes emerge from the world itself."

[Read the Origin Story →]  [Browse the Archive →]

─── SECTION 2: FEATURED CIVILIZATION ───────────────────────

Full-width card. The single most interesting experiment
published to date. Manually selected by researcher.

Left: World map thumbnail (animated on hover — layers cycle)
Right: Title, abstract excerpt, key findings as metric chips

[ View This Civilization → ]

─── SECTION 3: LATEST DISCOVERY ─────────────────────────────

The most recent notable finding from any experiment.
Written as a research insight, not a metric.

Example:
  "In a world with extreme scarcity (×5), Colony Alpha
  outlasted three competing colonies by a margin of
  nearly 4,000 ticks — despite the same starting genome.
  Geography, not genetics, determined the survivor."

[ Read the Full Analysis → ]

─── SECTION 4: THE LIVING TIMELINE ─────────────────────────

Horizontal scrollable strip (mobile: vertical).
Shows Genesis development milestones.
See §V for full specification.

─── SECTION 5: ARCHIVE OF CIVILIZATIONS ────────────────────

Grid of experiment cards, latest first.
Filters: World Preset | Scarcity | Date | Duration
[View Full Archive →]

─── SECTION 6: RESEARCH AREAS ──────────────────────────────

3-column grid of research themes:

Evolutionary Biology     |  Cognitive Architecture  |  Landscape Ecology
"How do genes drift      |  "Do agents who plan     |  "Does geography
under resource scarcity? |   survive longer than    |   determine which
Do landscape features    |   those who react?"      |   genes win?"
drive selection?"        |

─── SECTION 7: DOCUMENTATION ───────────────────────────────

Links to: Reference, Architecture, Schema, Config Guide

─── SECTION 8: ABOUT & ORIGIN ───────────────────────────────

Brief. A photo or avatar, 2 paragraphs, link to full Origin page.

─── FOOTER ──────────────────────────────────────────────────

Genesis · Phase 9A · Built by Vinay Khosya
GitHub  ·  Collaborate  ·  Reference  ·  Archive

```

---

## Part V — The Living Timeline

### 5.1 Purpose

The Genesis Timeline is a single chronological page that documents every significant milestone in Genesis's development — not the website's development, but the **science** itself.

It is to Genesis what a changelog is to software — except it records discoveries, not features.

### 5.2 Structure

Each entry contains:

```
[Phase badge]  [Date]

[Milestone Title]

[2–3 sentence description — evidence-first]

[Optional: link to experiment that produced this milestone]
```

### 5.3 Current Timeline Entries (Seed Content)

The following entries come directly from the lab notebook and monograph. They are the **real history of Genesis**.

| Phase | Date | Milestone | Description |
|---|---|---|---|
| 0 | 2026 Jan | **First World Generated** | A 64×64 grid with fBm noise and random food. Agents walked into the ocean. |
| 1 | 2026 Feb | **Rain Shadow Discovered** | Wind moisture advection clamped to sea level, producing the first realistic rain shadow effect. Deserts appeared on the leeward side of mountains. |
| 1 | 2026 Feb | **Priority-Flood Hydrology** | Rivers connected. For the first time, the world felt real — water found the sea. |
| 2 | 2026 Feb | **First Utility Engine** | Agents evaluated multiple needs simultaneously. The over-optimizer was replaced. |
| 3 | 2026 Mar | **14-Gene Genome Introduced** | Genotype separated from phenotype. Genes express into brain parameters, not behaviors. |
| 3 | 2026 Mar | **Genetic Drift Bottleneck** | Within 200 ticks, all agents became genetically identical. Geography had eliminated diversity faster than mutation could restore it. |
| 4 | 2026 Mar | **Spatial Memory** | Agents remembered where water and food were. Re-exploration dropped. Survival improved. |
| 4 | 2026 Apr | **Episodic Memory Cap** | Memory clutter caused 14× slowdown. Rolling FIFO cap and confidence decay introduced. |
| 5 | 2026 Apr | **Emotional Dynamics (Phase 8.2)** | Drives produce emotional pressure. Emotions modulate utility. Behavior emerges. |
| 5 | 2026 Apr | **The Oscillation Bug** | Agents without emotional inertia spun in circles at 180° every tick. EMA smoothing introduced. |
| 5 | 2026 Apr | **Grief — Emergent, Unscripted** | After mates died, agents stood still for 20–30 ticks due to longing drive elevation. This was never programmed. |
| 6 | 2026 Apr | **Colony System (Phase 5)** | Four geographically distinct colonies. Each with its own founder lineage, territory, and color. |
| 6 | 2026 Apr | **Lateral Inhibition** | Motivational deadlock (fight vs. flee) resolved by biological winner-take-all suppression. |
| 7 | 2026 May | **Neural Predictor Introduced** | Agents predict expected utility before acting. Sleep-based consolidation prevents gradient explosion. |
| 7 | 2026 May | **The Cognitive Ablation Paradox** | Full cognition vs. ablated cognition showed no survival count difference — but completely different spatial distribution. The question "does cognition help?" was the wrong question. |
| 8 | 2026 Jun | **Reflex Layer** | Emergency responses bypass the planner entirely. Dehydration deaths beside rivers dropped significantly. |
| 8 | 2026 Jun | **Shelter System** | Four shelter tiers: None, Tent, Cabin, Stone. Agents construct and claim shelter. |
| 8 | 2026 Jun | **Territorial Combat (v5)** | Threat display → confidence comparison → fear cooldown. Dispute frequency reduced by 78%. |
| 9A | 2026 Jul | **Full Checkpoint I/O** | Simulations can be paused, saved (~15MB), and resumed with full state restored. |
| 9D | 2026 Jul | **Evolution Journal** | Auto-generated scientific journal records genetic drift, cognitive adaptation, and population dynamics every 100 years. |

### 5.4 Timeline Page Visual Design

- Vertical scrolling timeline with a central spine line
- Phase badge on the left (pill: "Phase 1", "Phase 8.2", etc.) colored by phase era
- Milestone title, description, and optional experiment link on the right
- Subtle scroll animation: entries fade in from below as you scroll
- At the bottom: "Next milestone: [current active research question]"

---

## Part VI — The Civilization Page (Storytelling Structure)

### 6.1 The Wrong Structure

Most dashboards organize experiment pages as:

```
Overview → Charts → Data → Download
```

This is a metrics-first structure. It tells you what happened but not what it means.

### 6.2 The Genesis Structure

Genesis experiment pages are organized as a **research narrative**:

```
1. THE QUESTION
   What was this experiment designed to investigate?
   "Can territorial conflicts, in a world with extreme scarcity,
   sustain a population long enough to reach genetic selection?"

2. THE HYPOTHESIS
   What did we expect?
   "We expected aggression-high colonies to dominate early but
   collapse due to injury-driven mortality."

3. THE CONDITIONS
   What parameters were set?
   [Config viewer — all key settings shown as human-readable chips]
   Seed 65654 · Island Chains · Scarcity ×5 · Disputes Enabled ·
   Instant Healing · Colony Spawning

4. THE WORLD
   [Interactive world map — biome, elevation, rivers, resource layers]
   Causal explainer available on hover.

5. THE REPLAY
   [Canvas replay with controls]
   Default: starts at tick 0. Timeline seekable.

6. THE CHRONICLE
   [Scrollable events timeline]
   Birth · Death · Milestone · Disaster · Dispute · Extinction

7. KEY OBSERVATIONS
   Researcher-written. 3–7 bullet points.
   Evidence-first. Hedged where uncertain.
   "Colony Alpha survived longest (7,970 ticks) despite
   identical starting conditions to Beta, Gamma, and Delta.
   Geographic analysis suggests Alpha's spawn location near
   a temperate river delta provided superior water access."

8. UNEXPECTED EVENTS
   Auto-extracted from events.json — events tagged "Unexpected"
   or manually highlighted by researcher during publish.
   "Agent #16, born Gen 1, was the only second-generation agent
   to reach adulthood — and died within 300 ticks of birth."

9. RESEARCHER'S NOTES
   Optional. Free-form markdown. Personal voice allowed here.
   This is the Field Notes section.

10. TELEMETRY (OBSERVATORY)
    All charts. Population, genetics, drives, telemetry funnels.
    Expandable sections. Not shown by default — click to expand.

11. DOWNLOADS
    config.json · summary.json · replay.json · report.md
    Full zip archive
    Citation format

12. SIMILAR CIVILIZATIONS
    3 experiment cards with similar conditions for comparison.
```

---

## Part VII — Long-Term Vision

### 7.1 This is a Flagship, Not a Side Project

Genesis is not a semester project. It is not a demo. It is a system that will grow for years.

Every architectural decision must assume:
- 500+ experiments in the archive
- Multiple researchers running Genesis independently
- Academic citations from external papers
- A public API consumed by third-party tools
- Community-submitted experiments from external researchers

The portal must be built to accommodate all of this, even if most pages remain empty for months.

### 7.2 Reserved Pages (Build Shell Now, Fill Later)

These pages should exist as shells from day one — beautiful empty states, not 404s:

| Page | Purpose | Empty State |
|---|---|---|
| `/publications` | Academic papers that cite or use Genesis | "No publications yet. Genesis is actively being prepared for submission." |
| `/datasets` | Downloadable experiment datasets in standard formats | "Datasets will be published as experiments are completed." |
| `/benchmark` | Genesis as an AI benchmark suite | "Genesis Benchmark is in early design. Follow for updates." |
| `/collaborate` | Contact for research collaboration | Simple form. Always live. |
| `/api` | Public API documentation | "Public API coming in 2026. Subscribe to be notified." |
| `/community` | Community experiment submissions | "Community submissions open when Genesis reaches Phase 10." |
| `/version-history` | Genesis engine version changelog | Always populated — links to lab notebook entries. |
| `/citations` | How to cite Genesis in academic work | BibTeX block, DOI (if archived), citation guidance. |

### 7.3 The Long-Term Product Map

```
Phase 1 — Foundation (Build Now)
  ✓ Admin upload pipeline
  ✓ Civilization detail pages
  ✓ Archive
  ✓ Research documents
  ✓ Living Timeline

Phase 2 — Experience (Next Quarter)
  ○ Landing animation (full implementation)
  ○ Replay canvas (full implementation)
  ○ World map (layered canvas)
  ○ Lineage tree

Phase 3 — Science (Following Quarter)
  ○ Civilization comparison
  ○ Gene drift visualizer
  ○ Telemetry funnel viewer
  ○ Causal explainer integration

Phase 4 — Community (When Stable)
  ○ Community experiment submissions
  ○ Benchmark dataset downloads
  ○ Public API v1
  ○ Citation infrastructure

Phase 5 — Academic (Long-term)
  ○ Publications section
  ○ DOI integration
  ○ Peer review workflow
  ○ External researcher accounts
```

---

## Part VIII — User Journeys

### 8.1 The Curious Newcomer

Maria is a biology PhD student who found Genesis through a Twitter thread about emergent behavior.

She arrives at the landing page.

The animation plays. She watches the world form, the dots appear, spread, conflict, and disappear. She doesn't know what she's watching — but she feels something.

She clicks "Experience Genesis."

She lands on the Archive. She sees 14 experiment cards. One is featured: **"Territorial Conflict Under Extreme Scarcity — Colony Alpha Survived 22 Years."**

She clicks it.

She reads the Question. She reads the Hypothesis. She watches the Replay for 2 minutes.

She clicks to the Chronicle and reads the birth and death events in order.

She finds the Unexpected Events section:
*"Agent #16, the only Gen-1 agent to reach adulthood, was the last non-Alpha to die."*

She opens the Observatory. She looks at the reproduction funnel — 14 stages, 0 births in the last 4,000 ticks.

She understands what happened without reading a single scientific paper.

She bookmarks the page.

**Journey time:** 12 minutes. Zero confusion. No documentation read.

### 8.2 The AI Engineer

Alex is building his own agent system and searching for references on emergent cognition. He finds the Genesis architecture paper through Google Scholar.

He arrives at `/research/architecture`.

He reads the architecture. He follows links to the engineering spec.

He finds the experiment schema reference at `/docs/schema`. He downloads `experiment_schema.json`.

He wants to understand how the neural predictor works. He navigates to `/civilizations/EXP-20260627-3N39/observatory` and looks at the prediction error chart.

He reads the lab notebook entry on the cognitive ablation paradox.

He cites Genesis in his paper.

### 8.3 Vinay (The Admin)

Vinay finishes a 2-hour experiment run. The files are in `/experiments/2026-07-14_10-20-00_climate_volatility_test/`.

He goes to `/admin/upload`.

He drags the experiment folder (or zip) onto the drop zone.

Validation passes in 3 seconds.

A preview renders: the system auto-extracted the title, suggested three tags, and populated all metric cards from `summary.json`.

Vinay writes a 150-word abstract describing the question and key finding.

He clicks "Publish."

The civilization appears immediately at its permanent URL.

**Total time from finished experiment to published result:** Under 90 seconds.

---

## Part IX — Tone of Voice

### 9.1 The Genesis Voice

Genesis speaks like a field researcher who has spent months alone in a simulation and come back with something real to report.

**Precise.** Not vague. Not hedged to the point of meaninglessness.
**Curious.** Not conclusive. Not overconfident.
**Personal.** Not corporate. Not institutional.
**Understated.** Let the data be dramatic. The prose does not need to be.

### 9.2 Voice Examples

| Bad (Dashboard Voice) | Good (Genesis Voice) |
|---|---|
| "Experiment results show high mortality rates." | "All 18 agents died within 7,970 ticks. None survived." |
| "Colony performance metrics indicate Alpha dominance." | "Colony Alpha outlasted the others by 4,000 ticks. Geography, not genetics, likely explains this." |
| "Simulation parameters were configured for hostile conditions." | "Scarcity was set to ×5 — five times the normal resource density. Most agents died of thirst." |
| "Users can explore agent behavior data." | "Watch Agent #3 walk into a river cell and die of dehydration. The planner was committed to a 14-tick path. It never interrupted." |

### 9.3 What to Avoid

- **Anthropomorphism without data:** Never say agents "decided" or "felt" without telemetry evidence.
- **Hype language:** "Revolutionary," "unprecedented," "game-changing." Genesis doesn't need these words.
- **Passive hedging:** "Results may suggest..." — Be direct. If the data is ambiguous, say it's ambiguous and say why.
- **Corporate plural:** "We believe..." — Genesis is Vinay's project. "I" is allowed and appropriate in Field Notes.

---

*End of GPS v1.0*

---
**Document produced by Antigravity AI, July 2026**
**Companion: GDS · GES · GCR**
