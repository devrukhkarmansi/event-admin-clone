"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { LoadingSpinner } from "./loading-spinner"
import { UploadCloud } from "lucide-react"

interface FileUploadProps {
  onChange: (file: File | null) => void
  accept?: string
  value?: string
  loading?: boolean
  className?: string
  disabled?: boolean
}

export function FileUpload({
  onChange,
  accept = "image/*",
  value,
  loading,
  className,
  disabled
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onChange(file)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      onChange(file)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted p-6 transition-colors",
        isDragging && "border-primary bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        className="hidden"
        disabled={disabled || loading}
      />

      {value ? (
        <div className="relative h-32 w-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-full w-full rounded-lg object-cover"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute -right-2 -top-2"
            onClick={() => onChange(null)}
            disabled={disabled || loading}
          >
            ×
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2">
            {loading ? (
              <LoadingSpinner className="h-10 w-10 text-muted-foreground" />
            ) : (
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || loading}
          >
            Select File
          </Button>
        </>
      )}
    </div>
  )
} 