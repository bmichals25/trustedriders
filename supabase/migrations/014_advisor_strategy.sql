-- ============================================================================
-- 014: Advisor Strategy — Sonnet Executor + Opus Advisor
-- ============================================================================
-- Downgrades all Opus agents to Sonnet for routine execution.
-- Adds ADVISOR: mechanism so agents can call Opus on-demand for complex
-- decisions. Tracks advisor usage per dispatch.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Downgrade leadership agents from Opus to Sonnet
-- ---------------------------------------------------------------------------
UPDATE agents SET model = 'Sonnet 4.6'
WHERE slug IN ('ceo', 'vp-eng', 'architect', 'vp-product', 'researcher', 'vp-design')
  AND model = 'Opus 4.6';

-- ---------------------------------------------------------------------------
-- 2. Add advisor tracking columns to agent_dispatches
-- ---------------------------------------------------------------------------
ALTER TABLE agent_dispatches ADD COLUMN IF NOT EXISTS advisor_calls integer DEFAULT 0;
ALTER TABLE agent_dispatches ADD COLUMN IF NOT EXISTS model_tier text DEFAULT 'executor';

-- ---------------------------------------------------------------------------
-- 3. Update system prompts for agents that get advisor access
-- ---------------------------------------------------------------------------

-- VP Engineering — primary orchestrator, needs advisor for architecture decisions
UPDATE agents SET system_prompt = system_prompt || '

## Advisor Access
For complex decisions with significant risk (architecture choices, security trade-offs, major scope changes), request expert guidance by outputting:
ADVISOR: [Your specific question here]
A senior advisor will review and respond. Use sparingly — most decisions you can make confidently on your own.'
WHERE slug = 'vp-eng';

-- Architect — needs advisor for system design decisions
UPDATE agents SET system_prompt = system_prompt || '

## Advisor Access
For critical architecture decisions (database schema design, security architecture, scalability patterns, technology selection), request expert guidance by outputting:
ADVISOR: [Your specific question here]
A senior advisor will review and respond. Use sparingly — only for decisions with lasting technical impact.'
WHERE slug = 'architect';

-- Product Researcher — needs advisor for strategic GO/NO-GO decisions
UPDATE agents SET system_prompt = system_prompt || '

## Advisor Access
For strategic decisions that could significantly impact the business (GO/NO-GO recommendations, market entry strategy, competitive positioning), request expert guidance by outputting:
ADVISOR: [Your specific question here]
A senior advisor will review and respond. Use sparingly — for high-stakes strategic calls only.'
WHERE slug = 'researcher';
