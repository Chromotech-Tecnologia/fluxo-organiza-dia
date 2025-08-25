
"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, any>
    children: React.ComponentProps<typeof ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  
  return (
    <div
      ref={ref}
      data-chart={id || uniqueId}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <ChartStyle id={id || uniqueId} config={config} />
      <ResponsiveContainer>
        {children}
      </ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: Record<string, any> }) => {
  const colorConfig = Object.entries(config).reduce((styles, [key, value]) => {
    if (value?.color || value?.theme) {
      const colorValue = value.color || `hsl(var(--chart-${key.replace(/[^a-zA-Z0-9]/g, '')}))`
      styles[`--color-${key}`] = colorValue
    }
    return styles
  }, {} as Record<string, string>)

  return (
    <style>
      {`
        [data-chart="${id}"] {
          ${Object.entries(colorConfig)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n          ')}
        }
      `}
    </style>
  )
}

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background p-2 shadow-md",
        className
      )}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(({ active, payload, label, hideLabel, hideIndicator, indicator = "dot", nameKey, labelKey, className, ...props }, ref) => {
  const tooltipLabel = labelKey && payload?.[0]?.payload ? payload[0].payload[labelKey] : label

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("grid gap-2 rounded-lg border bg-background p-2 shadow-md", className)}
      {...props}
    >
      {!hideLabel && tooltipLabel && (
        <div className="text-xs font-medium text-muted-foreground">
          {tooltipLabel}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const itemConfig = item.payload
          const indicatorColor = item.color || `var(--color-${item.dataKey})`
          
          return (
            <div key={item.dataKey || index} className="flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
              {!hideIndicator && (
                <div 
                  className={cn(
                    "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                    {
                      "h-2.5 w-2.5": indicator === "dot",
                      "w-1": indicator === "line",
                      "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed"
                    }
                  )}
                  style={{
                    "--color-bg": indicatorColor,
                    "--color-border": indicatorColor,
                  } as React.CSSProperties}
                />
              )}
              <div className="flex flex-1 justify-between leading-none">
                <div className="grid gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {nameKey && itemConfig ? itemConfig[nameKey] : item.name}
                  </span>
                </div>
                <span className="font-mono text-xs text-foreground tabular-nums">
                  {item.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: Array<any>
    nameKey?: string
  }
>(({ className, payload, nameKey, ...props }, ref) => {
  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", className)}
      {...props}
    >
      {payload.map((item, index) => {
        return (
          <div key={item.value || index} className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground">
            <div 
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: item.color,
              }}
            />
            <span className="text-xs text-muted-foreground">
              {nameKey && item.payload ? item.payload[nameKey] : item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
}
