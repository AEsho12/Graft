import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
