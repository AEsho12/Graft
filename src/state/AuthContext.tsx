import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AUTH_MIN_INTERVAL_MS = 2000
const authAttemptTracker = new Map<string, number>()

function checkAuthRateLimit(bucket: string): string | null {
  const now = Date.now()
  const previous = authAttemptTracker.get(bucket) ?? 0
  if (now - previous < AUTH_MIN_INTERVAL_MS) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  authAttemptTracker.set(bucket, now)
  return null
}

function validatePasswordStrength(password: string): string | null {
  const fifteenCharsRule = password.length >= 15
  const eightPlusRule = password.length >= 8 && /[0-9]/.test(password) && /[a-z]/.test(password)
  if (!fifteenCharsRule && !eightPlusRule) {
    return 'Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.'
  }
  return null
}

type AuthContextValue = {
  loading: boolean
  user: User | null
  oauthInProgress: boolean
  isConfigured: boolean
  signInWithPassword: (identifier: string, password: string) => Promise<string | null>
  signUpWithPassword: (email: string, password: string, username: string) => Promise<string | null>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<string | null>
  signInWithMagicLink: (email: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [oauthInProgress, setOauthInProgress] = useState(false)

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

    const handleDesktopOAuthCallback = async (callbackUrl: string) => {
      setOauthInProgress(true)
      try {
        const url = new URL(callbackUrl)
        const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash)

        const accessToken = hashParams.get('access_token') ?? url.searchParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token') ?? url.searchParams.get('refresh_token')

        if (accessToken && refreshToken) {
          await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          return
        }

        const code = url.searchParams.get('code')
        if (code) {
          await client.auth.exchangeCodeForSession(code)
        }
      } catch (oauthError) {
        console.error('Failed to process OAuth callback URL', oauthError)
      } finally {
        setOauthInProgress(false)
      }
    }

    const stopListeningToAuthCallback = window.graftDesktop?.onAuthCallback
      ? window.graftDesktop.onAuthCallback((callbackUrl) => {
          void handleDesktopOAuthCallback(callbackUrl)
        })
      : undefined

    const { data: listener } = client.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setOauthInProgress(false)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
      stopListeningToAuthCallback?.()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      oauthInProgress,
      isConfigured: isSupabaseConfigured,
      signInWithPassword: async (identifier: string, password: string) => {
        if (!supabase) return 'Supabase is not configured.'
        const normalizedIdentifier = identifier.trim().toLowerCase()
        const rateLimitError = checkAuthRateLimit(`signin:${normalizedIdentifier}`)
        if (rateLimitError) return rateLimitError

        let emailConfirmed = false
        let error: { message: string } | null = null

        if (normalizedIdentifier.includes('@')) {
          const response = await supabase.auth.signInWithPassword({
            email: normalizedIdentifier,
            password,
          })
          emailConfirmed = Boolean(response.data.user?.email_confirmed_at)
          error = response.error
        } else {
          const functionName = import.meta.env.VITE_AUTH_LOGIN_FUNCTION ?? 'auth-login'
          const { data: loginData, error: invokeError } = await supabase.functions.invoke(functionName, {
            body: { identifier: normalizedIdentifier, password },
          })
          if (invokeError) {
            return 'Invalid username or password.'
          }

          const accessToken = loginData?.access_token as string | undefined
          const refreshToken = loginData?.refresh_token as string | undefined
          if (!accessToken || !refreshToken) {
            return 'Invalid username or password.'
          }

          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          emailConfirmed = Boolean(sessionData.user?.email_confirmed_at)
          error = sessionError ? { message: sessionError.message } : null
        }

        if (error) return error.message
        if (!emailConfirmed) {
          await supabase.auth.signOut()
          return 'Please verify your email before signing in.'
        }
        return null
      },
      signUpWithPassword: async (email: string, password: string, username: string) => {
        if (!supabase) return 'Supabase is not configured.'
        const normalizedEmail = email.trim().toLowerCase()
        const trimmedUsername = username.trim()
        const rateLimitError = checkAuthRateLimit(`signup:${normalizedEmail}`)
        if (rateLimitError) return rateLimitError
        if (!trimmedUsername) {
          return 'Username is required.'
        }
        const usernamePattern = /^(?!-)(?!.*--)(?=.{3,24}$)[A-Za-z0-9-]+(?<!-)$/
        if (!usernamePattern.test(trimmedUsername)) {
          return 'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.'
        }
        const passwordError = validatePasswordStrength(password)
        if (passwordError) {
          return passwordError
        }

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: import.meta.env.VITE_AUTH_EMAIL_REDIRECT_TO,
          },
        })
        if (error) return error.message
        if (!data.user) return 'Unable to create user profile.'

        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: trimmedUsername,
          email: normalizedEmail,
        })

        return profileError?.message ?? null
      },
      signInWithOAuth: async (provider: 'google' | 'github') => {
        if (!supabase) return 'Supabase is not configured.'
        const envOAuthRedirect = import.meta.env.VITE_AUTH_OAUTH_REDIRECT_TO as string | undefined
        const desktopRedirectTo =
          envOAuthRedirect && envOAuthRedirect.startsWith('graft://')
            ? envOAuthRedirect
            : 'graft://auth/callback'
        const redirectTo = window.graftDesktop?.isDesktop
          ? desktopRedirectTo
          : envOAuthRedirect ?? window.location.origin
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        })
        if (error) {
          setOauthInProgress(false)
          return error.message
        }
        if (!error && data?.url) {
          setOauthInProgress(true)
          if (window.graftDesktop?.openExternal) {
            const opened = await window.graftDesktop.openExternal(data.url)
            if (!opened) {
              setOauthInProgress(false)
              return 'Unable to open browser for OAuth sign-in.'
            }
          } else {
            window.open(data.url, '_blank', 'noopener,noreferrer')
          }
        }
        return null
      },
      signInWithMagicLink: async (email: string) => {
        if (!supabase) return 'Supabase is not configured.'
        const { error } = await supabase.auth.signInWithOtp({ email })
        return error?.message ?? null
      },
      signOut: async () => {
        if (!supabase) return
        setOauthInProgress(false)
        await supabase.auth.signOut()
      },
    }),
    [loading, oauthInProgress, user],
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
