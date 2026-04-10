// ---------------------------------------------------------------------------
// Prompt templates for mission orchestration — pure functions, no hooks
// ---------------------------------------------------------------------------

import type { Mission, MissionKPI, Venture, OptimizationCycle } from '@/types'

// ---------------------------------------------------------------------------
// Types for prompt builder params
// ---------------------------------------------------------------------------

export interface TeamMemberInfo {
  name: string
  role: string
  platform?: string
  model?: string
  slug: string
  skills?: string[]
}

export interface OrchestratorPromptParams {
  mission: Mission
  kpis: MissionKPI[]
  venture: Venture
  teamRoster: TeamMemberInfo[]
  githubUrl: string | null
  liveUrl: string | null
}

export interface AgentTaskPromptParams {
  agentName: string
  agentRole: string
  agentSlug: string
  taskTitle: string
  taskDescription: string
  projectDir: string | null
  waveNumber: number
  venture: Venture
  mission: Mission
  repoName?: string | null
  githubUrl?: string | null
  liveUrl?: string | null
}

export interface OptimizationCyclePromptParams {
  mission: Mission
  kpis: MissionKPI[]
  venture: Venture
  cycleNumber: number
  cycleHistory: OptimizationCycle[]
  teamRoster: { name: string; role: string; slug: string }[]
}

// ---------------------------------------------------------------------------
// buildOrchestratorPrompt
// ---------------------------------------------------------------------------

export function buildOrchestratorPrompt(params: OrchestratorPromptParams): string {
  const { mission, kpis, venture, teamRoster, githubUrl, liveUrl } = params

  const kpiBlock = kpis.length > 0
    ? kpis.map((k) => `  - ${k.label}: current=${k.current_val ?? 'N/A'} target=${k.target_val ?? 'N/A'} (${k.unit})`).join('\n')
    : '  (none defined)'

  const teamBlock = teamRoster.map((t) => {
    const parts = [`  - ${t.name} (${t.slug}): ${t.role}`]
    if (t.platform) parts.push(`platform=${t.platform}`)
    if (t.model) parts.push(`model=${t.model}`)
    if (t.skills && t.skills.length > 0) parts.push(`skills=[${t.skills.join(', ')}]`)
    return parts.join(' | ')
  }).join('\n')

  const linksBlock = [
    githubUrl ? `  - GitHub: ${githubUrl}` : null,
    liveUrl ? `  - Live URL: ${liveUrl}` : null,
  ].filter(Boolean).join('\n') || '  (none yet — will be created)'

  return `You are the orchestrator for this mission. Plan the execution by assigning tasks to your team members in waves.

## Mission Context
- Name: ${mission.name}
- Description: ${mission.description ?? 'No description'}
- Type: ${mission.type ?? 'product'}
- Status: ${mission.status}

## KPIs
${kpiBlock}

## Venture Context
- Name: ${venture.name}
- Description: ${venture.description ?? 'No description'}
- Stage: ${venture.stage}

## Links
${linksBlock}

## Team Roster
${teamBlock}

## Platform Defaults (MANDATORY)
- Hosting: Netlify (NEVER Vercel)
- GitHub Org: bmichals25
- Stack: Next.js + TypeScript + Tailwind CSS
- Node: 22
- Export: Static export (next export / output: 'export')
- Package manager: npm

## Wave Constraints
- Wave 1 MUST include DevOps agent creating the GitHub repository and setting up Netlify continuous deployment
- Wave 2 is for development, design, and content tasks (can run in parallel)
- Wave 3 MUST include a deploy/verification step
- Each wave runs in parallel — agents within a wave execute simultaneously
- Later waves can depend on outputs of earlier waves

## Output Format
Respond in PURE JSON (no markdown, no code fences). Use this exact structure:

{
  "plan_summary": "Brief description of the overall execution plan",
  "repo_name": "suggested-repo-name",
  "waves": [
    {
      "wave_number": 1,
      "description": "Wave description",
      "tasks": [
        {
          "agent_slug": "agent-slug",
          "title": "Task title",
          "prompt": "Detailed instructions for the agent including specific deliverables and acceptance criteria"
        }
      ]
    }
  ],
  "venture_updates": {
    "stage": "building",
    "github_url": "https://github.com/bmichals25/repo-name",
    "live_url": "https://repo-name.netlify.app"
  }
}`
}

// ---------------------------------------------------------------------------
// buildAgentTaskPrompt
// ---------------------------------------------------------------------------

