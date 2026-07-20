# Genesis Content & Research Guide (GCR)
## Version 1.0 — Writing, Publishing & Research Communication

**Project:** Project Genesis — Agentic Artificial Life & Evolutionary Biology Simulator
**Document Role:** Writing standards, experiment publication workflow, SEO, naming conventions
**Companion Documents:** GPS (Product) · GDS (Design System) · GES (Engineering)
**Status:** Living document — update as new experiment types are published

---

> "The best scientific writing is the kind that makes you forget you're reading science."

---

## Part I — The Genesis Writing Standard

### 1.1 The Core Principle

Every sentence on the Genesis portal should be able to answer the question:

**"What happened, and why do we think that?"**

Not: "What might have happened."
Not: "What was expected."
Not: "What would be interesting if it happened."

Evidence first. Interpretation second. Uncertainty labeled explicitly.

### 1.2 The Three Layers of Writing on Genesis

**Layer 1 — Auto-generated (from simulation files)**
Metric cards, chart data, event descriptions. These are never written by hand. The simulation engine produces them. The portal displays them.

**Layer 2 — Researcher-written (evidence-based)**
Abstracts, Key Observations, Unexpected Events callouts. These follow strict evidence-first standards. Every claim must cite a specific metric or event.

**Layer 3 — Personal voice (Field Notes only)**
The Field Notes section of any civilization page. The lab notebook. Here, personal voice is allowed — even preferred. This is where the researcher documents what surprised them, what they didn't expect, what questions arose.

### 1.3 Forbidden Phrases

These phrases are banned from all Layer 1 and Layer 2 writing:

| Banned Phrase | Why | Alternative |
|---|---|---|
| "agents decided" | Implies deliberate consciousness | "agents selected", "selection pressure favored" |
| "agents felt" | Implies subjective experience | "agents exhibited [behavior]", "[drive] was elevated" |
| "agents wanted" | Same as above | "the [drive] drive was high", "utility of [action] was highest" |
| "surprisingly" | Unspecific | State what was expected and what occurred |
| "clearly shows" | Overconfident | "is consistent with", "suggests" |
| "proves" | Overclaiming | "provides evidence for", "is consistent with the hypothesis that" |
| "randomly" | Almost never literally random | "without consistent pattern", "across all tested seeds" |
| "the simulation thinks" | Category error | Omit entirely |

### 1.4 Required Hedges

These phrases must appear where appropriate:

- "This is consistent with..." (not "This proves...")
- "Analytical confidence: [High/Medium/Low] (based on...)" in formal research logs
- "Observed in [N] of [M] runs" when citing behavioral tendencies
- "At current simulation scale (N ≤ 200 agents)" when population size limits interpretation

### 1.5 Good vs. Bad Examples

**Abstract opening:**

❌ Bad:
> "This experiment explored what happens when agents fight each other in a world with scarce resources."

✓ Good:
> "This experiment introduced territorial disputes (disputes_enabled: true) into a world with extreme resource scarcity (scarcity ×5, seed 65654, island_chains preset) to isolate the selection pressure created by conflict. All 18 founding agents died within 7,970 ticks (22 simulation-years). Colony Alpha's longevity exceeded all others by a margin of 3,970 ticks — a gap unexplained by genetic differences alone."

**Key Observation:**

❌ Bad:
> "Colony Alpha survived longer because it had better genes."

✓ Good:
> "Colony Alpha survived 7,970 ticks. Genetic diversity across all colonies at founding was effectively zero (avg_genetic_diversity: 0.0). Alpha's survival advantage is therefore not attributable to genetic superiority. Geographic analysis of Alpha's spawn location (cell 511, 479) shows proximity to a temperate river delta and forested highland — consistent with superior water access and shelter resource availability."

**Unexpected Event:**

❌ Bad:
> "One agent survived longer than expected."

✓ Good:
> "Agent #16, the only Gen-1 individual born in this run, reached adulthood but died within 300 ticks. With no Gen-2 agents following, the lineage's reach into generational depth ended at Gen 1 despite non-zero reproduction occurring. Cause: avg_cooperation_score was 0.0 throughout — no resource sharing occurred even between colony-mates."

