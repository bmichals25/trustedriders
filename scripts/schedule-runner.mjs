#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Evolute Schedule Runner — Cron-based mission scheduling
//
// Usage: node scripts/schedule-runner.mjs
//
// Checks mission_schedules every 60s for due schedules and creates
// dispatches accordingly. Runs alongside agent-runner.mjs.
// ---------------------------------------------------------------------------

const SUPABASE_URL = 'https://mwmisgcofumqebrmzwej.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13bWlzZ2NvZnVtcWVicm16d2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Mzc4NjAsImV4cCI6MjA4NDAxMzg2MH0.yFOcp984oc9Pyn1s1g62UckRsCrtcsIpeOs5Hwy4ARQ'
const USER_ID = '00000000-0000-0000-0000-000000000001'
const COMPONENT_NAME = 'schedule-runner'

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ---------------------------------------------------------------------------
// Supabase helpers (same pattern as agent-runner.mjs)
// ---------------------------------------------------------------------------
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

async function supabasePatch(table, id, body) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(body),
  })
}

async function supabaseInsert(table, body) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST', headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  })
  return resp.json()
}

// ---------------------------------------------------------------------------
// Telegram notification
// ---------------------------------------------------------------------------
async function sendTelegramNotification(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })
  } catch {}
}

// ---------------------------------------------------------------------------
// Advisor call — on-demand Opus for complex decisions (Advisor Strategy)
// ---------------------------------------------------------------------------
async function callAdvisor(question, agentName, missionName) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return 'Advisor unavailable — no ANTHROPIC_API_KEY configured.'

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `You are a senior technical advisor. ${agentName || 'An agent'} working on "${missionName || 'a mission'}" needs your expert guidance.\n\nQuestion: ${question}\n\nProvide concise, actionable advice. Be direct and specific.`,
        }],
      }),
    })

    if (!response.ok) return 'Advisor temporarily unavailable.'
    const data = await response.json()
    return data.content?.[0]?.text || 'No advisor response.'
  } catch (err) {
    console.error(`   Advisor call failed: ${err.message}`)
    return 'Advisor call failed. Proceed with best judgment.'
  }
}

// ---------------------------------------------------------------------------
// Autopilot event logging
// ---------------------------------------------------------------------------
async function logEvent(ventureId, missionId, eventType, severity, title, description, metadata = {}) {
  try {
    await supabaseInsert('autopilot_events', {
      venture_id: ventureId,
      mission_id: missionId,
      event_type: eventType,
      severity,
      title,
      description,
      metadata: JSON.stringify(metadata),
    })
  } catch (e) {
    console.error(`   Failed to log event: ${e.message}`)
  }
}

// ---------------------------------------------------------------------------
// Simple cron parser — getNextCronDate(cronExpr, fromDate)
//
// Handles: minute, hour, day-of-month, month, day-of-week
// Supports: specific values, *, ranges (1-5), steps (*/6)
// Cap: 1440 iterations (1 day) to prevent infinite loops.
// ---------------------------------------------------------------------------
function parseCronField(field, min, max) {
  if (field === '*') return null // matches any

  // Step: */N or N-M/S
  if (field.includes('/')) {
    const [range, stepStr] = field.split('/')
    const step = parseInt(stepStr, 10)
    let start = min
    let end = max
    if (range !== '*') {
      const [lo, hi] = range.split('-').map(Number)
      start = lo
      if (hi !== undefined) end = hi
    }
    const values = []
    for (let i = start; i <= end; i += step) values.push(i)
    return values
  }

  // Range: N-M
  if (field.includes('-')) {
    const [lo, hi] = field.split('-').map(Number)
    const values = []
    for (let i = lo; i <= hi; i++) values.push(i)
    return values
  }

  // Comma-separated: N,M,O
  if (field.includes(',')) {
    return field.split(',').map(Number)
  }

  // Single value
  return [parseInt(field, 10)]
}

function fieldMatches(value, allowed) {
  if (allowed === null) return true // wildcard
  return allowed.includes(value)
}

