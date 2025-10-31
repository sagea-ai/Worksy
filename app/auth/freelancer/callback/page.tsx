"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { exchangeCodeForToken, fetchFreelancerProfile, type FreelancerProfile } from '@/lib/freelancer-oauth'

export default function FreelancerCallbackPage() {
  return (
    <Suspense fallback={
      <LoadingScreen 
        title="Processing OAuth callback..."
        subtitle="Please wait while we handle your authorization"
      />
    }>
      <FreelancerCallbackContent />
    </Suspense>
  );
}

function FreelancerCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state')
        }

        setStatus('processing')
        console.log('🔄 Processing Freelancer OAuth callback...')

        const tokenData = await exchangeCodeForToken(code, state)
        console.log('✅ Token exchange successful')

        const profile: FreelancerProfile = await fetchFreelancerProfile(tokenData.access_token)
        console.log('✅ Profile fetch successful:', profile.displayName)

        if (user) {
          await saveFreelancerProfile(profile, tokenData.access_token)
          console.log('✅ Profile saved to database')
        }

        setStatus('success')

        setTimeout(() => {
          router.push('/deals?connected=freelancer')
        }, 2000)

      } catch (error) {
        console.error('❌ OAuth callback error:', error)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred')
        
        setTimeout(() => {
          router.push('/onboarding?error=oauth_failed')
        }, 3000)
      }
    }

    if (searchParams.has('code') || searchParams.has('error')) {
      handleCallback()
    }
  }, [searchParams, router, user])

  const saveFreelancerProfile = async (profile: FreelancerProfile, accessToken: string) => {
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'freelancer_oauth',
          freelancerProfile: profile,
          accessToken: accessToken,
          autoFillData: {
            selectedSkills: profile.skills?.map(skill => skill.name) || [],
            experienceLevel: inferExperienceLevel(profile),
            preferredPlatforms: ['freelancer'],
            hourlyRateMin: 0, // Will be set by user later
            hourlyRateMax: 0,
            availability: 'project-based'
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile data')
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Error saving Freelancer profile:', error)
      throw error
    }
  }

  // Infer experience level based on profile data
  const inferExperienceLevel = (profile: FreelancerProfile): string => {
    // This could be enhanced with more sophisticated logic
    // For now, default to intermediate
    return 'INTERMEDIATE'
  }

  if (status === 'processing') {
    return (
      <LoadingScreen 
        title="Connecting your Freelancer account..."
        subtitle="Fetching your profile and syncing data"
      />
    )
  }

  if (status === 'success') {
    return (
      <LoadingScreen 
        title="✅ Successfully connected!"
        subtitle="Redirecting you to the dashboard..."
      />
    )
  }

  if (status === 'error') {
    return (
      <LoadingScreen 
        title="❌ Connection failed"
        subtitle={`${errorMessage}. Redirecting to manual setup...`}
      />
    )
  }

  return (
    <LoadingScreen 
      title="Processing..."
      subtitle="Please wait while we handle your request"
    />
  )
}
