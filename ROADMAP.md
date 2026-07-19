# Genesis Portal Engineering Roadmap
## Version 1.1 — July 2026

This document maps the sequential engineering phases of the Genesis Portal, serving as the guide for implementation and coordination across all portal development.

---

## Phase 1 — Scaffold & Specifications ✅
* **Objective**: Build the repository layout, design tokens, contract schema, and workflow templates.
* **Deliverables**:
  - `docs/architecture/` with GPS, GDS, GES, GCR specs.
  - `docs/architecture/ADR/` with ADR-001 through ADR-005.
  - `shared/` with `experiment_schema.json` and TypeScript typings.
  - `portal/` Next.js layout scaffold and styles.
  - GitHub Actions CI config.

---

## Phase 2 — Experiment Ingestion & Archive ✅
* **Objective**: Implement secure experiment ZIP upload, server-side Zod validation, WebP asset generation, database insertion, and the civilizations list view at `/archive`.
* **Deliverables**:
  - `/control/login` and secure JWT-cookie session middleware.
  - `/api/v1/admin/experiments/upload` validation pipeline.
  - `sharp` integration for auto-converting `world.png` into optimized `.webp` layouts.
  - Supabase database schema migration script.
  - `/archive` (Archive of Civilizations) grid and filters.

---

## Phase 3 — Civilization Narrative & Chronicle (Current Phase) 🚀
* **Objective**: Deliver the core narrative details page, story-first layouts, the event chronicle, and downloads.
* **Deliverables**:
  - `/archive/civilizations/[id]` story-first details page (Question → Hypothesis → Outcome → Notes).
  - Immersive event chronicle (translating raw event telemetry into history, e.g. "The first child of Colony Alpha was born").
  - Self-contained file downloads (ZIP, raw config JSON, summary JSON).
.2

---

## Phase 4 — Evidence Explorer, Heatmaps & Inspectors
* **Objective**: Deliver the scientific analysis mode, telemetry graphs, and spatial/cognitive inspectors.
* **Deliverables**:
  - `/archive/civilizations/[id]/observatory` separate Evidence Explorer cockpit.
  - Population curves, resource consumption graphs, and genetic distribution charts.
  - Heatmap visualizers (deaths density, resource belts).
  - Individual Agent Inspector (biography, lineage, memories, traits) and Colony Inspector.
  - Comparative analysis tool (differential metric overlays).

---

## Phase 5 — Research, Living Timeline, & Search
* **Objective**: Support editorial content and portal navigation.
* **Deliverables**:
  - Markdown-rendered Monograph, Architecture papers, and Lab Notebooks under `/research`.
  - Interactive Living Timeline with seed notes documenting development milestones.
  - Global query search bar with auto-suggest.

---

## Phase 6 — Landing Page & Experience
* **Objective**: Deliver the visual introduction to Genesis.
* **Deliverables**:
  - Immersive 12-second procedural canvas landing animation.
  - Mobile responsive scroll navigation.
  - Open Graph (OG) image dynamic renderer.

---

## Phase 7 — Open Science, APIs & Datasets
* **Objective**: Open the platform for collaborative research.
* **Deliverables**:
  - Public REST API endpoints `/api/v1/` for external query consumption.
  - Citation copy block templates and Dataset download packaging.
  - Community upload submission pipelines.
