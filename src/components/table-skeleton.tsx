import { Skeleton } from "./ui/skeleton"

interface TableSkeletonProps {
  columns: number
  rows: number
}

export function TableSkeleton({ columns, rows }: TableSkeletonProps) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              <Skeleton className="h-8 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
} 