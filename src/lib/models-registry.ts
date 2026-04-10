/* ── Platform registry ──────────────────────────────────────────── */

export interface Platform {
  id: string
  name: string
  color: string
  icon: string
  description: string
}

export const PLATFORMS: Platform[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    color: '#D97757',
    icon: '/platforms/claude.svg',
    description: 'Anthropic CLI agent for autonomous coding and orchestration',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    color: '#FFFFFF',
    icon: '/platforms/cursor.svg',
    description: 'AI-native code editor with inline completions and chat',
  },
  {
    id: 'openai-codex',
    name: 'OpenAI Codex',
    color: '#10B981',
    icon: '/platforms/openai.svg',
    description: 'OpenAI cloud agent for autonomous software engineering',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    color: '#4285F4',
    icon: '/platforms/gemini.svg',
    description: 'Google DeepMind multimodal AI platform',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    color: '#06B6D4',
    icon: '/platforms/windsurf.svg',
    description: 'Agentic IDE with Cascade flows and deep codebase awareness',
  },
  {
    id: 'copilot',
    name: 'Copilot',
    color: '#8B5CF6',
    icon: '/platforms/copilot.svg',
    description: 'GitHub AI pair programmer with editor and CLI integrations',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    color: '#EF4444',
    icon: '/platforms/openclaw.svg',
    description: 'Open-source autonomous coding agent',
  },
]

/** Map from display name (as stored in DB) to Platform entry */
export const PLATFORM_MAP: Record<string, Platform> = Object.fromEntries([
  ...PLATFORMS.map((p) => [p.name, p]),
  // Alias: "Copilot" is stored with short name in some places
  ['GitHub Copilot', PLATFORMS.find((p) => p.id === 'copilot')!],
])

/* ── Model registry ────────────────────────────────────────────── */

export type ModelTier = 'flagship' | 'standard' | 'fast' | 'reasoning'

export interface Model {
  id: string
  name: string
  provider: string
  tier: ModelTier
}

export const MODELS: Model[] = [
  // Anthropic
  { id: 'opus-4.6', name: 'Opus 4.6', provider: 'Claude Code', tier: 'flagship' },
  { id: 'sonnet-4.6', name: 'Sonnet 4.6', provider: 'Claude Code', tier: 'standard' },
  { id: 'haiku-4.5', name: 'Haiku 4.5', provider: 'Claude Code', tier: 'fast' },
  // OpenAI
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI Codex', tier: 'flagship' },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI Codex', tier: 'standard' },
  { id: 'o3', name: 'o3', provider: 'OpenAI Codex', tier: 'reasoning' },
  // Google
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Gemini', tier: 'flagship' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Gemini', tier: 'fast' },
]

/* ── Helpers ────────────────────────────────────────────────────── */

/** Resolve the icon path for a platform display name */
export function getPlatformIcon(platform: string): string {
  return PLATFORM_MAP[platform]?.icon ?? '/platforms/claude.svg'
}

/** Return all models available on a given platform (by display name) */
export function getModelsByPlatform(platform: string): Model[] {
  return MODELS.filter((m) => m.provider === platform)
}
