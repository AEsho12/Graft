import { AlertTriangle, GalleryVerticalEnd } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/icons/google-icon"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/state/AuthContext"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signInWithOAuth, signUpWithPassword, oauthInProgress } = useAuth()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailBlankError, setEmailBlankError] = useState(false)
  const [passwordBlankError, setPasswordBlankError] = useState(false)
  const [usernameBlankError, setUsernameBlankError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    const isEmailBlank = !email.trim()
    const isPasswordBlank = !password.trim()
    const isUsernameBlank = !username.trim()
    setEmailBlankError(isEmailBlank)
    setPasswordBlankError(isPasswordBlank)
    setUsernameBlankError(isUsernameBlank)
    if (isEmailBlank || isPasswordBlank || isUsernameBlank) return
    setIsSubmitting(true)
    const authError = await signUpWithPassword(email, password, username)
    setIsSubmitting(false)
    if (authError) {
      setError(authError)
      return
    }
    setSuccess('Account created. Check your email to verify your account before signing in.')
  }

  const onOAuthSignIn = async (provider: 'google' | 'github') => {
    setError(null)
    const authError = await signInWithOAuth(provider)
    if (authError) {
      setError(authError)
    }
  }

  const onPasswordBlur = () => {
    setPasswordBlankError(!password.trim())
  }

  const onEmailBlur = () => {
    setEmailBlankError(!email.trim())
  }

  const onUsernameBlur = () => {
    setUsernameBlankError(!username.trim())
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
            <FieldDescription>
              Already have an account? <Link to="/login">Sign in</Link>
            </FieldDescription>
          </div>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button
              className="h-10 w-full rounded-md border border-input bg-background hover:bg-muted"
              variant="outline"
              type="button"
              onClick={() => void onOAuthSignIn('google')}
            >
              <GoogleIcon className="size-4" />
              Continue with Google
            </Button>
            <Button
              className="h-10 w-full rounded-md border border-input bg-background hover:bg-muted"
              variant="outline"
              type="button"
              onClick={() => void onOAuthSignIn('github')}
            >
              <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12 .5C5.648.5.5 5.648.5 12A11.5 11.5 0 0 0 8.356 22.93c.575.106.785-.25.785-.555 0-.274-.01-1-.016-1.962-3.197.695-3.872-1.54-3.872-1.54-.523-1.326-1.277-1.679-1.277-1.679-1.044-.714.079-.699.079-.699 1.154.08 1.761 1.186 1.761 1.186 1.026 1.758 2.692 1.25 3.348.956.104-.743.402-1.25.731-1.538-2.552-.29-5.236-1.276-5.236-5.68 0-1.255.449-2.28 1.184-3.083-.119-.29-.513-1.46.112-3.044 0 0 .965-.31 3.163 1.178A10.977 10.977 0 0 1 12 6.082c.973.004 1.954.132 2.87.387 2.196-1.488 3.16-1.178 3.16-1.178.627 1.585.233 2.755.114 3.044.737.803 1.183 1.828 1.183 3.083 0 4.415-2.689 5.386-5.25 5.67.413.356.78 1.058.78 2.133 0 1.54-.014 2.78-.014 3.157 0 .308.207.666.79.553A11.502 11.502 0 0 0 23.5 12C23.5 5.648 18.352.5 12 .5Z"
                  fill="currentColor"
                />
              </svg>
              Continue with GitHub
            </Button>
          </Field>
          {oauthInProgress ? (
            <FieldDescription className="text-center">
              Signing you in from browser...
            </FieldDescription>
          ) : null}
          <FieldSeparator>Or</FieldSeparator>
          <Field>
            <FieldLabel htmlFor="email" className="gap-0">
              Email<span aria-hidden="true" className="align-super text-xs leading-none">*</span>
            </FieldLabel>
            <Input
              className={cn(
                "h-10 rounded-md border border-input bg-background px-3 text-sm",
                emailBlankError && "border-destructive ring-1 ring-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/60"
              )}
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (event.target.value.trim()) setEmailBlankError(false)
              }}
              onBlur={onEmailBlur}
              aria-invalid={emailBlankError}
              required
            />
            {emailBlankError ? (
              <FieldError className="-mt-1 -mb-1">
                <span className="inline-flex items-center gap-2 leading-none">
                  <AlertTriangle className="size-4 shrink-0 align-middle text-foreground" />
                  <span className="align-middle">Email cannot be blank</span>
                </span>
              </FieldError>
            ) : null}
          </Field>
          <Field className="gap-0.5">
            <FieldLabel htmlFor="password" className="gap-0">
              Password<span aria-hidden="true" className="align-super text-xs leading-none">*</span>
            </FieldLabel>
            <Input
              className={cn(
                "h-10 rounded-md border border-input bg-background px-3 text-sm",
                passwordBlankError && "border-destructive ring-1 ring-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/60"
              )}
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (event.target.value.trim()) setPasswordBlankError(false)
              }}
              onBlur={onPasswordBlur}
              aria-invalid={passwordBlankError}
              required
            />
            {passwordBlankError ? (
              <FieldError className="-mt-1 -mb-1">
                <span className="inline-flex items-center gap-2 leading-none">
                  <AlertTriangle className="size-4 shrink-0 align-middle text-foreground" />
                  <span className="align-middle">Password cannot be blank</span>
                </span>
              </FieldError>
            ) : null}
            <FieldDescription style={{ marginTop: '-13px' }}>
              Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="username" className="gap-0">
              Username<span aria-hidden="true" className="align-super text-xs leading-none">*</span>
            </FieldLabel>
            <Input
              className={cn(
                "h-10 rounded-md border border-input bg-background px-3 text-sm",
                usernameBlankError && "border-destructive ring-1 ring-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/60"
              )}
              id="username"
              type="text"
              placeholder="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                if (event.target.value.trim()) setUsernameBlankError(false)
              }}
              onBlur={onUsernameBlur}
              aria-invalid={usernameBlankError}
              required
            />
            {usernameBlankError ? (
              <FieldError className="-mt-1 -mb-1">
                <span className="inline-flex items-center gap-2 leading-none">
                  <AlertTriangle className="size-4 shrink-0 align-middle text-foreground" />
                  <span className="align-middle">Username cannot be blank</span>
                </span>
              </FieldError>
            ) : null}
            <FieldDescription>
              Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.
            </FieldDescription>
          </Field>
          {error ? <FieldError>{error}</FieldError> : null}
          {success ? <FieldDescription>{success}</FieldDescription> : null}
          <Field>
            <Button
              className="h-10 w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              type="submit"
              disabled={isSubmitting}
            >
              Create Account
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
