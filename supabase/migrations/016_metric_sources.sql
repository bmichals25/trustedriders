-- Metric measurement configuration for missions
-- Tells the optimization loop where to fetch real data

-- Add measurement config to missions
ALTER TABLE missions ADD COLUMN measurement_source text; -- 'plausible', 'stripe', 'manual', or null
ALTER TABLE missions ADD COLUMN measurement_config jsonb DEFAULT '{}';

-- Add richer snapshot data to optimization cycles
ALTER TABLE optimization_cycles ADD COLUMN metrics_snapshot jsonb DEFAULT '{}';

-- Index for finding missions with specific measurement sources
CREATE INDEX idx_missions_measurement ON missions(measurement_source) WHERE measurement_source IS NOT NULL;