---

## Part II — Experiment Publication Workflow

### 2.1 The Publication Decision

Not every experiment run needs to be published. Publish an experiment when:

- It tests a specific hypothesis (even if the result was null)
- Something unexpected happened that warrants documentation
- It represents a new configuration not previously published
- It is a reference run (e.g., baseline conditions for comparison)

Do not publish experiments that:
- Were debugging runs with broken configurations
- Were stopped in the first 500 ticks due to setup errors
- Are duplicates of already-published runs with identical conditions and nearly identical outcomes (unless the difference is itself interesting)

### 2.2 Pre-Upload Checklist

Before uploading to the admin panel, verify:

```
□ Experiment has a clear question in your mind
□ experiment_name in run_test.py is descriptive (not "test_run_3")
□ config.json was saved correctly (check checkpoint_5000.json exists)
□ summary.json exists and has non-null derived_metrics
□ events.json has at least 10 events
□ world.png exists (visual confirmation the map was generated)
□ The experiment ran to at least 1,000 ticks (not a crash at tick 50)
```

### 2.3 The Abstract Template

Fill in the following structure when writing the abstract. This produces consistently useful scientific descriptions.

```markdown
## Abstract Template

**Context:**
This experiment [tested / investigated / varied] [parameter or condition]
in a [world_preset] world (seed [N], scarcity ×[S]).

**Setup:**
[N] founding agents were spawned across [M] colonies. 
Key experimental conditions: [list 2–3 key config flags that differ from default].

**Primary Result:**
[Outcome in 1–2 sentences — survivor count, max generation, 
colony longevity, key metric value].

**Notable Finding:**
[The most interesting thing that happened — reference a specific
event, metric, or emergent behavior].

**Open Question Raised:**
[What this experiment makes you want to test next].
```

**Example — filled in:**

```
Context:
This experiment introduced instantaneous healing (healing_speed_mult: 2.0)
alongside territorial disputes in an island_chains world (seed 65654, scarcity ×5).

Setup:
18 founding agents were spawned across 4 colonies (Alpha, Beta, Gamma, Delta).
Key conditions: disputes_enabled, instant healing, no pre-existing relationship trust.

Primary Result:
All 18 agents died within 7,970 ticks (22 simulation-years). No agents survived.
Colony Alpha lasted longest (7,970 ticks); Colony Delta collapsed after 1,700 ticks.

Notable Finding:
avg_conflict_score reached 29.99 across the population — the highest recorded in
any Genesis run to date — while avg_cooperation_score remained 0.0. This is
consistent with a purely competitive equilibrium under resource scarcity.

Open Question Raised:
Does higher healing speed increase or decrease colony longevity under conflict?
This run suggests it may not help survival if resource pressure is the binding
constraint.
```

### 2.4 Tag Selection Guide

When tagging an experiment, choose from the following controlled vocabulary:

**World Preset tags:**
`island_chains`, `arid_continent`, `green_continent`, `boreal_highlands`, `tropical_ring`, `random_world`

**Scarcity level tags:**
`scarcity_extreme` (×4+), `scarcity_high` (×2–4), `scarcity_normal` (×1), `scarcity_abundant` (<×1)

**Feature tags:**
`disputes_enabled`, `disputes_disabled`, `instant_healing`, `reproduction_disabled`,
`disasters_enabled`, `disasters_disabled`, `cognition_ablated`, `planner_disabled`,
`colony_spawning`, `climate_slow_change`, `climate_rapid_change`, `climate_stable`

**Outcome tags:**
`total_extinction`, `partial_survival`, `multi_generational`, `single_generation`

**Research area tags:**
`evolutionary_biology`, `landscape_ecology`, `cognitive_architecture`,
`social_dynamics`, `territorial_behavior`, `reproduction_dynamics`, `water_ecology`

---

## Part III — Field Notes vs. Research Logs

### 3.1 When to Write a Research Log

A **Research Log** is a structured, evidence-first entry attached to a specific experiment. It lives on the civilization page. It is written in Layer 2 voice (formal, hedged, no personal pronoun).

