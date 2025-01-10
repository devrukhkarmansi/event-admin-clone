"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="fixed right-4 top-4 z-50 rounded-full bg-background p-2 shadow-md hover:bg-accent flex items-center justify-center"
    >
      <div className="relative h-5 w-5 flex items-center justify-center">
        <Sun className="absolute h-full w-full transition-all dark:scale-0" />
        <Moon className="absolute h-full w-full transition-all scale-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
} 