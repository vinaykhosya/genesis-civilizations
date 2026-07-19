-- Supabase Database Schema for Project Genesis Portal
-- Version 1.2.0 — Phase 2 Ingestion

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: experiments
CREATE TABLE IF NOT EXISTS experiments (
  id              TEXT PRIMARY KEY, -- Format: 'EXP-YYYYMMDD-XXXX' (canonical)
  slug            TEXT UNIQUE NOT NULL, -- URL-safe human title slug
  title           TEXT NOT NULL,
  abstract        TEXT, -- Markdown description
  tags            TEXT[] DEFAULT '{}',
  
  -- Validation & Quality reports
  health_score    INTEGER DEFAULT 100, -- Ingestion Health score (percentage)
  health_warnings TEXT[] DEFAULT '{}', -- Logged warning strings

  -- Schema version descriptors (ADR-005)
  schema_version  TEXT NOT NULL DEFAULT '1.0.0',
  engine_version  TEXT NOT NULL DEFAULT '9.2.0',
  export_version  TEXT,

  -- Key config fields (denormalized for fast filtering)
  seed            INTEGER NOT NULL,
  ticks           INTEGER NOT NULL,
  scarcity        REAL NOT NULL,
  world_preset    TEXT,
  climate_epoch_mode TEXT,
  max_population  INTEGER,
  mutation_rate   REAL,

  -- Key summary fields (denormalized for fast card rendering)
  total_agents    INTEGER,
  survivors_count INTEGER,
  max_generation  INTEGER,
  avg_genetic_diversity REAL,

  -- Full JSON blobs for detail views
  config_json     JSONB NOT NULL,
  summary_json    JSONB NOT NULL,

  -- Storage paths
  storage_path    TEXT NOT NULL, -- Prefix 'experiments/{id}/'
  thumbnail_url   TEXT, -- Link to assets/thumbnail.webp
  cover_url       TEXT, -- Link to assets/cover.webp
  og_url          TEXT, -- Link to assets/og.webp
  has_replay      BOOLEAN DEFAULT FALSE,
  replay_size_mb  REAL,

  -- Publishing
  is_published    BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Table: experiment_events
CREATE TABLE IF NOT EXISTS experiment_events (
  id              BIGSERIAL PRIMARY KEY,
  experiment_id   TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  tick            INTEGER NOT NULL,
  year            INTEGER,
  day             INTEGER,
  event_type      TEXT NOT NULL,
  description     TEXT,
  metadata        JSONB
);

-- Table: experiment_agents
CREATE TABLE IF NOT EXISTS experiment_agents (
  id              BIGSERIAL PRIMARY KEY,
  experiment_id   TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  agent_id        INTEGER NOT NULL,
  colony_id       INTEGER,
  colony_name     TEXT,
  generation      INTEGER,
  age_ticks       INTEGER,
  lifespan_ticks  INTEGER,
  health_at_death REAL,
  children_count  INTEGER DEFAULT 0,
  shelter_level   INTEGER DEFAULT 0,
  cause_of_death  TEXT,
  birth_location  JSONB, -- {y: number, x: number}
  death_location  JSONB, -- {y: number, x: number}
  exploration_radius REAL,
  genes           JSONB
);

-- Table: experiment_population
CREATE TABLE IF NOT EXISTS experiment_population (
  id              BIGSERIAL PRIMARY KEY,
  experiment_id   TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  tick            INTEGER NOT NULL,
  total           INTEGER,
  alpha           INTEGER,
  beta            INTEGER,
  gamma           INTEGER,
  delta           INTEGER
);

-- Table: research_documents
CREATE TABLE IF NOT EXISTS research_documents (
  id              TEXT PRIMARY KEY, -- e.g. 'monograph', 'architecture'
  title           TEXT NOT NULL,
  document_type   TEXT NOT NULL, -- 'monograph' | 'architecture' | 'lab_notebook' | 'thesis'
  content_md      TEXT NOT NULL,
  storage_path    TEXT,
  version         TEXT,
  is_published    BOOLEAN DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiments_published ON experiments(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_experiments_scarcity ON experiments(scarcity) WHERE is_published;
CREATE INDEX IF NOT EXISTS idx_experiments_preset ON experiments(world_preset) WHERE is_published;
CREATE INDEX IF NOT EXISTS idx_experiments_featured ON experiments(is_featured) WHERE is_published;
CREATE INDEX IF NOT EXISTS idx_experiments_tags ON experiments USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_events_exp_id ON experiment_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON experiment_events(experiment_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_tick ON experiment_events(experiment_id, tick);

CREATE INDEX IF NOT EXISTS idx_agents_exp_id ON experiment_agents(experiment_id);
CREATE INDEX IF NOT EXISTS idx_agents_colony ON experiment_agents(experiment_id, colony_id);
CREATE INDEX IF NOT EXISTS idx_agents_gen ON experiment_agents(experiment_id, generation);

CREATE INDEX IF NOT EXISTS idx_pop_exp_tick ON experiment_population(experiment_id, tick);

-- Enable Row-Level Security (RLS)
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_population ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_documents ENABLE ROW LEVEL SECURITY;

-- RLS Select Policies
CREATE POLICY "public_read_experiments"
  ON experiments FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "public_read_events"
  ON experiment_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM experiments e
    WHERE e.id = experiment_id AND e.is_published = TRUE
  ));

CREATE POLICY "public_read_agents"
  ON experiment_agents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM experiments e
    WHERE e.id = experiment_id AND e.is_published = TRUE
  ));

CREATE POLICY "public_read_population"
  ON experiment_population FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM experiments e
    WHERE e.id = experiment_id AND e.is_published = TRUE
  ));

CREATE POLICY "public_read_research_documents"
  ON research_documents FOR SELECT
  USING (is_published = TRUE);

-- RLS Write Policies (Admin Only)
-- Note: Supabase service_role keys bypass RLS for server-side upload processes.
-- Here we configure an email-based safety net policy for the Vinay admin account.
CREATE POLICY "admin_all_experiments"
  ON experiments FOR ALL
  USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');

CREATE POLICY "admin_all_events"
  ON experiment_events FOR ALL
  USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');

CREATE POLICY "admin_all_agents"
  ON experiment_agents FOR ALL
  USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');

CREATE POLICY "admin_all_population"
  ON experiment_population FOR ALL
  USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');

CREATE POLICY "admin_all_research_documents"
  ON research_documents FOR ALL
  USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');
