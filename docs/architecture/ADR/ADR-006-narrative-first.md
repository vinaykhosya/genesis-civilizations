# ADR-006: Narrative First (Narrative Before Analytics)

## Context
When designing research portals, it is common to prioritize complex dashboards and visual data plots first. However, Genesis is a storytelling simulation of emergent behaviors. A pure dashboard risks obscuring the human-readable chronicle of events under tables and charts, making experiments feel like simple database entries rather than history.

## Decision
We establish a rule: **Evidence must support the narrative, not replace it.**
- All Civilization Records must present the narrative (Question, Hypothesis, Outcome, and Chronicle) prior to showing analytical graphs.
- Analytical visualizations are decoupled into the Observatory mode.
- Users must understand *what* happened through narrative before exploring *why* it happened through charts.

## Consequences
- Preserves the distinct storytelling-first identity of Genesis.
- Simplifies the initial layout of Civilization Records.
- Prevents the interface from becoming cluttered like a corporate business intelligence tool.
