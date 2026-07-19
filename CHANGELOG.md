# Changelog

All notable changes to Project Genesis will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-07-14

### Added
- **Core Platform Architecture (Phase 1)**: Decoupled Simulation Engine (`world/`) and Web Portal (`portal/`) workspaces.
- **Data Contracts**: Defined `shared/experiment_schema.json` and TypeScript typings mapping experiment config and summaries.
- **Modular Ingestion Engine (`portal/lib/ingestion/`)**: Programmed parser, 4-tier validator (Structural, Schema, Semantic, Research), Sharp WebP assets downsampler, DB publisher, and transactional rollback recovery helper.
- **Control Console**: Staging, duplicate validation checks, preview diagnostics, and cookie session authentication.
- **Civilization Record UI**: Immersive narrative details layout at `/archive/civilizations/[id]` featuring specimen hero presentation, snapshot confidence rating, discoveries bridge, and APA/BibTeX citations copy board.
- **Chronicle Engine (`portal/lib/chronicle/`)**: Reconstructs raw event lists into chronological history chapters dynamically triggered by emergent milestones.
- **Governance Framework**: Added `docs/architecture/ENGINEERING_PRINCIPLES.md` and decision records `ADR-001` through `ADR-007`.
- **Evidence Explorer Specification**: Published GOS details in `docs/architecture/OBSERVATORY.md` registering the first 5 approved laboratory instruments.
- **Project Philosophy Manifesto**: Added `WHY_GENESIS.md` at root.
