// ---------------------------------------------------------------------------
// Supabase Auth hooks — session management, login, signup, logout
// ---------------------------------------------------------------------------

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

/** Reactive auth state — listens to Supabase auth changes */
export function useAuth(): AuthState & {
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
} {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { ...state, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }
}

/** Get the current user ID — throws if not authenticated */
export function useUserId(): string {
  const { user } = useAuth()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

/** Synchronously get user ID from the Supabase session (for use in mutation fns) */
export async function getCurrentUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')
  return session.user.id
}
