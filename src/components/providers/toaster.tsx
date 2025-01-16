"use client"

import { Toaster } from "@/components/ui/toaster"

export function ToasterContext({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
} 