**Trigger:** Write a research log when you have a specific hypothesis and testable prediction.

**Format:**
```markdown
# Research Log: [Experiment ID]

**Question:** [Specific research question]

**Hypothesis:** [Testable prediction with direction and mechanism]
Example: "We predict that aggression_enabled colonies will show higher
mortality in the first 200 ticks due to injury events, but higher
population density after tick 500 if territorial defense reduces competition."

**Method:** [Experimental design — what was varied, what was controlled]

**Observations:**
1. [Evidence point 1 — metric reference]
2. [Evidence point 2]
3. [Evidence point 3]

**Interpretation:**
[1–2 paragraphs, hedged, evidence-grounded]

**Confidence:** High / Medium / Low
**Basis:** [Why that confidence level]

**Next Step:** [What experiment this suggests running]
```

### 3.2 When to Write a Field Note

A **Field Note** is a personal, informal observation from a single run. It lives in the `/research/field-notes/` section and is tagged by date. Personal voice, first person, allowed to be speculative.

**Trigger:** Write a field note when something surprised you — when you stopped the simulation and said "huh."

**Examples from existing lab notebook (already written, publish these):**

> *"The Oscillation Bug: Agents without emotional inertia spun in circles at 180° every tick. Watching it in the visualizer was genuinely unsettling. The fix was EMA smoothing — but the lesson was that emotions without inertia produce pathological behavior. Real nervous systems have habituation for exactly this reason."*

> *"Grief was not planned. After a mate died, an agent stood still for 20–30 ticks. Looking at the drives data, longing was elevated and boredom was suppressed. Grief emerged from drive interactions with no grief code anywhere. I left it in."*

> *"In most long runs, population drops sharply around tick 500–700 — often 40–60%. I've started calling it 'The 600-Tick Cliff.' The cause appears to be three pressures converging: first-generation senescence, resource depletion, and territorial friction peaking. It is not programmed."*

These are the most compelling entries on the entire site. Publish them.

---

## Part IV — SEO Architecture

### 4.1 URL Structure

```
genesis.vinaykhosya.com/                               → Home
genesis.vinaykhosya.com/civilizations/                 → Archive
genesis.vinaykhosya.com/civilizations/EXP-20260713-0001/ → Canonical (ID-based)
genesis.vinaykhosya.com/civilizations/territorial-conflict-extreme-scarcity/ → Slug (redirects to canonical)
genesis.vinaykhosya.com/research/monograph/
genesis.vinaykhosya.com/research/field-notes/
genesis.vinaykhosya.com/timeline/
genesis.vinaykhosya.com/docs/schema/
```

**Rule:** Canonical URLs always use the `EXP-YYYYMMDD-XXXX` format. Slug URLs redirect (301) to canonical. This means if you rename an experiment, the old slug still works.

### 4.2 Meta Tag Templates

**Civilization Detail Page:**
```html
<title>{experiment_title} | Genesis — {world_preset} Civilization</title>
<meta name="description" content="{abstract_first_sentence}. {ticks_human}, {survivors_str}. Seed {seed}, {world_preset} world.">
<meta property="og:title" content="{experiment_title} | Genesis">
<meta property="og:description" content="{abstract_first_sentence}">
<meta property="og:image" content="{thumbnail_url}">
<meta property="og:type" content="article">
<meta name="article:published_time" content="{published_at}">
<meta name="article:author" content="Vinay Khosya">
```

**Example:**
```html
<title>Territorial Conflict Under Extreme Scarcity | Genesis — Island Chains Civilization</title>
<meta name="description" content="All 18 agents died within 7,970 ticks (22 years). Colony Alpha survived longest at 7,970 ticks. Seed 65654, Island Chains world, scarcity ×5.">
```

**Archive Page:**
```html
<title>Archive of Civilizations | Genesis</title>
<meta name="description" content="Every civilization Genesis has produced — searchable by world, scarcity, duration, and outcome. {total_count} civilizations published.">
```

**Research Document:**
```html
<title>{document_title} | Genesis Research</title>
<meta name="description" content="{first_paragraph_excerpt, max 155 characters}">
```

