"use client"

import * as React from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Crown, Skull, TrendingUp, Target } from "lucide-react"

interface LeagueStats {
  teamName: string
  gwWins: number
  secondFinishes: number
  lastFinishes: number
  captaincyWins: number
  totalPoints: number
  averagePoints: number
}

interface LeagueComparisonChartProps {
  stats: LeagueStats[]
  completedGWs: number
}

const PLAYER_COLORS: Record<string, string> = {
  "Wasim": "#4DAA57",
  "Anuj": "#1BE7FF",
  "Chiru": "#F7E733",
  "Zakki": "#FF3A20",
  "Tejas": "#a855f7",
  "Sunad": "#ec4899",
}

const getColor = (name: string, index: number) => {
  return PLAYER_COLORS[name] || ["#4DAA57", "#1BE7FF", "#F7E733", "#FF3A20", "#a855f7", "#ec4899"][index % 6]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#2B2D42] p-2 rounded shadow-lg border border-[#3d3f56] text-xs">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }} />
          <span className="font-bold text-white">{data.name}</span>
        </div>
        <div className="text-lg font-bold" style={{ color: payload[0].fill }}>{payload[0].value}</div>
      </div>
    )
  }
  return null
}

function MetricBar({ data, dataKey, title, icon: Icon, color }: { 
  data: any[], dataKey: string, title: string, icon: any, color: string 
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-xs font-semibold text-white">{title}</span>
      </div>
      <div className="h-[130px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 15, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3d3f56" />
            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey={dataKey} radius={[0, 3, 3, 0]} maxBarSize={16}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.name, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ProgressBar({ data, metric, label, icon: Icon, color, suffix = "" }: { 
  data: LeagueStats[], metric: keyof LeagueStats, label: string, icon: any, color: string, suffix?: string 
}) {
  const maxValue = Math.max(...data.map(d => Number(d[metric]) || 0), 1)
  const sortedData = [...data].sort((a, b) => Number(b[metric]) - Number(a[metric]))
  
  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-xs font-semibold text-white">{label}</span>
      </div>
      <div className="space-y-1.5">
        {sortedData.map((player, idx) => {
          const value = Number(player[metric]) || 0
          const percentage = (value / maxValue) * 100
          const playerColor = getColor(player.teamName, idx)
          
          return (
            <div key={player.teamName} className="group">
              <div className="flex items-center justify-between text-xs mb-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: playerColor }} />
                  <span className="font-medium text-gray-300">{player.teamName}</span>
                  {idx === 0 && <span className="text-[10px]">🔥</span>}
                </div>
                <span className="font-bold font-mono" style={{ color: playerColor }}>{value}{suffix}</span>
              </div>
              <div className="h-1.5 bg-[#3d3f56] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: playerColor, opacity: 0.85 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LeagueComparisonChart({ stats, completedGWs }: LeagueComparisonChartProps) {
  const gwWinsData = stats.map(s => ({ name: s.teamName, value: s.gwWins })).sort((a, b) => b.value - a.value)
  const captaincyData = stats.map(s => ({ name: s.teamName, value: s.captaincyWins })).sort((a, b) => b.value - a.value)
  const secondPlaceData = stats.map(s => ({ name: s.teamName, value: s.secondFinishes })).sort((a, b) => b.value - a.value)
  const lastPlaceData = stats.map(s => ({ name: s.teamName, value: s.lastFinishes })).sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-4">
      {/* Points Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="p-3 bg-[#2B2D42] border-[#3d3f56]">
          <ProgressBar data={stats} metric="totalPoints" label="Total Points" icon={TrendingUp} color="text-[#F7E733]" suffix=" pts" />
        </Card>
        <Card className="p-3 bg-[#2B2D42] border-[#3d3f56]">
          <ProgressBar data={stats} metric="averagePoints" label="Average Points" icon={Target} color="text-[#1BE7FF]" />
        </Card>
      </div>

      {/* Performance Breakdown */}
      <Card className="bg-[#2B2D42] border-[#3d3f56]">
        <CardHeader className="py-2 px-3 border-b border-[#3d3f56]">
          <CardTitle className="text-sm flex items-center gap-1 text-white">
            <Trophy className="w-4 h-4 text-[#F7E733]" /> Performance Breakdown
          </CardTitle>
          <CardDescription className="text-xs text-gray-400">Hover for details</CardDescription>
        </CardHeader>
        <CardContent className="py-2 px-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricBar data={gwWinsData} dataKey="value" title="GW Wins" icon={Trophy} color="text-[#F7E733]" />
            <MetricBar data={captaincyData} dataKey="value" title="Captaincy" icon={Crown} color="text-[#4DAA57]" />
            <MetricBar data={secondPlaceData} dataKey="value" title="2nd Place" icon={Medal} color="text-[#1BE7FF]" />
            <MetricBar data={lastPlaceData} dataKey="value" title="Last Place" icon={Skull} color="text-[#FF3A20]" />
          </div>
        </CardContent>
      </Card>

      {/* Win Rate Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {stats
          .map(s => ({
            ...s,
            winRate: ((s.gwWins / completedGWs) * 100).toFixed(0),
            podiumRate: (((s.gwWins + s.secondFinishes) / completedGWs) * 100).toFixed(0),
            lastRate: ((s.lastFinishes / completedGWs) * 100).toFixed(0),
          }))
          .sort((a, b) => Number(b.winRate) - Number(a.winRate))
          .map((player, idx) => (
            <Card 
              key={player.teamName}
              className="p-2 bg-[#2B2D42] border-[#3d3f56] hover:border-[#F7E733]/30 transition-all"
              style={{ borderTopColor: getColor(player.teamName, idx), borderTopWidth: '2px' }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: getColor(player.teamName, idx) }}
                >
                  {player.teamName.slice(0, 1)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{player.teamName}</p>
                  <p className="text-[10px] text-gray-400">{player.totalPoints} pts</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                <div className="p-1 rounded bg-[#4DAA57]/10 border border-[#4DAA57]/20">
                  <p className="text-gray-400">Win</p>
                  <p className="font-bold text-[#4DAA57]">{player.winRate}%</p>
                </div>
                <div className="p-1 rounded bg-[#1BE7FF]/10 border border-[#1BE7FF]/20">
                  <p className="text-gray-400">Pod</p>
                  <p className="font-bold text-[#1BE7FF]">{player.podiumRate}%</p>
                </div>
                <div className="p-1 rounded bg-[#FF3A20]/10 border border-[#FF3A20]/20">
                  <p className="text-gray-400">Last</p>
                  <p className="font-bold text-[#FF3A20]">{player.lastRate}%</p>
                </div>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
