"use client"

import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  title?: string
  subtitle?: string
  className?: string
}

export function LoadingScreen({ 
  title = "Loading...", 
  subtitle,
  className 
}: LoadingScreenProps) {
  return (
    <div className={cn(
      "flex items-center justify-center min-h-screen bg-background",
      className
    )}>
      <div className="flex flex-col items-center space-y-4 text-center">
        {/* Animated spinner */}
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="animate-ping absolute top-0 left-0 h-12 w-12 rounded-full border border-primary/20"></div>
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-semibold text-foreground">
          {title}
        </h2>
        
        {/* Subtitle */}
        {subtitle && (
          <p className="text-muted-foreground max-w-md">
            {subtitle}
          </p>
        )}
        
        {/* Pulsing dots animation */}
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}
