import { useState } from 'react'
import { useAuth } from '../state/AuthContext'

export function AuthPage() {
  const { isConfigured, signInWithMagicLink, signInWithPassword, signUpWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  if (!isConfigured) {
    return (
      <div className="auth-shell">
        <article className="auth-card">
          <h1>Supabase Not Configured</h1>
          <p>
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment to
            enable account auth.
          </p>
          <p className="subtle">Running in local prototype mode for now.</p>
        </article>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <article className="auth-card">
        <h1>Sign in to Graft</h1>
        <p>Use your account to sync installs, updates, and plugin ownership analytics.</p>

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={8}
          />
        </label>

        <div className="auth-actions">
          <button
            className="primary"
            onClick={async () => {
              const error = await signInWithPassword(email, password)
              setNotice(error ?? 'Signed in successfully.')
            }}
          >
            Sign In
          </button>
          <button
            className="secondary"
            onClick={async () => {
              const error = await signUpWithPassword(email, password)
              setNotice(error ?? 'Check your email to confirm your account.')
            }}
          >
            Create Account
          </button>
          <button
            className="ghost"
            onClick={async () => {
              const error = await signInWithMagicLink(email)
              setNotice(error ?? 'Magic link sent to your email.')
            }}
          >
            Send Magic Link
          </button>
        </div>

        {notice ? <p className="subtle">{notice}</p> : null}
      </article>
    </div>
  )
}
