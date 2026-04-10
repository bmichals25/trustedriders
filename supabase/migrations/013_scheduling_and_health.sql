-- ============================================================================
-- 013: Scheduling, System Health, and Autopilot Events
-- ============================================================================
-- Enables autonomous agent execution via cron-based scheduling,
-- runner self-healing via heartbeat monitoring, and an activity log
-- for the Autopilot dashboard.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Mission Schedules — cron-based triggers for autonomous execution
-- ---------------------------------------------------------------------------
CREATE TABLE mission_schedules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id      uuid REFERENCES missions ON DELETE CASCADE NOT NULL,
  venture_id      uuid REFERENCES ventures ON DELETE CASCADE NOT NULL,
  action_type     text NOT NULL DEFAULT 'optimization_cycle'
                    CHECK (action_type IN ('optimization_cycle', 'orchestrate', 'dispatch_wave')),
  cron_expression text NOT NULL,
  timezone        text NOT NULL DEFAULT 'America/New_York',
  enabled         boolean NOT NULL DEFAULT true,
  last_run_at     timestamptz,
  next_run_at     timestamptz,
  last_status     text DEFAULT 'pending'
                    CHECK (last_status IN ('pending', 'success', 'failed', 'running')),
  run_count       integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_mission_schedules_next ON mission_schedules(next_run_at) WHERE enabled = true;
CREATE INDEX idx_mission_schedules_mission ON mission_schedules(mission_id);

ALTER TABLE mission_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev bypass mission_schedules" ON mission_schedules
  FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 2. System Health — runner heartbeat tracking
-- ---------------------------------------------------------------------------
CREATE TABLE system_health (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component       text NOT NULL UNIQUE,
  status          text NOT NULL DEFAULT 'starting'
                    CHECK (status IN ('starting', 'healthy', 'degraded', 'down')),
  last_heartbeat  timestamptz DEFAULT now(),
  session_count   integer DEFAULT 0,
  active_dispatches integer DEFAULT 0,
  error_log       text,
  metadata        jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev bypass system_health" ON system_health
  FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 3. Autopilot Events — activity log for the dashboard
-- ---------------------------------------------------------------------------
CREATE TABLE autopilot_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id  uuid REFERENCES ventures ON DELETE CASCADE,
  mission_id  uuid REFERENCES missions ON DELETE SET NULL,
  event_type  text NOT NULL,
  severity    text NOT NULL DEFAULT 'info'
                CHECK (severity IN ('info', 'warning', 'error', 'success')),
  title       text NOT NULL,
  description text,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_autopilot_events_recent ON autopilot_events(created_at DESC);
CREATE INDEX idx_autopilot_events_venture ON autopilot_events(venture_id, created_at DESC);

ALTER TABLE autopilot_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev bypass autopilot_events" ON autopilot_events
  FOR ALL USING (true) WITH CHECK (true);