function getNextCronDate(cronExpr, fromDate) {
  const parts = cronExpr.trim().split(/\s+/)
  if (parts.length !== 5) return null

  const [minField, hourField, domField, monField, dowField] = parts
  const allowedMin = parseCronField(minField, 0, 59)
  const allowedHour = parseCronField(hourField, 0, 23)
  const allowedDom = parseCronField(domField, 1, 31)
  const allowedMon = parseCronField(monField, 1, 12)
  const allowedDow = parseCronField(dowField, 0, 6) // 0 = Sunday

  // Start one minute after fromDate
  const candidate = new Date(fromDate)
  candidate.setSeconds(0, 0)
  candidate.setMinutes(candidate.getMinutes() + 1)

  for (let i = 0; i < 1440; i++) {
    const min = candidate.getMinutes()
    const hour = candidate.getHours()
    const dom = candidate.getDate()
    const mon = candidate.getMonth() + 1 // JS months are 0-based
    const dow = candidate.getDay()       // 0 = Sunday

    if (
      fieldMatches(min, allowedMin) &&
      fieldMatches(hour, allowedHour) &&
      fieldMatches(dom, allowedDom) &&
      fieldMatches(mon, allowedMon) &&
      fieldMatches(dow, allowedDow)
    ) {
      return candidate
    }

    candidate.setMinutes(candidate.getMinutes() + 1)
  }

  return null // not found within 1440 iterations
}