### 4.3 JSON-LD Structured Data

Add to every civilization page:

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "{experiment_title}",
  "description": "{abstract}",
  "creator": {
    "@type": "Person",
    "name": "Vinay Khosya",
    "url": "https://vinaykhosya.com"
  },
  "datePublished": "{published_at}",
  "dateModified": "{updated_at}",
  "keywords": {tags as comma-separated string},
  "url": "https://genesis.vinaykhosya.com/civilizations/{id}",
  "encodingFormat": "application/json",
  "distribution": [{
    "@type": "DataDownload",
    "contentUrl": "{zip_download_url}",
    "encodingFormat": "application/zip"
  }]
}
```

For research documents, use `@type: "ScholarlyArticle"` instead of `Dataset`.

### 4.4 Sitemap

Auto-generated at `/sitemap.xml`. Rebuilt on every experiment publish.

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://genesis.vinaykhosya.com/</loc><changefreq>weekly</changefreq></url>
  <url><loc>https://genesis.vinaykhosya.com/civilizations/</loc><changefreq>weekly</changefreq></url>
  <!-- One entry per published experiment -->
  <url>
    <loc>https://genesis.vinaykhosya.com/civilizations/EXP-20260713-0001/</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Research documents -->
  <url><loc>https://genesis.vinaykhosya.com/research/monograph/</loc><changefreq>monthly</changefreq></url>
</urlset>
```

---

## Part V — Image Guidelines

### 5.1 World Thumbnails (`world.png`)

The world thumbnail is the first visual impression of any civilization.

**Requirements:**
- Square format: 512×512 pixels minimum
- Must be generated from the same seed as the experiment
- Must show the biome layer (not elevation, not grayscale)
- Must include the full world (no cropping)

**Generating from run_test.py:**
The simulation automatically saves `world.png` to the experiment folder. This is the canonical thumbnail. Do not replace it with a different visualization.

**Display on portal:**
- Experiment cards: 140px tall, full width, `object-fit: cover`
- Civilization page header: 200px tall, full width, with gradient overlay
- OG image: 1200×630 generated by Vercel OG from world.png + title text overlay

### 5.2 Chart Export Guidelines

When referencing charts in research documents or field notes:

- Charts embedded in markdown documents use the portal's chart components (no external images)
- If a chart is being shared externally (Twitter, LinkedIn), export at 1200×675 (16:9), dark background (`bg-primary`), white text
- Always include: experiment ID, tick range, and the metric name in the chart title
- Never share raw matplotlib charts — they must be re-rendered in the portal's chart system

---

## Part VI — Naming Conventions

### 6.1 Experiment Names (in `run_test.py`)

The `EXPERIMENT_NAME` variable becomes the base for the auto-generated title. Make it descriptive enough to become a good title.

**Format:** `[condition] with [variation], [key parameter]`

```python
# Good
EXPERIMENT_NAME = "territorial disputes enabled, extreme scarcity"
EXPERIMENT_NAME = "cognition ablated, baseline seed"
EXPERIMENT_NAME = "island chains, high mutation rate"
EXPERIMENT_NAME = "climate rapid change, normal scarcity"

# Bad
EXPERIMENT_NAME = "test"
EXPERIMENT_NAME = "run3"
EXPERIMENT_NAME = "fights alowwed with insta heal , new seed"  # Typo, abbreviation
```

**Note:** The portal auto-formats the name to title case and removes redundant words. `"territorial disputes enabled, extreme scarcity"` becomes `"Territorial Disputes Enabled — Extreme Scarcity"`.

### 6.2 Research Document IDs

| Document | ID |
|---|---|
| Monograph | `monograph` |
| Architecture Reference | `architecture` |
| Lab Notebook | `lab-notebook` |
| Research Thesis | `thesis` |
| Field Notes (collection) | `field-notes` |
| Individual Field Note | `field-note-YYYY-MM-DD` |

### 6.3 Experiment ID Format

**Standard:** `EXP-YYYYMMDD-XXXX`

