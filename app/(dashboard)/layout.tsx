"use client"

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard-layout"
import { LoadingScreen } from "@/components/ui/loading-screen"

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user) return

    // Don't check if we're on onboarding page
    if (pathname.startsWith('/onboarding')) {
      setIsCheckingOnboarding(false)
      setOnboardingComplete(true) 
      return
    }

    const checkOnboardingForDashboard = async () => {
      try {
        console.log('🏥 Dashboard layout checking onboarding status...')
        const response = await fetch('/api/profile')
        
        if (response.status === 404) {
          console.log('🆕 New user accessing dashboard, redirecting to onboarding')
          router.push('/onboarding')
          return
        } else if (response.ok) {
          const data = await response.json()
          if (data && !data.onboardingCompleted) {
            console.log('⏳ User onboarding incomplete, redirecting to onboarding')
            router.push('/onboarding')
            return
          } else {
            console.log('✅ User onboarding complete, allowing dashboard access')
            setOnboardingComplete(true)
          }
        }
      } catch (error) {
        console.error('💥 Error checking onboarding in dashboard layout:', error)
        router.push('/onboarding')
        return
      } finally {
        setIsCheckingOnboarding(false)
      }
    }

    checkOnboardingForDashboard()
  }, [isLoaded, user, pathname, router])

  if (!isLoaded) {
    return (
      <LoadingScreen 
        title="Authenticating..."
        subtitle="Please wait while we verify your account"
      />
    )
  }

  if (isCheckingOnboarding) {
    return (
      <LoadingScreen 
        title="Loading your workspace..."
        subtitle="Checking your profile and preparing your dashboard"
      />
    )
  }

  if (!onboardingComplete) {
    return (
      <LoadingScreen 
        title="Setting up your experience..."
        subtitle="Redirecting you to complete your profile setup"
      />
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