// ---------------------------------------------------------------------------
// Action: optimization_cycle
// Replicates startOptimizationCycle from agent-runner.mjs
// ---------------------------------------------------------------------------
async function executeOptimizationCycle(schedule) {
  const { mission_id: missionId, venture_id: ventureId } = schedule

  // 1. Determine cycle number
  const { data: prevCycles } = await supabase
    .from('optimization_cycles')
    .select('cycle_number')
    .eq('mission_id', missionId)
    .order('cycle_number', { ascending: false })
    .limit(1)
  const nextCycleNum = (prevCycles?.[0]?.cycle_number ?? 0) + 1

  // 2. Snapshot current KPIs
  const { data: kpis } = await supabase
    .from('mission_kpis')
    .select('label, current_val, target_val, unit')
    .eq('mission_id', missionId)
  const kpiBefore = {}
  for (const k of (kpis ?? [])) kpiBefore[k.label] = k.current_val ?? 0

  // 3. Create optimization_cycles row
  const { data: cycle } = await supabase
    .from('optimization_cycles')
    .insert({
      mission_id: missionId,
      cycle_number: nextCycleNum,
      status: 'hypothesizing',
      kpi_before: kpiBefore,
    })
    .select()
    .single()

  if (!cycle) throw new Error('Failed to create optimization cycle')
  console.log(`   🔬 Cycle ${nextCycleNum} created (hypothesizing)`)

  // 4. Fetch mission, venture, orchestrator, team
  const { data: mission } = await supabase
    .from('missions')
    .select('*, mission_kpis(*)')
    .eq('id', missionId)
    .single()
  const { data: venture } = await supabase
    .from('ventures')
    .select('name, description')
    .eq('id', ventureId)
    .single()

  const orchestratorNodeId = mission?.orchestrator_node_id
  if (!orchestratorNodeId) throw new Error('No orchestrator_node_id on mission')

  const { data: orchNode } = await supabase
    .from('venture_org_nodes')
    .select('agent_id, team_preset_id, platform_override, model_override')
    .eq('id', orchestratorNodeId)
    .single()
  const { data: orchAgent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', orchNode?.agent_id)
    .single()

  if (!orchAgent) throw new Error('Orchestrator agent not found')

  // Fetch team members
  const { data: teamNodes } = await supabase
    .from('venture_org_nodes')
    .select('agent_id, role_override, platform_override, model_override, skills')
    .eq('venture_id', ventureId)
    .eq('entity_type', 'agent')
    .neq('id', orchestratorNodeId)

  const teamMembers = []
  for (const node of (teamNodes ?? [])) {
    if (!node.agent_id) continue
    const { data: ag } = await supabase.from('agents').select('name, role, platform, model, slug').eq('id', node.agent_id).single()
    if (ag) teamMembers.push({
      name: ag.name,
      role: node.role_override || ag.role || '',
      platform: node.platform_override || ag.platform || 'Claude Code',
      model: node.model_override || ag.model || 'Sonnet 4.6',
      slug: ag.slug,
      skills: node.skills || [],
    })
  }

  // 5. Fetch completed cycle history
  const { data: history } = await supabase
    .from('optimization_cycles')
    .select('cycle_number, hypothesis, change_description, kpi_before, kpi_after, improved, kept')
    .eq('mission_id', missionId)
    .eq('status', 'completed')
    .order('cycle_number')

  // 6. Build optimization prompt
  const kpiList = kpis?.map(k => `  - ${k.label}: ${k.current_val ?? 0} / ${k.target_val ?? '?'} ${k.unit}`).join('\n') || '  (none)'
  const teamList = teamMembers.map(t => `  - ${t.name} (${t.platform}, ${t.model}) — ${t.role}`).join('\n')

  const historyRows = (history ?? []).map(c => {
    const goalBefore = c.kpi_before?.[mission.goal_metric] ?? '?'
    const goalAfter = c.kpi_after?.[mission.goal_metric] ?? '?'
    return `  | ${c.cycle_number} | ${c.hypothesis ?? '?'} | ${goalBefore} → ${goalAfter} | ${c.kept ? 'KEPT' : 'ROLLED BACK'} |`
  })
  const historyTable = historyRows.length > 0
    ? `  | Cycle | Hypothesis | Result | Decision |\n  |-------|-----------|--------|----------|\n${historyRows.join('\n')}`
    : '  (no previous cycles)'

  const prompt = `You are running OPTIMIZATION CYCLE ${nextCycleNum} for the "${mission.name}" mission (${venture?.name || 'venture'}).

Goal: Reach ${mission.goal_metric ?? 'target'} = ${mission.goal_value ?? '?'}
${mission.description ? `\nMission: ${mission.description}` : ''}

Current KPIs:
${kpiList}

Cycle History:
${historyTable}

Your team:
${teamList}

Based on the cycle history and current KPI values, propose the NEXT optimization to try.
Consider patterns from previous cycles, untried approaches, and data signals.

CRITICAL: Your ENTIRE response must be ONLY a single JSON object. Start with { and end with }.
{
  "hypothesis": "What you believe will improve the metric and why",
  "change_description": "Specific description of what changes to make",
  "wave": {
    "description": "What this optimization wave does",
    "tasks": [
      {
        "agent_slug": "developer",
        "title": "Short task title",
        "prompt": "Detailed instructions for the agent"
      }
    ]
  }
}`

  // 7. Create dispatch wave + orchestrator dispatch
  const { data: newWave } = await supabase
    .from('dispatch_waves')
    .insert({ mission_id: missionId, wave_number: 900 + nextCycleNum, status: 'running' })
    .select()
    .single()

  if (!newWave) throw new Error('Failed to create optimization wave')

  await supabase
    .from('agent_dispatches')
    .insert({
      agent_id: orchAgent.id,
      venture_id: ventureId,
      wave_id: newWave.id,
      status: 'queued',
      prompt,
      context: JSON.stringify({
        system_prompt: orchAgent.system_prompt ?? '',
        model: orchAgent.model ?? 'unknown',
        platform: orchNode?.platform_override || orchAgent.platform || 'Claude Code',
        agent_name: orchAgent.name,
        mission_id: missionId,
        optimization_cycle_id: cycle.id,
        wave_number: 900 + nextCycleNum,
      }),
      model_used: orchAgent.model ?? 'unknown',
      user_id: USER_ID,
    })

  // Update cycle status
  await supabasePatch('optimization_cycles', cycle.id, { status: 'executing' })

  console.log(`   📤 Optimization cycle ${nextCycleNum} dispatched to ${orchAgent.name}`)
  return { cycleNumber: nextCycleNum, agentName: orchAgent.name }
}

// ---------------------------------------------------------------------------
// Action: orchestrate — wave-0 dispatch for the orchestrator
// ---------------------------------------------------------------------------
async function executeOrchestrate(schedule) {
  const { mission_id: missionId, venture_id: ventureId } = schedule

  // 1. Fetch mission with KPIs
  const { data: mission } = await supabase
    .from('missions')
    .select('*, mission_kpis(*)')
    .eq('id', missionId)
    .single()
  if (!mission) throw new Error('Mission not found')

  // 2. Fetch venture
  const { data: venture } = await supabase
    .from('ventures')
    .select('name, description')
    .eq('id', ventureId)
    .single()

  // 3. Fetch orchestrator org node + agent
  const orchestratorNodeId = mission.orchestrator_node_id
  if (!orchestratorNodeId) throw new Error('No orchestrator_node_id on mission')

  const { data: orchNode } = await supabase
    .from('venture_org_nodes')
    .select('id, agent_id, team_preset_id, platform_override, model_override, agents(id, name, slug, role, platform, model, system_prompt)')
    .eq('id', orchestratorNodeId)
    .single()

  if (!orchNode?.agents) throw new Error('Orchestrator agent not found')
  const orchAgent = orchNode.agents

  // 4. Fetch team members
  const { data: teamNodes } = await supabase
    .from('venture_org_nodes')
    .select('agent_id, role_override, platform_override, model_override, skills, agents(name, role, platform, model, slug)')
    .eq('venture_id', ventureId)
    .eq('entity_type', 'agent')
    .neq('id', orchestratorNodeId)

  const team = (teamNodes ?? [])
    .filter(n => n.agents)
    .map(n => ({
      name: n.agents.name,
      role: n.role_override || n.agents.role || 'agent',
      platform: n.platform_override || n.agents.platform || 'unknown',
      model: n.model_override || n.agents.model || 'unknown',
      slug: n.agents.slug ?? null,
      skills: n.skills || [],
    }))

  // 5. Build orchestrator prompt (inline)
  const teamList = team
    .map(t => `  - ${t.name} (${t.platform}, ${t.model}) — ${t.role}${t.skills?.length ? ` [skills: ${t.skills.join(', ')}]` : ''}`)
    .join('\n')

  const kpiList = (mission.mission_kpis ?? []).length > 0
    ? mission.mission_kpis.map(k => `  - ${k.label}: ${k.current_val ?? 0}/${k.target_val ?? '?'} ${k.unit}`).join('\n')
    : '  (none defined yet)'

  const prompt = `You are orchestrating the "${mission.name}" mission for ${venture?.name || 'venture'}.
${venture?.description ? `\nVenture: ${venture.description}` : ''}
${mission.description ? `\nMission: ${mission.description}` : ''}
${mission.type ? `\nType: ${mission.type}` : ''}

Platform defaults:
  - Deploy to: Netlify (NEVER Vercel)
  - GitHub org: bmichals25
  - Framework: Next.js + TypeScript + Tailwind CSS
  - Static export (output: "export") for Netlify compatibility
  - Node 22

KPIs:
${kpiList}

Your team:
${teamList}

Break this mission into waves of parallel tasks. Each wave runs simultaneously — agents in the same wave work at the same time. A wave must complete before the next one starts.

IMPORTANT: Wave 1 MUST include DevOps creating the GitHub repo and setting up Netlify CD. Wave 3 MUST include DevOps deploying to production.

CRITICAL: Your ENTIRE response must be ONLY a single JSON object. No prose, no markdown fences, no explanation before or after. Start with { and end with }.
{
  "plan_summary": "Brief description of your approach",
  "repo_name": "suggested-repo-name",
  "waves": [
    {
      "wave": 1,
      "description": "What this wave accomplishes",
      "tasks": [
        {
          "agent_slug": "developer",
          "title": "Short task title",
          "prompt": "Detailed instructions for the agent."
        }
      ]
    }
  ],
  "venture_updates": {
    "description": "Updated project description (optional)",
    "links": { "github_url": "https://github.com/bmichals25/repo_name" },
    "stage": "building"
  }
}`

  // 6. Create wave 0
  const { data: wave } = await supabase
    .from('dispatch_waves')
    .insert({ mission_id: missionId, wave_number: 0, status: 'running' })
    .select('id')
    .single()

  if (!wave) throw new Error('Failed to create wave 0')

  // 7. Create orchestrator dispatch
  await supabase
    .from('agent_dispatches')
    .insert({
      agent_id: orchAgent.id,
      venture_id: ventureId,
      wave_id: wave.id,
      org_node_id: orchNode.id,
      status: 'queued',
      prompt,
      context: JSON.stringify({
        system_prompt: orchAgent.system_prompt ?? '',
        model: orchAgent.model ?? 'unknown',
        platform: orchNode.platform_override || orchAgent.platform || 'unknown',
        agent_name: orchAgent.name,
        mission_id: missionId,
        mission_name: mission.name,
      }),
      model_used: orchAgent.model ?? 'unknown',
      user_id: USER_ID,
    })

  // Update mission status to active
  if (mission.status !== 'active') {
    await supabase.from('missions').update({ status: 'active' }).eq('id', missionId)
  }

  console.log(`   📤 Orchestrate dispatch queued for ${orchAgent.name}`)
  return { agentName: orchAgent.name, missionName: mission.name }
}

// ---------------------------------------------------------------------------
// Schedule processing — check for due schedules and execute
// ---------------------------------------------------------------------------
async function processDueSchedules() {
  const now = new Date().toISOString()

  const { data: dueSchedules, error } = await supabase
    .from('mission_schedules')
    .select('*')
    .eq('enabled', true)
    .lte('next_run_at', now)

  if (error) {
    console.error(`   Error querying schedules: ${error.message}`)
    return
  }

  if (!dueSchedules || dueSchedules.length === 0) return

  console.log(`\n⏰ ${dueSchedules.length} schedule(s) due`)

  for (const schedule of dueSchedules) {
    const label = `[${schedule.action_type}] schedule ${schedule.id.slice(0, 8)}`
    console.log(`\n   Processing ${label}...`)

    // Mark as running
    await supabasePatch('mission_schedules', schedule.id, { last_status: 'running' })

    try {
      let result = {}

      if (schedule.action_type === 'optimization_cycle') {
        result = await executeOptimizationCycle(schedule)
      } else if (schedule.action_type === 'orchestrate') {
        result = await executeOrchestrate(schedule)
      } else {
        throw new Error(`Unknown action_type: ${schedule.action_type}`)
      }

      // Compute next run
      const nextRun = getNextCronDate(schedule.cron_expression, new Date())

      // Update schedule
      await supabasePatch('mission_schedules', schedule.id, {
        last_run_at: new Date().toISOString(),
        next_run_at: nextRun ? nextRun.toISOString() : null,
        run_count: (schedule.run_count ?? 0) + 1,
        last_status: 'success',
        updated_at: new Date().toISOString(),
      })

      // Log event
      await logEvent(
        schedule.venture_id,
        schedule.mission_id,
        `schedule_${schedule.action_type}`,
        'success',
        `Scheduled ${schedule.action_type} executed`,
        `Run #${(schedule.run_count ?? 0) + 1} completed. Next: ${nextRun ? nextRun.toISOString() : 'none'}`,
        { schedule_id: schedule.id, ...result },
      )

      // Telegram notification
      await sendTelegramNotification(
        `⏰ *Schedule executed*\nAction: \`${schedule.action_type}\`\nRun #${(schedule.run_count ?? 0) + 1}\nNext: ${nextRun ? nextRun.toLocaleString() : 'none'}`,
      )

      console.log(`   ✅ ${label} succeeded (next: ${nextRun ? nextRun.toISOString() : 'none'})`)

    } catch (e) {
      console.error(`   ❌ ${label} failed: ${e.message}`)

      // Compute next run even on failure
      const nextRun = getNextCronDate(schedule.cron_expression, new Date())

      await supabasePatch('mission_schedules', schedule.id, {
        last_run_at: new Date().toISOString(),
        next_run_at: nextRun ? nextRun.toISOString() : null,
        run_count: (schedule.run_count ?? 0) + 1,
        last_status: 'failed',
        updated_at: new Date().toISOString(),
      })

      await logEvent(
        schedule.venture_id,
        schedule.mission_id,
        `schedule_${schedule.action_type}`,
        'error',
        `Scheduled ${schedule.action_type} failed`,
        e.message,
        { schedule_id: schedule.id },
      )

      await sendTelegramNotification(
        `❌ *Schedule failed*\nAction: \`${schedule.action_type}\`\nError: ${e.message.slice(0, 200)}`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// System health heartbeat
// ---------------------------------------------------------------------------
async function writeHeartbeat() {
  try {
    // Upsert by component name
    const { data: existing } = await supabase
      .from('system_health')
      .select('id')
      .eq('component', COMPONENT_NAME)
      .single()

    if (existing) {
      await supabasePatch('system_health', existing.id, {
        status: 'healthy',
        last_heartbeat: new Date().toISOString(),
        metadata: JSON.stringify({ pid: process.pid, uptime_s: Math.floor(process.uptime()) }),
      })
    } else {
      await supabaseInsert('system_health', {
        component: COMPONENT_NAME,
        status: 'healthy',
        last_heartbeat: new Date().toISOString(),
        session_count: 0,
        active_dispatches: 0,
        metadata: JSON.stringify({ pid: process.pid }),
      })
    }
  } catch (e) {
    console.error(`   Heartbeat error: ${e.message}`)
  }
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------
let running = true

async function main() {
  console.log(`🕐 Evolute Schedule Runner`)
  console.log(`   Checking mission_schedules every 60s`)
  console.log(`   Heartbeat every 30s → system_health\n`)

  // Initial heartbeat
  await writeHeartbeat()

  // Schedule check loop (every 60s)
  const scheduleInterval = setInterval(async () => {
    if (!running) return
    try {
      await processDueSchedules()
    } catch (e) {
      console.error(`   Schedule loop error: ${e.message}`)
    }
  }, 60_000)

  // Heartbeat loop (every 30s)
  const heartbeatInterval = setInterval(async () => {
    if (!running) return
    await writeHeartbeat()
  }, 30_000)

  // Run once immediately on start
  await processDueSchedules()

  console.log('   Ready. Ctrl+C to stop.\n')

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n   Shutting down schedule-runner...')
    running = false
    clearInterval(scheduleInterval)
    clearInterval(heartbeatInterval)

    // Mark as down
    try {
      const { data: existing } = await supabase
        .from('system_health')
        .select('id')
        .eq('component', COMPONENT_NAME)
        .single()
      if (existing) {
        await supabasePatch('system_health', existing.id, { status: 'down' })
      }
    } catch {}

    console.log('   Goodbye.')
    process.exit(0)
  })
}

main().catch(console.error)
