import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

export interface ChartConfig {
  type?:
    | "line"
    | "area"
    | "bar"
    | "scatter"
    | "pie"
    | "radar"
    | "composed"
  dataKey?: string
  stroke?: string
  fill?: string
  name?: string
  label?: string
  color?: string
  [key: string]: any
}

export interface ChartProps extends React.ComponentProps<"div"> {
  data: Array<Record<string, any>>
  config: ChartConfig[]
  hideAxes?: boolean
  hideLegend?: boolean
  hideTooltip?: boolean
  hideGrid?: boolean
  hideResponsiveContainer?: boolean
  children?: React.ReactNode
}

const ChartContext = React.createContext<{
  config: ChartConfig[]
}>({
  config: [],
})

export const Chart = ({
  className,
  data,
  config,
  hideAxes,
  hideLegend,
  hideTooltip,
  hideGrid,
  hideResponsiveContainer,
  children,
  ...props
}: ChartProps) => {
  const ChartComponent = getChartComponent(config[0]?.type)

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("w-full", className)} {...props}>
        {hideResponsiveContainer ? (
          <ChartComponent data={data}>
            {!hideGrid && <CartesianGrid strokeDasharray="3 3" />}
            {!hideAxes && <XAxis dataKey={config[0]?.dataKey || "name"} />}
            {!hideAxes && <YAxis />}
            {!hideTooltip && <Tooltip />}
            {!hideLegend && <Legend />}
            {children}
          </ChartComponent>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ChartComponent data={data}>
              {!hideGrid && <CartesianGrid strokeDasharray="3 3" />}
              {!hideAxes && <XAxis dataKey={config[0]?.dataKey || "name"} />}
              {!hideAxes && <YAxis />}
              {!hideTooltip && <Tooltip />}
              {!hideLegend && <Legend content={<ChartLegendContent />} />}
              {children}
            </ChartComponent>
          </ResponsiveContainer>
        )}
    </div>
    </ChartContext.Provider>
  )
}

Chart.displayName = "Chart"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    // Add chart-specific props
    payload?: Array<{
      value: string
      type: string
      color: string
    }>
    active?: boolean
    label?: string
  }
>(({ className, hideLabel, hideIndicator, payload, nameKey, labelKey, ...props }, ref) => {
  const { config } = useChart()

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
        const key = `${nameKey || item.value || item.type || "key"}-${index}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={key}
            className={cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            )}
          >
            {!hideIndicator && (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {!hideLabel && itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})

ChartLegendContent.displayName = "ChartLegendContent"

const ChartLine = ({ config }: { config: ChartConfig }) => {
  return <Line type="monotone" dataKey={config.dataKey} stroke={config.stroke} />
}

ChartLine.displayName = "ChartLine"

const ChartArea = ({ config }: { config: ChartConfig }) => {
  return (
    <Area type="monotone" dataKey={config.dataKey} stroke={config.stroke} fill={config.fill} />
  )
}

ChartArea.displayName = "ChartArea"

const ChartBar = ({ config }: { config: ChartConfig }) => {
  return <Bar dataKey={config.dataKey} fill={config.fill} />
}

ChartBar.displayName = "ChartBar"

const ChartScatter = ({ config }: { config: ChartConfig }) => {
  return <Scatter dataKey={config.dataKey} fill={config.fill} />
}

ChartScatter.displayName = "ChartScatter"

const ChartPie = ({ config }: { config: ChartConfig }) => {
  return (
    <Pie dataKey={config.dataKey} nameKey={config.name} cx="50%" cy="50%" outerRadius={80} fill={config.fill}>
      {config.data?.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={config.colors[index % config.colors.length]} />
      ))}
    </Pie>
  )
}

ChartPie.displayName = "ChartPie"

const ChartRadar = ({ config }: { config: ChartConfig }) => {
  return (
    <RadarChart outerRadius={90} data={config.data}>
      <PolarGrid />
      <PolarAngleAxis dataKey={config.dataKey} />
      <Radar dataKey={config.dataKey} stroke={config.stroke} fill={config.fill} fillOpacity={0.6} />
    </RadarChart>
  )
}

ChartRadar.displayName = "ChartRadar"

const ChartComposed = ({ config }: { config: ChartConfig }) => {
  return (
    <ComposedChart data={config.data}>
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis dataKey={config.dataKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" />
      <Bar dataKey="pv" barSize={20} fill="#413ea0" />
      <Line type="monotone" dataKey="uv" stroke="#ff7300" />
      <Scatter dataKey="cnt" fill="red" />
    </ComposedChart>
  )
}

ChartComposed.displayName = "ChartComposed"

const getChartComponent = (type: ChartConfig["type"] = "line") => {
  switch (type) {
    case "line":
      return LineChart
    case "area":
      return AreaChart
    case "bar":
      return BarChart
    case "scatter":
      return Scatter
    case "pie":
      return PieChart
    case "radar":
      return RadarChart
    case "composed":
      return ComposedChart
    default:
      return LineChart
  }
}

export const useChart = () => {
  return React.useContext(ChartContext)
}

const getPayloadConfigFromPayload = (
  config: ChartConfig[],
  item: { value: string; type: string; color: string },
  key: string
) => {
  return config.find((c) => c.dataKey === item.value)
}
