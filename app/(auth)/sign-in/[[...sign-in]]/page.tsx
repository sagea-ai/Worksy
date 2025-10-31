"use client"

import { SignIn } from '@clerk/nextjs'
import { AuthRedirectHandler } from '@/components/auth-redirect-handler'

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <AuthRedirectHandler />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Worksy</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new one</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
              footerActionLink: 'text-primary hover:text-primary/90',
              card: 'shadow-lg border-0',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
            }
          }}
          forceRedirectUrl="/sign-in"
          signUpForceRedirectUrl="/sign-in"
        />
      </div>
    </div>
  )
}