- `EXP-` prefix identifies it as a Genesis experiment
- `YYYYMMDD` is the date the experiment was published (not run)
- `XXXX` is a 4-character hash of the experiment seed + ticks (auto-generated by portal)

**Example:** `EXP-20260713-A3B7`

Existing experiments from `research/` that use the old format (`EXP-20260627-XY81`) should be preserved exactly as-is — do not rename published experiments.

---

## Part VII — The Living Timeline (Seed Content)

The following entries are ready to publish on day one of the portal. They come directly from the lab notebook and are written in the correct evidence-first style.

### 7.1 Complete Seed Timeline

**Phase 0 — Early Conception**
- *Jan 2026* — **First World Generated**: A 64×64 Perlin noise grid. Agents walked randomly and into oceans. Geography had no effect — resources were distributed uniformly, eliminating all geographic selection pressure.

**Phase 1 — Physical World**
- *Feb 2026* — **Rain Shadow Effect**: Clamping terrain height to sea level before wind advection calculations produced the first realistic rain shadow. Deserts appeared on the leeward side of mountains for the first time.
- *Feb 2026* — **Priority-Flood Hydrology**: Rivers became connected and reached the sea. The world first felt real — not noise.
- *Feb 2026* — **Whittaker Biome Matrix**: Nine biomes emerged from temperature and rainfall. The physical environment became a selection environment.

**Phase 2 — First Agents**
- *Feb 2026* — **Multi-Objective Utility Engine**: Agents stopped solving one problem at a time and evaluated competing needs simultaneously. The over-optimizer was replaced.
- *Feb 2026* — **Movement Cost Grid**: Ocean cells made impassable. The terrain first shaped agent movement.

**Phase 3 — Genetics**
- *Mar 2026* — **14-Gene Genome**: Genotype separated from phenotype. Genes express into brain parameters, not behaviors. No "aggression gene" — instead, genes modulate thresholds and rates.
- *Mar 2026* — **Genetic Drift Bottleneck**: Within 200 ticks of genetics introduction, populations collapsed to genetically identical agents from a single founder. Geography eliminated diversity faster than mutation could restore it.
- *Mar 2026* — **Diploid Genetics Abandoned**: Implemented and tested. Abandoned because behavioral impact was unmeasurable at N < 64 populations.

**Phase 4 — Memory**
- *Mar 2026* — **Spatial Memory**: Agents remembered water and food locations. Re-exploration dropped. Survival improved.
- *Apr 2026* — **Episodic Memory Cap**: Unlimited memory caused a 14× slowdown. Rolling FIFO buffer and confidence decay introduced.

**Phase 5 — Colonies & Drives**
- *Apr 2026* — **Colony System**: Four geographically distinct colonies with individual lineages, territories, and colors. Alpha, Beta, Gamma, Delta.
- *Apr 2026* — **Emotional Dynamics**: Biological drives produce emotional pressure. Frustration, fear, longing, boredom, grief emerge from drive interactions.
- *Apr 2026* — **The Oscillation Bug**: Agents without emotional inertia spun in circles at 180° oscillations every tick. EMA smoothing resolved it. Discovery: emotions without inertia produce pathological behavior.
- *Apr 2026* — **Grief — Unscripted**: After mates died, agents exhibited reduced mobility for 20–30 ticks due to longing drive elevation. No grief code was written. It emerged from the drive system.

**Phase 6 — Adaptation**
- *Apr 2026* — **Lateral Inhibition**: Motivational deadlock (fight vs. flee at nearly equal utility) resolved by biological winner-take-all suppression. Same mechanism as biological neural circuits.
- *Apr 2026* — **Welford's Algorithm**: Running mean and variance for motivation drift computed without stored history. O(1) per tick.

**Phase 7 — Cognition**
- *May 2026* — **Neural Predictor**: Agents predict expected utility before acting. Shallow MLP (20-in, 3-hidden, 1-out). Sleep-based weight consolidation prevents gradient explosion.
- *May 2026* — **The Cognitive Ablation Paradox**: Full cognition vs. ablated cognition produced identical survival counts across three seeds. But spatial distribution was completely different. The finding: in a carrying-capacity-bounded world, geography determines *how many* survive. Cognition determines *who*, *where*, and *how they die*.

