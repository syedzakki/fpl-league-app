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
import { cn } from "@/lib/utils"

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
  "Wasim": "#0d9488", // teal-600
  "Anuj": "#1e40af", // blue-800
  "Chiru": "#f97316", // orange-500
  "Zakki": "#ef4444", // red-500
  "Tejas": "#a855f7", // purple-500
  "Sunad": "#ec4899", // pink-500
}

const getColor = (name: string, index: number) => {
  return PLAYER_COLORS[name] || ["#0d9488", "#1e40af", "#f97316", "#ef4444", "#a855f7", "#ec4899"][index % 6]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-card p-2 rounded shadow-lg border border-border text-xs">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }} />
          <span className="font-bold text-foreground">{data.name}</span>
        </div>
        <div className="text-lg font-bold" style={{ color: payload[0].fill }}>{payload[0].value}</div>
      </div>
    )
  }
  return null
}

function MetricBar({ data, dataKey, title, icon: Icon, colorClass }: {
  data: any[], dataKey: string, title: string, icon: any, colorClass: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <Icon className={cn("w-3 h-3", colorClass)} />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <div className="h-[130px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 15, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.1)' }} />
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

function ProgressBar({ data, metric, label, icon: Icon, colorClass, suffix = "" }: {
  data: LeagueStats[], metric: keyof LeagueStats, label: string, icon: any, colorClass: string, suffix?: string
}) {
  const maxValue = Math.max(...data.map(d => Number(d[metric]) || 0), 1)
  const sortedData = [...data].sort((a, b) => Number(b[metric]) - Number(a[metric]))

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <Icon className={cn("w-3 h-3", colorClass)} />
        <span className="text-xs font-semibold text-foreground">{label}</span>
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
                  <span className="font-medium text-muted-foreground">{player.teamName}</span>
                  {idx === 0 && <span className="text-[10px]">🔥</span>}
                </div>
                <span className="font-bold font-mono" style={{ color: playerColor }}>{value}{suffix}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
        <Card className="p-3 border-border/50">
          <ProgressBar data={stats} metric="totalPoints" label="Total Points" icon={TrendingUp} colorClass="text-yellow-500" suffix=" pts" />
        </Card>
        <Card className="p-3 border-border/50">
          <ProgressBar data={stats} metric="averagePoints" label="Average Points" icon={Target} colorClass="text-blue-500" />
        </Card>
      </div>

      {/* Performance Breakdown */}
      <Card className="border-border/50">
        <CardHeader className="py-2 px-3 border-b border-border/50">
          <CardTitle className="text-sm flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" /> Performance Breakdown
          </CardTitle>
          <CardDescription className="text-xs">Hover for details</CardDescription>
        </CardHeader>
        <CardContent className="py-2 px-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricBar data={gwWinsData} dataKey="value" title="GW Wins" icon={Trophy} colorClass="text-yellow-500" />
            <MetricBar data={captaincyData} dataKey="value" title="Captaincy" icon={Crown} colorClass="text-green-500" />
            <MetricBar data={secondPlaceData} dataKey="value" title="2nd Place" icon={Medal} colorClass="text-blue-500" />
            <MetricBar data={lastPlaceData} dataKey="value" title="Last Place" icon={Skull} colorClass="text-destructive" />
          </div>
        </CardContent>
      </Card>

      {/* Win Rate Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {stats
          .map(s => ({
            ...s,
            winRate: completedGWs ? ((s.gwWins / completedGWs) * 100).toFixed(0) : "0",
            podiumRate: completedGWs ? (((s.gwWins + s.secondFinishes) / completedGWs) * 100).toFixed(0) : "0",
            lastRate: completedGWs ? ((s.lastFinishes / completedGWs) * 100).toFixed(0) : "0",
          }))
          .sort((a, b) => Number(b.winRate) - Number(a.winRate))
          .map((player, idx) => (
            <Card
              key={player.teamName}
              className="p-2 border-border/50 hover:border-primary/30 transition-all"
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
                  <p className="text-xs font-bold text-foreground">{player.teamName}</p>
                  <p className="text-[10px] text-muted-foreground">{player.totalPoints} pts</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                <div className="p-1 rounded bg-green-500/10 border border-green-500/20">
                  <p className="text-muted-foreground">Win</p>
                  <p className="font-bold text-green-500">{player.winRate}%</p>
                </div>
                <div className="p-1 rounded bg-blue-500/10 border border-blue-500/20">
                  <p className="text-muted-foreground">Pod</p>
                  <p className="font-bold text-blue-500">{player.podiumRate}%</p>
                </div>
                <div className="p-1 rounded bg-destructive/10 border border-destructive/20">
                  <p className="text-muted-foreground">Last</p>
                  <p className="font-bold text-destructive">{player.lastRate}%</p>
                </div>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
