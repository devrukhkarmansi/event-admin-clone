"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useCheckIns } from "@/hooks/use-check-ins"
import { Pagination } from "@/components/ui/pagination"
import { format } from "date-fns"
import { UserAvatar } from "@/components/user-avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowUpDown, Search } from "lucide-react"
import { TableSkeleton } from "@/components/table-skeleton"
import { DateRange } from "react-day-picker"

export default function CheckInsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [filters, setFilters] = useState<{
    email: string
    sortOrder: "DESC" | "ASC"
    page: number
    limit: number
  }>({
    email: "",
    sortOrder: "DESC",
    page,
    limit
  })

  const { data: checkIns, isLoading } = useCheckIns({
    ...filters,
    page,
    limit,
    startDate: dateRange?.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)).toISOString() : undefined,
    endDate: dateRange?.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)).toISOString() : undefined
  })

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Check-ins</h1>
      </div>

      <Card>
        <CardContent>
          <div className="flex gap-4 mb-4 pt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by email"
                  value={filters.email}
                  onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range)
                    if (range?.from && range?.to) {
                      setCalendarOpen(false)
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">User</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Button 
                      variant="ghost" 
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        sortOrder: prev.sortOrder === "DESC" ? "ASC" : "DESC" 
                      }))}
                      className="flex items-center gap-2"
                    >
                      Check-in Time
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={3} rows={10} />
                ) : (
                  checkIns?.items.map((checkIn) => (
                    <tr key={checkIn.id} className="border-b">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={checkIn.user.profileImage?.url}
                            firstName={checkIn.user.firstName}
                            lastName={checkIn.user.lastName}
                          />
                          <span>
                            {checkIn.user.firstName} {checkIn.user.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">{checkIn.user.email}</td>
                      <td className="p-4">
                        {format(new Date(checkIn.createdAt), "PPP p")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {checkIns && (
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={checkIns.meta.totalPages}
                onPageChange={setPage}
                totalItems={checkIns.meta.totalItems}
                pageSize={limit}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 