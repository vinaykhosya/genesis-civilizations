# ADR-001: The Repository Folder name must be `portal/`

## Status
Approved

## Context
The directory structure needs a clear identifier for the web-facing component.

## Decision
We use `portal/` instead of `website/`, `frontend/`, or `site/`.

## Consequences
Future desktop client binaries or visualization clients can sit alongside it in the repository under their own subdirectories (e.g., `client/`) without architectural confusion.
