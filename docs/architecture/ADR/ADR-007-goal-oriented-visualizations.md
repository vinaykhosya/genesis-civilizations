# ADR-007: Goal-Oriented Visualizations (Laboratory Instruments)

## Context
Adding standard charts for every variable (e.g. food levels, water indexes, spatial grids) can dilute research focus and introduce cognitive noise. Without intent-focused structure, charts fail to help the researcher draw conclusions.

## Decision
We establish a rule: **Every visualization must answer a research question.**
- No visualization should be added simply because the telemetry holds the data.
- Every chart in the Observatory (Evidence Explorer) must correspond to a clear scientific question (e.g. "Did scarcity reduce survival?", "Did cooperation emerge?").
- Visualizations must be designed as "Laboratory Instruments" (Microscope, Relationship Network, Genome Browser) mapped to specific observations.

## Consequences
- Every visual indicator helps researchers validate or refute hypotheses.
- Reduces rendering performance bottlenecks by pruning unnecessary plots.
- Reinforces the scientific rigor and identity of the portal.