**Phase 8 — Biology & Combat**
- *Jun 2026* — **Innate Reflex Layer**: Emergency responses bypass the planner entirely. Dehydration deaths beside rivers dropped dramatically. Discovery: every cognitive system needs a priority interrupt stack below it.
- *Jun 2026* — **Shelter System**: Four shelter tiers — None, Tent, Cabin, Stone. Agents construct, claim, and repair shelters.
- *Jun 2026* — **Combat System v5 (Stable)**: Threat Display + Confidence Comparison + Fear Cooldown. Five iterations before stability. Dispute frequency dropped 78% from v1 to v5. No extinction cascades in 10 consecutive runs.
- *Jun 2026* — **600-Tick Cliff Observed**: In most long runs, population drops sharply between ticks 500–700 (40–60%) due to convergence of three pressures: Gen-0 senescence, resource depletion, and territorial friction peaking. Not programmed.

**Phase 9 — Persistence & Research**
- *Jul 2026* — **Full Checkpoint I/O (Phase 9A)**: Simulations can be paused, saved (~15MB JSON), and resumed with complete state restored. World arrays regenerated from seed — not stored.
- *Jul 2026* — **Evolution Journal (Phase 9D)**: Auto-generated scientific journal records genetic drift, cognitive adaptation, and population dynamics every 100 simulation-years.

---

## Part VIII — How to Cite Genesis

### 8.1 BibTeX

```bibtex
@software{genesis2026,
  author    = {Khosya, Vinay},
  title     = {{Project Genesis}: An Agentic Artificial Life \& Evolutionary Biology Simulator},
  year      = {2026},
  version   = {Phase 9A},
  url       = {https://genesis.vinaykhosya.com},
  note      = {Accessed: [DATE]}
}
```

### 8.2 APA

> Khosya, V. (2026). *Project Genesis: An agentic artificial life & evolutionary biology simulator* (Phase 9A) [Software]. https://genesis.vinaykhosya.com

### 8.3 Citation Page Content

The `/citations/` page should display:
- Both citation formats above (copyable)
- Instructions for citing a specific experiment:
  > "To cite a specific experiment, use the experiment's permanent URL as the source. Example: `genesis.vinaykhosya.com/civilizations/EXP-20260713-A3B7/`"
- Note that experiments have permanent URLs and are never deleted
- Note that each experiment page includes the exact configuration needed to reproduce the run

---

## Part IX — Cross-posting Guidelines

### 9.1 When to Cross-post

Cross-post a new civilization to LinkedIn or Twitter when:
- It produced a notable finding (not a routine null result)
- It demonstrates a new Genesis capability
- It illustrates an unexpected emergent behavior

### 9.2 LinkedIn Format

```
[Hook — 1 sentence, most interesting finding]

I ran a Genesis experiment this week.

[Setup — 2 sentences, plain language]
Seed 65654. Island Chains world. Scarcity set to ×5 — five times normal.
18 agents, four colonies. Disputes enabled. Instant healing.

[Result — 2–3 sentences]
All 18 died within 7,970 ticks.
Colony Alpha lasted 22 years. Colony Delta — 5 years.
The difference: geography, not genetics.

[The interesting part — 2–3 sentences]
Genetic diversity across all colonies was effectively zero at the start.
Alpha's survival advantage can't be explained by better genes.
It can only be explained by where they spawned.

[Link]
Full replay, charts, and analysis: [URL]

#ArtificialLife #EvolutionaryBiology #ComplexSystems #Genesis
```

### 9.3 Things Never to Say in Cross-posts

- "My AI agents did X" — they are not AI agents. They are artificial organisms.
- "The simulation proved X" — it provided evidence for X.
- "Agents chose to fight" — territorial friction triggered a dispute.
- Survival counts without context: "0 survivors" needs "out of 18 agents over 22 years."

---

*End of GCR v1.0*

---
**Document produced by Antigravity AI, July 2026**
**Companion: GPS · GDS · GES**
