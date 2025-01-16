"use client"

// import { LoadingSpinner } from "./loading-spinner"

interface LoadingScreenProps {
  className?: string
}

export function LoadingScreen({ className = "" }: LoadingScreenProps) {
  return (
    <div className={`flex items-center justify-center min-h-full p-6 ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
} 