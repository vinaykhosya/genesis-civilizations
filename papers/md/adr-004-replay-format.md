# ADR-004: Progressive Replay Format and Manifests

## Status
Approved

## Context
Large simulation runs can exceed hundreds of megabytes in `replay.json` format, making single-load delivery to browsers slow and memory-intensive.

## Decision
Avoid complete file truncation where possible. We will design the replay system to package replays into chunked files (e.g., `chunk_00001.bin`, `chunk_00002.bin`) referenced by a `manifest.json`.

## Consequences
Enables progressive loading of tick data as the user scrubs through the timeline, preventing browser crashes and enabling long-duration simulation replays.
