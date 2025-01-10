"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  fallback?: React.ReactNode
}

export function Avatar({ src, fallback = <User />, className, ...props }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false)

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt="Profile"
          fill
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          {fallback}
        </div>
      )}
    </div>
  )
} 