import * as React from "react"
import { cn } from "@/lib/utils"

interface DualColorProgressProps {
  className?: string;
  completedValue: number; // 0-100 for green portion
  notCompletedValue: number; // 0-100 for red portion
  pendingValue: number; // 0-100 for gray portion (pending items)
}

const DualColorProgress = React.forwardRef<
  HTMLDivElement,
  DualColorProgressProps
>(({ className, completedValue = 0, notCompletedValue = 0, pendingValue = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    {/* Green portion (completed items) */}
    <div
      className="absolute left-0 top-0 h-full bg-green-500 transition-all"
      style={{ width: `${completedValue}%` }}
    />
    {/* Red portion (not completed items) */}
    <div
      className="absolute top-0 h-full bg-red-500 transition-all"
      style={{ 
        left: `${completedValue}%`,
        width: `${notCompletedValue}%`
      }}
    />
    {/* Gray portion (pending items) */}
    <div
      className="absolute top-0 h-full bg-muted transition-all"
      style={{ 
        left: `${completedValue + notCompletedValue}%`,
        width: `${pendingValue}%`
      }}
    />
  </div>
))
DualColorProgress.displayName = "DualColorProgress"

export default DualColorProgress