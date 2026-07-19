# ADR-005: Version-Controlled Experiment Schema

## Status
Approved

## Context
The simulator schema will evolve as new genes, drives, or environmental layers are introduced.

## Decision
Enforce schema version metadata fields (`schema_version`, `engine_version`, `export_version`) in the root of `config.json` and `summary.json`.

## Consequences
The portal can dynamically inspect the `schema_version` of uploaded ZIPs and render legacy runs correctly using conditional data parsers.
