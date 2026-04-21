import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
