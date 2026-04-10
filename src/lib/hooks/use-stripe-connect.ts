// ---------------------------------------------------------------------------
// TanStack Query hooks for Stripe Connect — platform marketplace payments
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'
import type { UserProfile, VentureRevenue, PlatformSettings } from '@/types'

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

export const stripeKeys = {
  profile: ['stripe', 'profile'] as const,
  revenue: (ventureId: string) => ['stripe', 'revenue', ventureId] as const,
  platformRevenue: ['stripe', 'platform-revenue'] as const,
  platformSettings: ['stripe', 'settings'] as const,
}

// ---------------------------------------------------------------------------
// User Profile (with Stripe Connect status)
// ---------------------------------------------------------------------------

/** Fetch current user's profile (creates one if missing) */
export function useUserProfile() {
  return useQuery<UserProfile | null>({
    queryKey: stripeKeys.profile,
    queryFn: async () => {
      const userId = await getCurrentUserId()

      // Try to fetch existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      if (data) return data as UserProfile

      // Auto-create profile if missing
      const { data: newProfile, error: createErr } = await supabase
        .from('user_profiles')
        .insert({ user_id: userId })
        .select()
        .single()

      if (createErr) throw createErr
      return newProfile as UserProfile
    },
  })
}

/** Update user's Stripe Connect status (called after Stripe OAuth callback) */
export function useUpdateStripeConnect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      stripe_account_id: string
      stripe_onboarded?: boolean
      stripe_charges_enabled?: boolean
      stripe_payouts_enabled?: boolean
    }) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('user_profiles')
        .update(input)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data as UserProfile
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stripeKeys.profile })
    },
  })
}

// ---------------------------------------------------------------------------
// Revenue Tracking
// ---------------------------------------------------------------------------

/** Fetch revenue history for a venture */
export function useVentureRevenue(ventureId: string | null) {
  return useQuery<VentureRevenue[]>({
    queryKey: ventureId ? stripeKeys.revenue(ventureId) : ['stripe', 'revenue', 'none'],
    enabled: !!ventureId,
    queryFn: async () => {
      if (!ventureId) return []
      const { data, error } = await supabase
        .from('venture_revenue')
        .select('*')
        .eq('venture_id', ventureId)
        .order('period_start', { ascending: false })
        .limit(52) // ~1 year of weekly data

      if (error) throw error
      return data as VentureRevenue[]
    },
  })
}

/** Fetch total platform revenue (admin only) */
export function usePlatformRevenue() {
  return useQuery<{ total_gross: number; total_fees: number; venture_count: number }>({
    queryKey: stripeKeys.platformRevenue,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venture_revenue')
        .select('gross_revenue, platform_fee, venture_id')

      if (error) throw error

      const rows = data ?? []
      const ventures = new Set(rows.map((r) => r.venture_id))
      return {
        total_gross: rows.reduce((s, r) => s + r.gross_revenue, 0),
        total_fees: rows.reduce((s, r) => s + r.platform_fee, 0),
        venture_count: ventures.size,
      }
    },
  })
}

// ---------------------------------------------------------------------------
// Platform Settings
// ---------------------------------------------------------------------------

export function usePlatformSettings() {
  return useQuery<Record<string, unknown>>({
    queryKey: stripeKeys.platformSettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')

      if (error) throw error
      const settings: Record<string, unknown> = {}
      for (const row of data as PlatformSettings[]) {
        settings[row.key] = row.value
      }
      return settings
    },
  })
}
