import { GalleryVerticalEnd } from 'lucide-react'
import heroImage from '@/assets/hero.png'
import { LoginForm } from '@/components/login-form'
import { useAuth } from '@/state/AuthContext'

export function AuthPage() {
  const { isConfigured } = useAuth()

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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Graft
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={heroImage}
          alt="Workspace preview"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
