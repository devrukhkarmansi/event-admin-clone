"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { LoadingSpinner } from "./loading-spinner"
import { UploadCloud } from "lucide-react"
import { X } from "lucide-react"

interface FileUploadProps {
  onChange: (file: File | null) => void
  accept?: string
  value?: string | string[]
  multiple?: boolean
  loading?: boolean
  className?: string
  disabled?: boolean
}

export function FileUpload({
  onChange,
  multiple = false,
  accept = "image/*",
  value,
  loading,
  className,
  disabled
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (files: FileList | null) => {
    if (!files?.length) {
      onChange(null)
      return
    }

    const fileArray = Array.from(files).filter(file => 
      file.type.startsWith("image/")
    )

    if (!fileArray.length) {
      onChange(null)
      return
    }

    // If multiple, handle in parent component
    onChange(fileArray[0])
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

    handleFileChange(e.dataTransfer.files)
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
        multiple={multiple}
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
        disabled={disabled || loading}
      />

      {value ? (
        <div className={cn("w-full", multiple ? "grid grid-cols-2 gap-4" : "relative h-32")}>
          {(Array.isArray(value) ? value : [value]).map((url, i) => (
            <div key={i} className="relative h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Preview"
                className="h-full w-full rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full shadow-lg hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onChange(null)}
                disabled={disabled || loading}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ))}
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
            Select File{multiple && 's'}
          </Button>
        </>
      )}
    </div>
  )
} 