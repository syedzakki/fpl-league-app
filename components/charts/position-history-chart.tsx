"use client"

import * as React from "react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Trophy } from "lucide-react"

interface PositionHistoryData {
  gameweek: number
  [playerName: string]: number
}

interface PositionHistoryChartProps {
  data: PositionHistoryData[]
  players: string[]
}

const PLAYER_COLORS: Record<string, string> = {
  "Wasim": "#4DAA57",
  "Anuj": "#1BE7FF",
  "Chiru": "#F7E733",
  "Zakki": "#FF3A20",
  "Tejas": "#a855f7",
  "Sunad": "#ec4899",
}

const DEFAULT_COLORS = ["#4DAA57", "#1BE7FF", "#F7E733", "#FF3A20", "#a855f7", "#ec4899"]

const getOrdinal = (n: number) => {
  const suffixes = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => a.value - b.value)
    return (
      <div className="bg-[#2B2D42] p-3 rounded-lg shadow-lg border border-[#3d3f56] text-xs">
        <p className="font-bold mb-2 flex items-center gap-1 text-white">
          <Trophy className="w-3 h-3 text-[#F7E733]" /> GW {label}
        </p>
        {sortedPayload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-300">{entry.name}</span>
            </div>
            <Badge variant="outline" className="text-[10px] px-1 py-0 border-[#3d3f56] text-gray-300">{getOrdinal(entry.value)}</Badge>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-3 mt-3">
    {payload?.map((entry: any) => (
      <div key={entry.value} className="flex items-center gap-1.5 text-xs">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-gray-300">{entry.value}</span>
      </div>
    ))}
  </div>
)

export function PositionHistoryChart({ data, players }: PositionHistoryChartProps) {
  return (
    <Card className="bg-[#2B2D42] border-[#3d3f56]">
      <CardHeader className="py-4 px-5 border-b border-[#3d3f56]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#F7E733]" />
              <CardTitle className="text-base text-white">Position History</CardTitle>
            </div>
            <CardDescription className="text-xs text-gray-400">Rankings over gameweeks</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs border-[#3d3f56] text-gray-400">{data.length} GWs</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3d3f56" />
              <XAxis 
                dataKey="gameweek" 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={false}
                stroke="#3d3f56"
              />
              <YAxis 
                reversed 
                domain={[1, 6]}
                ticks={[1, 2, 3, 4, 5, 6]}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={false}
                tickFormatter={(v) => getOrdinal(v)}
                width={30}
                stroke="#3d3f56"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <ReferenceLine y={1} stroke="#F7E733" strokeDasharray="5 5" strokeOpacity={0.3} />
              
              {players.map((player, index) => (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  name={player}
                  stroke={PLAYER_COLORS[player] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: PLAYER_COLORS[player] || DEFAULT_COLORS[index], strokeWidth: 1, stroke: '#2B2D42' }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#2B2D42' }}
                  animationDuration={1200}
                  animationBegin={index * 150}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Position Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
          {players.map((player, index) => {
            const firstPos = data[0]?.[player] || 0
            const lastPos = data[data.length - 1]?.[player] || 0
            const change = firstPos - lastPos
            
            return (
              <div 
                key={player}
                className="p-2 rounded-lg text-center bg-[#3d3f56]/30 text-xs border border-[#3d3f56]"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PLAYER_COLORS[player] || DEFAULT_COLORS[index] }}
                  />
                  <span className="font-medium truncate text-white">{player}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-gray-400">{getOrdinal(lastPos)}</span>
                  {change !== 0 && (
                    <Badge 
                      variant="outline"
                      className={`text-[9px] px-1 py-0 border-[#3d3f56] ${change > 0 ? "text-[#4DAA57]" : "text-[#FF3A20]"}`}
                    >
                      {change > 0 ? "↑" : "↓"}{Math.abs(change)}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
