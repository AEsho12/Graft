import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type AuthContextValue = {
  loading: boolean
  user: User | null
  isConfigured: boolean
  signInWithPassword: (email: string, password: string) => Promise<string | null>
  signUpWithPassword: (email: string, password: string) => Promise<string | null>
  signInWithMagicLink: (email: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }
    const client = supabase

    const bootstrap = async () => {
      const {
        data: { session },
      } = await client.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    void bootstrap()

    const { data: listener } = client.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      isConfigured: isSupabaseConfigured,
      signInWithPassword: async (email: string, password: string) => {
        if (!supabase) return 'Supabase is not configured.'
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error?.message ?? null
      },
      signUpWithPassword: async (email: string, password: string) => {
        if (!supabase) return 'Supabase is not configured.'
        const { error } = await supabase.auth.signUp({ email, password })
        return error?.message ?? null
      },
      signInWithMagicLink: async (email: string) => {
        if (!supabase) return 'Supabase is not configured.'
        const { error } = await supabase.auth.signInWithOtp({ email })
        return error?.message ?? null
      },
      signOut: async () => {
        if (!supabase) return
        await supabase.auth.signOut()
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
