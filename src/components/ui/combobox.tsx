"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "./input"
import { ScrollArea } from "./scroll-area"

interface ComboboxOption {
  label: string
  value: string
  description?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  loading?: boolean
  onSearch?: (query: string) => void
}

export function Combobox({
  options = [],
  value,
  onChange,
  placeholder = "Select option...",
  loading,
  onSearch
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value
    setSearchValue(search)
    onSearch?.(search)
  }

  // Add this for debugging
  React.useEffect(() => {
    console.log('Combobox value:', value)
    console.log('Combobox options:', options)
  }, [value, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          type="button"
        >
          {value && options.length > 0
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col gap-2 p-2">
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearch}
            className="h-9"
          />
          <ScrollArea className="h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : options.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {options.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    className="justify-between w-full"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-sm text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {value === option.value && (
                      <Check className="ml-auto h-4 w-4 shrink-0" />
                    )}
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
} 