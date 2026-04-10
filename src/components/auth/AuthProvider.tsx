// ---------------------------------------------------------------------------
// AuthProvider — wraps app, provides auth context, handles route protection
// ---------------------------------------------------------------------------

import { createContext, useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, type AuthState } from '@/lib/hooks/use-auth'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextValue extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider')
  return ctx
}

/** Wrap around routes that require authentication */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

/** Helper to get user ID from context (non-hook version for mutations) */
export function getUserId(user: User | null): string {
  if (!user) throw new Error('Not authenticated')
  return user.id
}
