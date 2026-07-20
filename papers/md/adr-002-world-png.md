# ADR-002: Require `world.png` in Experiment Exports

## Status
Approved

## Context
Visualizing world maps requires rendering 2D elevation, biome, and river layers.

## Decision
Require the simulation to save and export `world.png` directly into the ZIP archive. We will not run serverless Python instances to re-render the world on the fly.

## Consequences
Minimizes backend cold starts, simplifies upload validation, and guarantees instant image load times on client devices.
