# ADR-003: Simple JWT-Cookie Command Authentication

## Status
Approved

## Context
The admin dashboard `/command` requires authorization for Vinay Khosya.

## Decision
Implement a custom JWT cookie login system using an environment-configured username and password. We will defer Supabase Auth integration.

## Consequences
Zero third-party identity provider dependency, instant setup, and zero local DB overhead.
