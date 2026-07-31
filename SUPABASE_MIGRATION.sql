-- ============================================================
-- Genesis Portal — Supabase Schema Migration
-- Paste this ENTIRE script into:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- URL: https://supabase.com/dashboard/project/tyajlotsxwocxxawcwta/sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS experiments (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  abstract        TEXT,
  tags            TEXT[] DEFAULT '{}',
  health_score    INTEGER DEFAULT 100,
  health_warnings TEXT[] DEFAULT '{}',
  schema_version  TEXT NOT NULL DEFAULT '1.0.0',
  engine_version  TEXT NOT NULL DEFAULT '9.2.0',
  export_version  TEXT,
  seed            INTEGER NOT NULL,
  ticks           INTEGER NOT NULL,
  scarcity        REAL NOT NULL,
  world_preset    TEXT,
  climate_epoch_mode TEXT,
  max_population  INTEGER,
  mutation_rate   REAL,
  total_agents    INTEGER,
  survivors_count INTEGER,
  max_generation  INTEGER,
  avg_genetic_diversity REAL,
  config_json     JSONB NOT NULL,
  summary_json    JSONB NOT NULL,
  storage_path    TEXT NOT NULL,
  thumbnail_url   TEXT,
  cover_url       TEXT,
  og_url          TEXT,
  has_replay      BOOLEAN DEFAULT FALSE,
  replay_size_mb  REAL,
  is_published    BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiment_events (
  id              BIGSERIAL PRIMARY KEY,
  experiment_id   TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  tick            INTEGER NOT NULL,
  year            INTEGER,
  day             INTEGER,
  event_type      TEXT NOT NULL,
  description     TEXT,
  metadata        JSONB
);

CREATE TABLE IF NOT EXISTS experiment_agents (
  id              BIGSERIAL PRIMARY KEY,
  experiment_id   TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE ON UPDATE CASCADE,
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
  birth_location  JSONB,
  death_location  JSONB,
  exploration_radius REAL,
  genes           JSONB
);

CREATE TABLE IF NOT EXISTS experiment_population (
  id              BIGSERIAL PRIMARY KEY,
  experiment_id   TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  tick            INTEGER NOT NULL,
  total           INTEGER,
  alpha           INTEGER,
  beta            INTEGER,
  gamma           INTEGER,
  delta           INTEGER
);

CREATE TABLE IF NOT EXISTS research_documents (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  document_type   TEXT NOT NULL,
  content_md      TEXT NOT NULL,
  storage_path    TEXT,
  version         TEXT,
  is_published    BOOLEAN DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_experiments_published ON experiments(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_experiments_scarcity  ON experiments(scarcity) WHERE is_published;
CREATE INDEX IF NOT EXISTS idx_experiments_preset    ON experiments(world_preset) WHERE is_published;
CREATE INDEX IF NOT EXISTS idx_experiments_featured  ON experiments(is_featured) WHERE is_published;
CREATE INDEX IF NOT EXISTS idx_experiments_tags      ON experiments USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_events_exp_id ON experiment_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_events_type   ON experiment_events(experiment_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_tick   ON experiment_events(experiment_id, tick);

CREATE INDEX IF NOT EXISTS idx_agents_exp_id ON experiment_agents(experiment_id);
CREATE INDEX IF NOT EXISTS idx_agents_colony ON experiment_agents(experiment_id, colony_id);
CREATE INDEX IF NOT EXISTS idx_agents_gen    ON experiment_agents(experiment_id, generation);

CREATE INDEX IF NOT EXISTS idx_pop_exp_tick ON experiment_population(experiment_id, tick);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE experiments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_agents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_population ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_documents  ENABLE ROW LEVEL SECURITY;

-- Public read (published only)
CREATE POLICY "public_read_experiments"
  ON experiments FOR SELECT USING (is_published = TRUE);

CREATE POLICY "public_read_events"
  ON experiment_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM experiments e WHERE e.id = experiment_id AND e.is_published = TRUE));

CREATE POLICY "public_read_agents"
  ON experiment_agents FOR SELECT
  USING (EXISTS (SELECT 1 FROM experiments e WHERE e.id = experiment_id AND e.is_published = TRUE));

CREATE POLICY "public_read_population"
  ON experiment_population FOR SELECT
  USING (EXISTS (SELECT 1 FROM experiments e WHERE e.id = experiment_id AND e.is_published = TRUE));

CREATE POLICY "public_read_research_documents"
  ON research_documents FOR SELECT USING (is_published = TRUE);

-- Admin write (service_role bypasses RLS, these are safety nets)
CREATE POLICY "admin_all_experiments"
  ON experiments FOR ALL USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');

CREATE POLICY "admin_all_events"
  ON experiment_events FOR ALL USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');

CREATE POLICY "admin_all_agents"
  ON experiment_agents FOR ALL USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');

CREATE POLICY "admin_all_population"
  ON experiment_population FOR ALL USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');

CREATE POLICY "admin_all_research_documents"
  ON research_documents FOR ALL USING (auth.jwt() ->> 'email' = 'vinay@khosya.com');

-- ============================================================
-- STORAGE BUCKETS CONFIGURATION (1 GB File Size Limits)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('packages', 'packages', true, 1073741824),
  ('experiments', 'experiments', true, 1073741824),
  ('thumbnails', 'thumbnails', true, 1073741824),
  ('replays', 'replays', false, 1073741824)
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = 1073741824,
  public = EXCLUDED.public;

-- ============================================================
-- DONE ✓
-- ============================================================
SELECT 'Genesis schema & 1GB storage bucket migration complete!' AS status;
