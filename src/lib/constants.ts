import type { VentureStage, MissionType } from '@/types'

/* ── Stage colors ──────────────────────────────────────────────── */

export const STAGE_COLORS: Record<VentureStage, string> = {
  idea: '#A78BFA',
  research: '#38BDF8',
  building: '#F59E0B',
  testing: '#FB923C',
  launched: '#4ADE80',
  archived: '#71717A',
}

/* ── Venture palettes ──────────────────────────────────────────── */

export const VENTURE_PALETTES: { primary: string; secondary: string }[] = [
  { primary: '#6366F1', secondary: '#4338CA' },
  { primary: '#8B5CF6', secondary: '#6D28D9' },
  { primary: '#10B981', secondary: '#047857' },
  { primary: '#3B82F6', secondary: '#1E40AF' },
  { primary: '#F59E0B', secondary: '#B45309' },
  { primary: '#06B6D4', secondary: '#0E7490' },
  { primary: '#F43F5E', secondary: '#BE123C' },
  { primary: '#D946EF', secondary: '#A21CAF' },
  { primary: '#F97316', secondary: '#C2410C' },
  { primary: '#A855F7', secondary: '#7E22CE' },
  { primary: '#EC4899', secondary: '#BE185D' },
  { primary: '#14B8A6', secondary: '#0D9488' },
  { primary: '#EF4444', secondary: '#B91C1C' },
  { primary: '#84CC16', secondary: '#4D7C0F' },
  { primary: '#22D3EE', secondary: '#0891B2' },
  { primary: '#E879F9', secondary: '#C026D3' },
  { primary: '#FB7185', secondary: '#E11D48' },
  { primary: '#FACC15', secondary: '#CA8A04' },
  { primary: '#2DD4BF', secondary: '#0F766E' },
  { primary: '#818CF8', secondary: '#6366F1' },
]

/* ── Mission type meta ─────────────────────────────────────────── */

export const MISSION_TYPE_META: Record<
  MissionType,
  { label: string; icon: string; color: string }
> = {
  product: { label: 'Product', icon: 'rocket', color: '#818CF8' },
  growth: { label: 'Growth', icon: 'trending-up', color: '#34D399' },
  infrastructure: { label: 'Infrastructure', icon: 'wrench', color: '#F59E0B' },
  research: { label: 'Research', icon: 'flask-conical', color: '#60A5FA' },
  operations: { label: 'Operations', icon: 'settings', color: '#A78BFA' },
  optimization: { label: 'Optimization', icon: 'sparkles', color: '#F472B6' },
}
