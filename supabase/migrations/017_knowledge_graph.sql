-- Knowledge Graph — cross-venture intelligence from optimization cycles
-- Inspired by Graphify: learnings become queryable graph nodes + edges

-- ---------------------------------------------------------------------------
-- Graph Nodes — concepts, patterns, tactics
-- ---------------------------------------------------------------------------

CREATE TABLE knowledge_nodes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label         text NOT NULL,                    -- e.g. "trust badges", "countdown timer", "social proof"
  node_type     text NOT NULL DEFAULT 'tactic',   -- 'tactic' | 'metric' | 'pattern' | 'insight'
  description   text,
  -- Provenance
  source_type   text NOT NULL DEFAULT 'extracted', -- 'extracted' | 'inferred' | 'ambiguous'
  confidence    real NOT NULL DEFAULT 1.0,         -- 0.0-1.0
  -- Aggregated stats
  times_tested  integer NOT NULL DEFAULT 0,
  times_kept    integer NOT NULL DEFAULT 0,
  avg_impact    real,                              -- average metric change when kept
  -- Context
  venture_types text[] DEFAULT '{}',               -- which venture types this applies to
  metric_types  text[] DEFAULT '{}',               -- which metrics this affects
  tags          text[] DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER knowledge_nodes_updated BEFORE UPDATE ON knowledge_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_knowledge_nodes_type ON knowledge_nodes(node_type);
CREATE INDEX idx_knowledge_nodes_label ON knowledge_nodes(label);
CREATE INDEX idx_knowledge_nodes_source ON knowledge_nodes(source_type);

-- ---------------------------------------------------------------------------
-- Graph Edges — relationships between nodes
-- ---------------------------------------------------------------------------

CREATE TABLE knowledge_edges (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     uuid NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_id     uuid NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  edge_type     text NOT NULL,        -- 'improves' | 'hurts' | 'related_to' | 'depends_on' | 'conflicts_with'
  weight        real NOT NULL DEFAULT 1.0,
  -- Evidence
  source_type   text NOT NULL DEFAULT 'extracted',
  confidence    real NOT NULL DEFAULT 1.0,
  evidence_count integer NOT NULL DEFAULT 1,
  -- Context
  description   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_id, target_id, edge_type)
);

CREATE INDEX idx_knowledge_edges_source ON knowledge_edges(source_id);
CREATE INDEX idx_knowledge_edges_target ON knowledge_edges(target_id);
CREATE INDEX idx_knowledge_edges_type ON knowledge_edges(edge_type);

-- ---------------------------------------------------------------------------
-- Cycle-to-Node provenance — track which cycles created which nodes
-- ---------------------------------------------------------------------------

CREATE TABLE knowledge_provenance (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id       uuid NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  cycle_id      uuid NOT NULL REFERENCES optimization_cycles(id) ON DELETE CASCADE,
  venture_id    uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  mission_id    uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  metric_before real,
  metric_after  real,
  was_kept      boolean NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(node_id, cycle_id)
);

CREATE INDEX idx_knowledge_provenance_node ON knowledge_provenance(node_id);
CREATE INDEX idx_knowledge_provenance_cycle ON knowledge_provenance(cycle_id);
CREATE INDEX idx_knowledge_provenance_venture ON knowledge_provenance(venture_id);

-- ---------------------------------------------------------------------------
-- RLS — knowledge graph is shared across platform (read-all, write-via-system)
-- ---------------------------------------------------------------------------

ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_provenance ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read the knowledge graph (this IS the network effect)
CREATE POLICY "Read all" ON knowledge_nodes FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Read all" ON knowledge_edges FOR SELECT
  USING (auth.uid() IS NOT NULL);
-- Provenance: users can see entries for their own ventures
CREATE POLICY "Own venture" ON knowledge_provenance FOR SELECT
  USING (venture_id IN (SELECT id FROM ventures WHERE user_id = auth.uid()));

-- Dev bypass
CREATE POLICY "Dev bypass" ON knowledge_nodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev bypass" ON knowledge_edges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev bypass" ON knowledge_provenance FOR ALL USING (true) WITH CHECK (true);
