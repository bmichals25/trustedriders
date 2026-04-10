-- ============================================================================
-- 012: Optimization Cycles (Autoresearch Loop)
-- ============================================================================
-- Supports continuous optimization after initial mission build completes.
-- Loop: measure → hypothesize → execute → evaluate → keep/rollback → repeat
-- ============================================================================

-- Optimization cycles table
CREATE TABLE optimization_cycles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  uuid REFERENCES missions ON DELETE CASCADE NOT NULL,
  cycle_number integer NOT NULL DEFAULT 1,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','measuring','hypothesizing','executing','evaluating','completed')),
  hypothesis          text,
  change_description  text,
  kpi_before  jsonb DEFAULT '{}',
  kpi_after   jsonb DEFAULT '{}',
  improved    boolean,
  kept        boolean,
  created_at  timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_optimization_cycles_mission ON optimization_cycles(mission_id, cycle_number);

-- RLS — dev bypass (matches existing pattern from 003)
ALTER TABLE optimization_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev bypass optimization_cycles" ON optimization_cycles
  FOR ALL USING (true) WITH CHECK (true);

-- New mission columns for loop control
ALTER TABLE missions ADD COLUMN IF NOT EXISTS loop_enabled boolean DEFAULT false;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS goal_metric  text;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS goal_value   numeric;