export function buildAgentTaskPrompt(params: AgentTaskPromptParams): string {
  const {
    agentName, agentRole, agentSlug, taskTitle, taskDescription,
    projectDir, waveNumber, venture, mission,
    repoName, githubUrl, liveUrl,
  } = params

  const contextBlock = [
    `## Agent Context`,
    `- Name: ${agentName}`,
    `- Role: ${agentRole}`,
    `- Slug: ${agentSlug}`,
    ``,
    `## Task`,
    `- Title: ${taskTitle}`,
    `- Wave: ${waveNumber}`,
    ``,
    `## Instructions`,
    taskDescription,
    ``,
    `## Venture Context`,
    `- Venture: ${venture.name}`,
    `- Description: ${venture.description ?? 'No description'}`,
    `- Stage: ${venture.stage}`,
    ``,
    `## Mission Context`,
    `- Mission: ${mission.name}`,
    `- Type: ${mission.type ?? 'product'}`,
  ]

  if (projectDir) {
    contextBlock.push(``, `## Project Directory`, `- Path: ${projectDir}`)
  }

  if (repoName) {
    contextBlock.push(`- Repo: ${repoName}`)
  }

  if (githubUrl) {
    contextBlock.push(`- GitHub: ${githubUrl}`)
  }

  if (liveUrl) {
    contextBlock.push(`- Live URL: ${liveUrl}`)
  }

  contextBlock.push(
    ``,
    `## Platform Defaults`,
    `- Hosting: Netlify (NEVER Vercel)`,
    `- GitHub Org: bmichals25`,
    `- Stack: Next.js + TypeScript + Tailwind CSS`,
    `- Node: 22`,
    `- Export: Static export`,
    `- Package manager: npm`,
    ``,
    `## Output Format`,
    `Respond in PURE JSON (no markdown, no code fences). Use this structure:`,
    ``,
    `{`,
    `  "status": "completed" | "blocked" | "needs_review",`,
    `  "summary": "Brief description of what was done",`,
    `  "files_changed": ["list", "of", "files"],`,
    `  "blockers": ["any blockers if status is blocked"],`,
    `  "notes": "Any additional notes for the orchestrator"`,
    `}`,
  )

  return contextBlock.join('\n')
}

// ---------------------------------------------------------------------------
// buildOptimizationCyclePrompt
// ---------------------------------------------------------------------------

export function buildOptimizationCyclePrompt(params: OptimizationCyclePromptParams): string {
  const { mission, kpis, venture, cycleNumber, cycleHistory, teamRoster } = params

  const kpiBlock = kpis.map((k) =>
    `  - ${k.label}: current=${k.current_val ?? 'N/A'} target=${k.target_val ?? 'N/A'} (${k.unit})`
  ).join('\n') || '  (none defined)'

  // Build cycle history table
  let historyBlock = '  (first cycle — no history yet)'
  if (cycleHistory.length > 0) {
    const rows = cycleHistory.map((c) => {
      const beforeStr = Object.entries(c.kpi_before ?? {}).map(([k, v]) => `${k}=${v}`).join(', ') || 'N/A'
      const afterStr = Object.entries(c.kpi_after ?? {}).map(([k, v]) => `${k}=${v}`).join(', ') || 'N/A'
      return `  | ${c.cycle_number} | ${c.status} | ${c.hypothesis ?? 'N/A'} | ${beforeStr} | ${afterStr} | ${c.improved ?? 'N/A'} | ${c.kept ?? 'N/A'} |`
    }).join('\n')

    historyBlock = `  | Cycle | Status | Hypothesis | Before | After | Improved | Kept |\n  |-------|--------|------------|--------|-------|----------|------|\n${rows}`
  }

  const teamBlock = teamRoster.map((t) =>
    `  - ${t.name} (${t.slug}): ${t.role}`
  ).join('\n')

  return `You are running optimization cycle #${cycleNumber} for this mission. Your goal is to improve the target metric through iterative experimentation.

## Mission Context
- Name: ${mission.name}
- Description: ${mission.description ?? 'No description'}
- Goal Metric: ${mission.goal_metric ?? 'Not specified'}
- Goal Value: ${mission.goal_value ?? 'Not specified'}
- Loop Enabled: ${mission.loop_enabled}

## Venture Context
- Name: ${venture.name}
- Stage: ${venture.stage}

## Current KPIs
${kpiBlock}

## Cycle History
${historyBlock}

## Available Team
${teamBlock}

## Process
1. MEASURE: Review current KPI values
2. HYPOTHESIZE: Based on history, propose a specific change that could improve the goal metric
3. EXECUTE: Assign tasks to team members to implement the change
4. EVALUATE: After implementation, compare KPIs before and after

## Output Format
Respond in PURE JSON (no markdown, no code fences). Use this structure:

{
  "cycle_number": ${cycleNumber},
  "hypothesis": "Specific, testable hypothesis about what change will improve the metric",
  "change_description": "Detailed description of the proposed change",
  "tasks": [
    {
      "agent_slug": "agent-slug",
      "title": "Task title",
      "prompt": "Detailed instructions for the agent"
    }
  ],
  "expected_impact": "What improvement we expect to see and by how much",
  "rollback_plan": "How to revert if the change does not improve the metric"
}`
}
