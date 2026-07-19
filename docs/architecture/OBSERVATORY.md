# Genesis Observatory Specification (GOS)
## Version 1.0 — July 2026

The Observatory (Evidence Explorer) is the scientific instrument deck of the Genesis Portal. Its role is to explain the narrative: if the Civilization Record answers *what* happened, the Observatory answers *why* it happened using quantitative evidence.

---

## 1. Core Philosophy

In accordance with [ADR-006](file:///c:/Users/vinay/Desktop/project%20genesis/docs/architecture/ADR/ADR-006-narrative-first.md) and [ADR-007](file:///c:/Users/vinay/Desktop/project%20genesis/docs/architecture/ADR/ADR-007-goal-oriented-visualizations.md), the Observatory operates under two absolute constraints:
1. **Evidence supports narrative**: The Observatory is entered *from* the Civilization Record. It is a secondary explorer, not a standalone home page.
2. **Visualizations are Laboratory Instruments**: Every chart must answer a specific research question. Generic data plots without intent are prohibited.

---

## 2. Instrument Catalog & Registry

We document and register all approved scientific instruments. Every instrument must map to a research question, inputs, and limitations.

### OBS-001: Population Dynamics (Oscilloscope)
* **Research Question**: *Did resource scarcity reduce survival and growth rates?*
* **Inputs**: `population.csv` (ticks, total count, and colony breakdowns).
* **Outputs**: Line graph mapping total population and individual colony lineages over time.
* **Limitations**: Does not show spatial distribution or local water pressures.

### OBS-002: Resource Consumption Explorer (Flow Meter)
* **Research Question**: *Where were critical resource shortages created?*
* **Inputs**: `summary.json` (derived metrics for food and water efficiency).
* **Outputs**: Stacked area chart showing resource supply vs. total agent consumption.
* **Limitations**: Aggregated globally; does not show individual agent hunger levels.

### OBS-003: Territorial Friction Map (Microscope)
* **Research Question**: *Did territorial pressure lead to clustered disputes?*
* **Inputs**: `events.json` (Dispute events metadata mapping coordinates).
* **Outputs**: Static 2D spatial heatmap overlay showing conflict coordinates on the map.
* **Limitations**: Ticks are collapsed; does not show the sequence of dispute progression.

### OBS-004: Social Kinship Grid (Oscilloscope)
* **Research Question**: *Did stable cooperative attachment bonds emerge?*
* **Inputs**: `agent_census.csv` (parents, colonies, and children lineages).
* **Outputs**: Dynamic directed network graph showing colony splits and child-parent attachments.
* **Limitations**: Becomes visually complex when agent count exceeds 500.

### OBS-005: Genetic Entropy Browser (Sequencer)
* **Research Question**: *Did genetic traits stabilize or drift over generations?*
* **Inputs**: `agent_census.csv` (chromosome strings and generation indices).
* **Outputs**: Histogram showing distribution of mutation deviations from the founder seed.
* **Limitations**: Captures survivors only; deceased lineages are excluded.

---

## 3. Interaction & Linking Rules

- **Tick Linking (Phase 3.5 Bridge)**: Clicking on any event in the Chronicle seeks all active instruments to that specific tick (e.g. updating the pointer on the Population Dynamics graph).
- **Decoupled Tabs**: The Observatory loads in a split-screen or separate tab context, keeping the narrative chronicle layout readable.
