"use client"

import { useEffect, useState } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { LoadingScreen } from "@/components/ui/loading-screen"

export function AuthRedirectHandler() {
  const { user, isLoaded } = useUser()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hasChecked, setHasChecked] = useState(false)
  const [redirectStatus, setRedirectStatus] = useState<'idle' | 'checking' | 'redirecting' | 'error'>('idle')

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || hasChecked) return
    
    if (pathname === '/sign-in' || pathname.startsWith('/sign-in')) {
      const timeoutId = setTimeout(() => {
        checkOnboardingStatus()
        setHasChecked(true)
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isLoaded, isSignedIn, user, pathname, hasChecked])

  const checkOnboardingStatus = async () => {
    console.log('🔍 Checking onboarding status for user:', user?.id)
    setRedirectStatus('checking')
    
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 Profile API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Profile data:', data)
        
        if (data && data.onboardingCompleted) {
          console.log('✅ User has completed onboarding, redirecting to dashboard')
          setRedirectStatus('redirecting')
          await new Promise(resolve => setTimeout(resolve, 100))
          router.push('/dashboard')
        } else {
          console.log('⏳ User exists but onboarding not completed, redirecting to onboarding')
          setRedirectStatus('redirecting')
          await new Promise(resolve => setTimeout(resolve, 100))
          router.push('/onboarding')
        }
      } else if (response.status === 404) {
        console.log('🆕 New user (404), redirecting to onboarding')
        setRedirectStatus('redirecting')
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push('/onboarding')
      } else {
        console.log('❌ API error, defaulting to onboarding')
        setRedirectStatus('redirecting')
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('💥 Error checking onboarding status:', error)
      console.log('🔄 Error occurred, defaulting to onboarding')
      setRedirectStatus('error')
      setTimeout(() => {
        router.push('/onboarding')
      }, 1000)
    }
  }

  const getLoadingMessage = () => {
    switch (redirectStatus) {
      case 'checking':
        return {
          title: "Checking your account...",
          subtitle: "Please wait while we verify your profile and setup status"
        }
      case 'redirecting':
        return {
          title: "Redirecting you...",
          subtitle: "Taking you to the right place based on your account status"
        }
      case 'error':
        return {
          title: "Something went wrong",
          subtitle: "Don't worry, we'll redirect you to complete your setup"
        }
      default:
        return null
    }
  }

  const loadingMessage = getLoadingMessage()

  // Only show loading screen when actively checking or redirecting
  if (redirectStatus !== 'idle' && loadingMessage) {
    return (
      <LoadingScreen 
        title={loadingMessage.title}
        subtitle={loadingMessage.subtitle}
      />
    )
  }

  return null
}
